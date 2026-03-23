# PEARL HUB PRO

Sri Lanka's premier multi-vertical marketplace — properties, stays, vehicles, events, SME, and social.

**Stack:** React 19 · TypeScript · Vite · Supabase · Zustand · TanStack Query · Tailwind CSS · shadcn/ui

---

## Getting Started

### 1. Clone and install

```bash
git clone <YOUR_GIT_URL>
cd PEARL-HUB-PRO-main
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase dashboard → Project Settings → API (anon key) |
| `VITE_SUPABASE_PROJECT_ID` | Supabase dashboard → Project Settings → General |

**Optional — AI Concierge (local dev only):**

```bash
# .env.local  (never commit this)
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> ⚠️ In production, the Anthropic API key must be in a **Supabase Edge Function**, not in a Vite env var. The browser bundle would expose it otherwise.

### 3. Run Supabase migrations

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

### 4. Run locally

```bash
npm run dev
```

---

## Security Hardening Applied (Phase 1)

| Issue | Fix |
|---|---|
| `.env` with live secrets committed | Scrubbed; `.env` now in `.gitignore` |
| Mock `setTimeout` login | Real Supabase `signInWithPassword` / `signUp` via `AuthContext` |
| Client-side admin role check | `RequireAuth` verifies real Supabase session; RLS enforces server-side |
| No image validation | MIME type + extension + 5MB size guard in `ImageUpload` |
| Mock payment flows | `CheckoutModal` / `WalletModal` write to `bookings` / `wallet_transactions` tables |
| Reviews unverified | `ReviewSection` checks for completed booking via RLS policy + client check |
| No input validation | Zod schemas in `src/lib/validation.ts` used across forms |
| Admin self-promotion | `handle_new_user()` trigger blocks `admin` role on signup |

## Architecture

```
Supabase (PostgreSQL + Auth + Storage + RLS)
    ↕ React Query (cache + background refetch)
Zustand (UI state only: favorites, toasts, compare)
    ↕ React components
```

**Listing pages** (`StaysPage`, `VehiclesPage`, `EventsPage`, `PropertyPage`) now read from Supabase via React Query hooks in `src/hooks/useListings.ts`. The Zustand store is UI-state only.

## Payment Integration (Next Step)

Payment flows create `bookings` rows with `status: 'pending'`. To complete the integration:

1. **Choose a gateway:** PayHere (LKR) or Stripe (USD/EUR/international)
2. **Create a Supabase Edge Function** at `supabase/functions/payment-webhook/`
3. **Verify HMAC signature** from the gateway in the Edge Function
4. **Update booking status** to `'confirmed'` and create an `earnings` row in the same transaction

## AI Concierge

The `AIConcierge` component calls the Anthropic API. In production:

1. Create `supabase/functions/ai-concierge/index.ts`
2. Move the API call there with `ANTHROPIC_API_KEY` as a Supabase secret
3. Uncomment the Edge Function call in `AIConcierge.tsx` and comment out the direct call

## Database Migrations

| Migration | Purpose |
|---|---|
| `phase_0_security_admin_foundations` | `user_reports`, `request_logs`, `admin_actions`, `bookings`, `earnings` |
| `create_properties_listings` | Properties table with RLS |
| `create_social_listings` | Social/community listings |
| `create_wallet_transactions` | Wallet transaction ledger |
| `phase_1_security_hardening` | Booking overlap constraint, reviews (verified only), seat holds, SME tables, input constraints, admin role promotion function |
| `phase_2_data_layer` | Performance indexes, vehicle/stay type columns, `handle_new_user` trigger with role from metadata, `can_review_listing` function |

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint check
npm run test         # Vitest unit tests
```
