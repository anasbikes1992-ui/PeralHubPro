import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/store/useStore";
import { UserRole } from "@/types";
import { z } from "zod";

// ── Zod validation schemas ────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  phone: z.string().regex(/^(\+94|0)[0-9]{9}$/, "Enter a valid Sri Lankan phone number (+94XXXXXXXXX or 0XXXXXXXXX)").optional().or(z.literal("")),
});

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// ── Provider role options (customer excluded — admins grant admin role) ───
const roleOptions: { value: UserRole; label: string; desc: string }[] = [
  { value: "customer",         label: "👤 Customer",        desc: "Browse & book services" },
  { value: "owner",            label: "🏠 Property Owner",  desc: "List & sell properties" },
  { value: "broker",           label: "🏢 Licensed Broker", desc: "Manage multiple listings" },
  { value: "stay_provider",    label: "🏨 Stay Provider",   desc: "Hotels, villas, guest houses" },
  { value: "vehicle_provider", label: "🚗 Vehicle Provider",desc: "Cars, vans, rentals" },
  { value: "event_provider",   label: "🎫 Event Provider",  desc: "List & manage events" },
  { value: "sme",              label: "🏪 SME / Business",  desc: "Local goods & services" },
];

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [role, setRole]         = useState<UserRole>("customer");
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg]   = useState("");

  const { signIn, signUp, resetPassword, user, profile } = useAuth();
  const { setCurrentUser, setUserRole, addNotification } = useStore();
  const navigate = useNavigate();

  // ── Sync Supabase session → Zustand store ────────────────
  useEffect(() => {
    if (user && profile) {
      setCurrentUser({
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role as UserRole,
        verified: profile.verified,
        balance: 0,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        nic: profile.nic,
      });
      setUserRole(profile.role as UserRole);
      // Redirect based on role
      if (profile.role === "admin") navigate("/admin", { replace: true });
      else if (profile.role === "customer") navigate("/dashboard", { replace: true });
      else navigate("/provider", { replace: true });
    }
  }, [user, profile]);

  const clearErrors = () => {
    setFieldErrors({});
    setServerError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // ── Client-side validation ────────────────────────────
    if (mode === "login") {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.errors.forEach(err => { errs[err.path[0] as string] = err.message; });
        setFieldErrors(errs);
        return;
      }
    } else if (mode === "signup") {
      if (!agreed) { setServerError("You must agree to the Terms & Conditions to continue."); return; }
      const result = signupSchema.safeParse({ email, password, name, phone });
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.errors.forEach(err => { errs[err.path[0] as string] = err.message; });
        setFieldErrors(errs);
        return;
      }
    } else {
      const result = forgotSchema.safeParse({ email });
      if (!result.success) {
        setFieldErrors({ email: result.error.errors[0]?.message || "Invalid email" });
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email.trim().toLowerCase());
        if (error) throw error;
        setSuccessMsg("Password reset link sent — check your email.");
        setMode("login");

      } else if (mode === "signup") {
        const { error } = await signUp(
          email.trim().toLowerCase(),
          password,
          { full_name: name.trim(), phone: phone.trim(), role }
        );
        if (error) throw error;
        setSuccessMsg("Account created! Please check your email to confirm your address before signing in.");
        setMode("login");
        addNotification("Welcome to Pearl Hub!", "Confirm your email to activate your account.");

      } else {
        const { error } = await signIn(email.trim().toLowerCase(), password);
        if (error) throw error;
        // Navigation handled by the useEffect above once profile loads
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Something went wrong. Please try again.";
      // Provide human-friendly messages for common Supabase errors
      if (msg.includes("Invalid login credentials")) {
        setServerError("Incorrect email or password.");
      } else if (msg.includes("Email not confirmed")) {
        setServerError("Please confirm your email address before signing in. Check your inbox.");
      } else if (msg.includes("User already registered")) {
        setServerError("An account with this email already exists. Try signing in instead.");
      } else {
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-obsidian via-slate to-sapphire items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/[0.04]" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-emerald/[0.06]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-gold-dark rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-gold-glow">
            <img src="/favicon.png" alt="Pearl Hub" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="font-display text-pearl font-bold text-4xl mb-4">Pearl Hub</h1>
          <p className="text-fog text-lg max-w-md leading-relaxed">Sri Lanka's #1 marketplace for properties, stays, vehicles, and events.</p>
          <div className="flex gap-6 justify-center mt-8">
            {[{ v: "12,400+", l: "Properties" }, { v: "3,200+", l: "Stays" }, { v: "1,800+", l: "Vehicles" }].map(s => (
              <div key={s.l} className="text-center">
                <div className="font-display text-2xl font-bold text-primary">{s.v}</div>
                <div className="text-xs text-fog">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <img src="/favicon.png" alt="Pearl Hub" className="w-10 h-10 object-contain" />
            <div className="font-display font-bold text-xl">Pearl Hub</div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold mb-1">
                {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {mode === "login" ? "Sign in to your Pearl Hub account" : mode === "signup" ? "Join Sri Lanka's premier marketplace" : "We'll send a reset link to your email"}
              </p>

              {/* Global status messages */}
              {serverError && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {serverError}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
                {mode === "signup" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Full Name *</label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        autoComplete="name"
                        placeholder="Nimal Perera"
                        maxLength={100}
                        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-card ${fieldErrors.name ? "border-destructive" : "border-input"}`}
                      />
                      {fieldErrors.name && <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Phone Number</label>
                      <input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        autoComplete="tel"
                        placeholder="+94 77 123 4567"
                        maxLength={15}
                        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-card ${fieldErrors.phone ? "border-destructive" : "border-input"}`}
                      />
                      {fieldErrors.phone && <p className="text-xs text-destructive mt-1">{fieldErrors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Account Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {roleOptions.map(r => (
                          <div
                            key={r.value}
                            onClick={() => setRole(r.value)}
                            className={`p-2.5 border-2 rounded-lg cursor-pointer transition-all ${role === r.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                          >
                            <div className="text-xs font-bold">{r.label}</div>
                            <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">Admin roles are granted by the platform after account verification.</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    maxLength={254}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-card ${fieldErrors.email ? "border-destructive" : "border-input"}`}
                  />
                  {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
                </div>

                {mode !== "forgot" && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder="••••••••"
                      minLength={mode === "signup" ? 8 : 6}
                      maxLength={72}
                      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-card ${fieldErrors.password ? "border-destructive" : "border-input"}`}
                    />
                    {fieldErrors.password && <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>}
                    {mode === "signup" && (
                      <p className="text-[10px] text-muted-foreground mt-1">Minimum 8 characters.</p>
                    )}
                  </div>
                )}

                {mode === "login" && (
                  <button type="button" onClick={() => { clearErrors(); setMode("forgot"); }} className="text-xs text-primary font-semibold self-end -mt-1">
                    Forgot password?
                  </button>
                )}

                {mode === "signup" && (
                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span>
                      I agree to the{" "}
                      <button type="button" onClick={() => window.open("/terms", "_blank")} className="text-primary font-semibold underline">Terms & Conditions</button>
                      {" "}and{" "}
                      <button type="button" onClick={() => window.open("/privacy", "_blank")} className="text-primary font-semibold underline">Privacy Policy</button>
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-gold-dark text-primary-foreground py-3 rounded-lg font-bold text-sm mt-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Please wait…"
                    : mode === "login"
                    ? "Sign In"
                    : mode === "signup"
                    ? "Create Account"
                    : "Send Reset Link"}
                </button>
              </form>

              <div className="text-center mt-5 text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>Don't have an account? <button onClick={() => { clearErrors(); setMode("signup"); }} className="text-primary font-semibold">Sign up</button></>
                ) : mode === "signup" ? (
                  <>Already have an account? <button onClick={() => { clearErrors(); setMode("login"); }} className="text-primary font-semibold">Sign in</button></>
                ) : (
                  <button onClick={() => { clearErrors(); setMode("login"); }} className="text-primary font-semibold">← Back to sign in</button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
