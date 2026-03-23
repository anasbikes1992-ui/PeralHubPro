import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// ── Profile shape coming from Supabase profiles table ─────────
export interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;          // matches app_role enum: customer | owner | broker | admin | stay_provider | vehicle_provider | event_provider | sme
  avatar_url: string;
  nic: string;
  verified: boolean;
  verification_badges?: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  loading: boolean;
  signUp:        (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error: Error | null }>;
  signIn:        (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut:       () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // Profile may not exist yet for brand-new signups — not fatal
      console.warn("Profile fetch:", error.message);
      return;
    }
    if (data) setProfile(data as ProfileData);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    // ── Subscribe to auth state changes ───────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);

        if (sess?.user) {
          // Defer slightly to avoid a Supabase deadlock on initial load
          setTimeout(() => fetchProfile(sess.user.id), 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // ── Hydrate from existing session on mount ────────────
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) fetchProfile(sess.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── signUp ─────────────────────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, string>
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    return { error: error as Error | null };
  };

  // ── signIn ─────────────────────────────────────────────
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  // ── signOut ────────────────────────────────────────────
  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  // ── resetPassword ──────────────────────────────────────
  const resetPassword = async (
    email: string
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
