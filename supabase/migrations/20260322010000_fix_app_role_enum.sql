-- Fix app_role enum to include all roles used in the application
-- Original enum: customer | owner | broker | admin | stay_provider | event_organizer | sme
-- Missing: vehicle_provider | event_provider

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vehicle_provider';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'event_provider';

-- Rename event_organizer → event_provider for consistency
-- (Can't rename enum values in Postgres — we add the new one and map existing rows)
UPDATE public.profiles    SET role = 'event_provider' WHERE role::text = 'event_organizer';
UPDATE public.user_roles  SET role = 'event_provider' WHERE role::text = 'event_organizer';

-- Update the handle_new_user trigger to use the role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role app_role := 'customer';
  v_raw_role TEXT;
BEGIN
  -- Read role from signup metadata (set by AuthPage.tsx)
  v_raw_role := NEW.raw_user_meta_data->>'role';

  -- Whitelist allowed self-assigned roles (admin CANNOT be self-assigned)
  IF v_raw_role IN (
    'customer', 'owner', 'broker',
    'stay_provider', 'vehicle_provider', 'event_provider', 'sme'
  ) THEN
    v_role := v_raw_role::app_role;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    v_role
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name  = EXCLUDED.full_name,
        email      = EXCLUDED.email,
        phone      = EXCLUDED.phone,
        role       = EXCLUDED.role,
        updated_at = now();

  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Ensure the trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

