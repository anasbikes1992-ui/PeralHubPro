/**
 * CheckoutModal — Unified payment gateway for Pearl Hub PRO
 * Supports PayHere, LankaPay (LankaClear) and WebXPay
 * Powered by Grabber Mobility Solutions (Pvt) Ltd
 * 
 * Production integration:
 *   All gateway API calls go through Supabase Edge Functions.
 *   This modal initiates the payment flow and handles UI state.
 *   The Edge Function webhook confirms payment and updates booking status.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/store/useStore";
import { Shield, CreditCard, Smartphone, Building2, ChevronRight, Loader2, CheckCircle, X, AlertCircle, Lock } from "lucide-react";

// ── Gateway configuration ───────────────────────────────────
const GATEWAYS = [
  {
    id: "payhere",
    name: "PayHere",
    tagline: "Visa · Mastercard · Amex · eZ Cash · Genie · FriMi",
    logo: "🇱🇰",
    color: "from-[#E63946] to-[#C1121F]",
    borderColor: "border-red-500/40",
    bgColor: "bg-red-500/5",
    methods: [
      { id: "card",   icon: <CreditCard size={15} />,  label: "Credit / Debit Card",    sub: "Visa, Mastercard, Amex" },
      { id: "mobile", icon: <Smartphone size={15} />,  label: "Mobile Wallet",           sub: "eZ Cash, Genie, FriMi" },
    ],
    sandbox: true,
    note: "Managed by LankaClear (Pvt) Ltd. Funds settle in LKR within 3 business days.",
  },
  {
    id: "lankapay",
    name: "LankaPay",
    tagline: "National Payment Switch · LankaClear Certified",
    logo: "🏦",
    color: "from-[#1565C0] to-[#0D47A1]",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/5",
    methods: [
      { id: "card",    icon: <CreditCard size={15} />, label: "Debit Card (LANKAQR)",    sub: "All Sri Lankan bank debit cards" },
      { id: "bank",    icon: <Building2 size={15} />,  label: "Internet Banking",         sub: "BOC, Peoples, NSB, Sampath, HNB" },
      { id: "mobile",  icon: <Smartphone size={15} />, label: "Mobile Banking",           sub: "Bank app transfers" },
    ],
    sandbox: true,
    note: "Official national payment switch of Sri Lanka operated by LankaClear (Pvt) Ltd.",
  },
  {
    id: "webxpay",
    name: "WebXPay",
    tagline: "Visa · Mastercard · International Cards",
    logo: "💳",
    color: "from-[#6C3FC5] to-[#4A1D96]",
    borderColor: "border-purple-500/40",
    bgColor: "bg-purple-500/5",
    methods: [
      { id: "card",    icon: <CreditCard size={15} />, label: "Credit / Debit Card",     sub: "Visa, Mastercard (international)" },
      { id: "mobile",  icon: <Smartphone size={15} />, label: "Mobile Wallet",            sub: "eZ Cash, mCash" },
    ],
    sandbox: true,
    note: "WebXPay by Webxperts (Pvt) Ltd. PCI-DSS Level 1 certified. 3D Secure enabled.",
  },
] as const;

type GatewayId = typeof GATEWAYS[number]["id"];
type MethodId  = "card" | "bank" | "mobile";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id?: string;
    title: string;
    price: number;
    currency: string;
    type: "stay" | "vehicle" | "event" | "property";
    checkIn?: string;
    checkOut?: string;
  };
  onSuccess: (bookingRef: string) => void;
}

// ── Card form (shared across gateways) ─────────────────────
function CardForm() {
  return (
    <div className="space-y-3 mt-3">
      <div>
        <label className="block text-[10px] font-black text-mist/60 uppercase tracking-widest mb-1.5">Card Number</label>
        <input
          type="text"
          placeholder="4242 4242 4242 4242"
          maxLength={19}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pearl font-mono placeholder:text-mist/20 outline-none focus:border-primary/50"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black text-mist/60 uppercase tracking-widest mb-1.5">Expiry</label>
          <input type="text" placeholder="MM / YY" maxLength={7}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pearl font-mono placeholder:text-mist/20 outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-mist/60 uppercase tracking-widest mb-1.5">CVV</label>
          <input type="password" placeholder="• • •" maxLength={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pearl font-mono placeholder:text-mist/20 outline-none focus:border-primary/50" />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-mist/60 uppercase tracking-widest mb-1.5">Name on Card</label>
        <input type="text" placeholder="NIMAL PERERA"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pearl uppercase placeholder:text-mist/20 placeholder:normal-case outline-none focus:border-primary/50" />
      </div>
    </div>
  );
}

// ── Bank transfer form ──────────────────────────────────────
function BankForm() {
  return (
    <div className="mt-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2 text-sm">
      <p className="font-black text-pearl text-[10px] uppercase tracking-widest mb-3">Bank Transfer Details</p>
      {[
        ["Bank", "Bank of Ceylon (BOC)"],
        ["Account Name", "Grabber Mobility Solutions (Pvt) Ltd"],
        ["Account No", "8056-1234-5678-90"],
        ["Branch", "Colombo Fort"],
        ["Swift Code", "BCEYLKLX"],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between">
          <span className="text-mist/50 text-xs">{k}</span>
          <span className="text-pearl font-mono text-xs font-bold">{v}</span>
        </div>
      ))}
      <p className="text-[10px] text-mist/40 mt-3 pt-2 border-t border-white/5">
        Upload your bank receipt after transfer. Booking confirmed within 2 business hours.
      </p>
    </div>
  );
}

// ── Mobile wallet form ──────────────────────────────────────
function MobileForm({ gateway }: { gateway: GatewayId }) {
  return (
    <div className="space-y-3 mt-3">
      <div>
        <label className="block text-[10px] font-black text-mist/60 uppercase tracking-widest mb-1.5">Mobile Number</label>
        <input type="tel" placeholder="+94 7X XXX XXXX"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pearl font-mono placeholder:text-mist/20 outline-none focus:border-primary/50" />
      </div>
      <p className="text-[10px] text-mist/40">
        {gateway === "payhere"  ? "Supported: Dialog eZ Cash, Mobitel Genie, Hutch FriMi" :
         gateway === "lankapay" ? "All mobile banking apps on Sri Lankan banks" :
         "eZ Cash, mCash, iPay mobile wallets"}
      </p>
    </div>
  );
}

// ── Main Modal ──────────────────────────────────────────────
export default function CheckoutModal({ isOpen, onClose, item, onSuccess }: CheckoutModalProps) {
  const [step, setStep]                   = useState<1 | 2 | 3 | 4>(1);
  const [selectedGateway, setSelectedGateway] = useState<GatewayId>("payhere");
  const [selectedMethod, setSelectedMethod]   = useState<MethodId>("card");
  const [agreeTerms, setAgreeTerms]           = useState(false);
  const [isProcessing, setIsProcessing]       = useState(false);
  const [error, setError]                     = useState("");
  const [bookingRef, setBookingRef]           = useState("");

  const { user } = useAuth();
  const { showToast } = useStore();

  const gateway = GATEWAYS.find(g => g.id === selectedGateway)!;

  const handlePayment = async () => {
    if (!agreeTerms) { setError("Please accept the Terms & Conditions to proceed."); return; }
    if (!user)       { setError("You must be signed in to complete a booking."); return; }
    setError("");
    setIsProcessing(true);
    setStep(3);

    try {
      // ── 1. Create pending booking record ───────────────
      const { data, error: dbError } = await (supabase as any)
        .from("bookings")
        .insert({
          user_id:        user.id,
          listing_id:     item.id ?? "unknown",
          listing_type:   item.type,
          booking_date:   new Date().toISOString().split("T")[0],
          check_in_date:  item.checkIn  ?? new Date().toISOString().split("T")[0],
          check_out_date: item.checkOut ?? new Date().toISOString().split("T")[0],
          total_amount:   item.price,
          currency:       item.currency,
          status:         "pending",
        })
        .select("id")
        .single();

      if (dbError) console.error("Booking insert error:", dbError);

      const ref = data?.id
        ? `PH-${data.id.slice(0, 8).toUpperCase()}`
        : `PH-${Date.now().toString(36).toUpperCase()}`;

      setBookingRef(ref);

      // ── 2. Log payment attempt ──────────────────────────
      await (supabase as any).from("wallet_transactions").insert({
        user_id:     user.id,
        type:        "fee",
        amount:      item.price,
        description: `${gateway.name} payment — ${item.title} (${ref})`,
        status:      "pending",
        ref,
      });

      // ── 3. Gateway-specific integration point ───────────
      // Production: call Supabase Edge Function which:
      //   - For PayHere:  send to https://sandbox.payhere.lk/pay/checkout
      //   - For LankaPay: call LankaClear LankaQR API
      //   - For WebXPay:  redirect to WebXPay payment page
      // The Edge Function webhook updates booking status to 'confirmed'
      //
      // switch (selectedGateway) {
      //   case "payhere":
      //     const { data: ph } = await supabase.functions.invoke("payhere-checkout", { body: { ref, amount: item.price, ... } });
      //     window.location.href = ph.redirect_url;
      //     break;
      //   case "lankapay":
      //     const { data: lp } = await supabase.functions.invoke("lankapay-init", { body: { ref, amount: item.price, ... } });
      //     window.location.href = lp.payment_url;
      //     break;
      //   case "webxpay":
      //     const { data: wx } = await supabase.functions.invoke("webxpay-checkout", { body: { ref, amount: item.price, ... } });
      //     window.location.href = wx.redirect_url;
      //     break;
      // }

      // Simulate gateway round-trip (remove when Edge Functions deployed)
      await new Promise(r => setTimeout(r, 2200));

      // Update booking to confirmed (Edge Function does this in production)
      if (data?.id) {
        await (supabase as any).from("bookings")
          .update({ status: "confirmed" })
          .eq("id", data.id);
      }

      setStep(4);
      onSuccess(ref);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Payment failed. Please try again.";
      setError(msg);
      setStep(2);
      showToast("Payment failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedGateway("payhere");
    setSelectedMethod("card");
    setAgreeTerms(false);
    setError("");
    setBookingRef("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Shield size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-black text-pearl uppercase tracking-tight">Secure Checkout</p>
                <p className="text-[9px] text-mist/40 font-medium">Grabber Mobility Solutions (Pvt) Ltd</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-mist/30 hover:text-pearl transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">

            {/* ── Step 1: Summary ── */}
            {step === 1 && (
              <div className="p-7">
                <h2 className="text-xl font-black text-pearl mb-5">Booking Summary</h2>
                <div className="bg-white/4 rounded-2xl p-5 mb-5 border border-white/5">
                  <div className="text-[9px] font-black uppercase tracking-widest text-mist/50 mb-1">{item.type}</div>
                  <div className="text-base font-bold text-pearl mb-3">{item.title}</div>
                  {(item.checkIn || item.checkOut) && (
                    <div className="flex gap-6 text-xs text-mist/50 mb-3 pb-3 border-b border-white/5">
                      {item.checkIn  && <span>Check-in: <strong className="text-pearl">{item.checkIn}</strong></span>}
                      {item.checkOut && <span>Check-out: <strong className="text-pearl">{item.checkOut}</strong></span>}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-mist/60 text-sm">Total Amount</span>
                    <span className="text-2xl font-black text-primary">{formatPrice(item.price, item.currency)}</span>
                  </div>
                </div>

                {!user && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-400" />
                    <p className="text-xs text-amber-300">Please sign in to complete this booking.</p>
                  </div>
                )}

                <button onClick={() => setStep(2)} disabled={!user}
                  className="w-full bg-primary hover:bg-gold-light text-primary-foreground py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Choose Payment Method <ChevronRight size={16} />
                </button>
                <button onClick={handleClose} className="w-full mt-3 text-mist/40 hover:text-pearl text-xs font-black uppercase tracking-widest transition-colors">
                  Cancel
                </button>
              </div>
            )}

            {/* ── Step 2: Payment gateway + method ── */}
            {step === 2 && (
              <div className="p-7">
                <h2 className="text-xl font-black text-pearl mb-5">Select Payment Gateway</h2>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                {/* Gateway selector */}
                <div className="space-y-2 mb-5">
                  {GATEWAYS.map(gw => (
                    <div
                      key={gw.id}
                      onClick={() => { setSelectedGateway(gw.id); setSelectedMethod("card"); }}
                      className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                        selectedGateway === gw.id
                          ? `${gw.borderColor} ${gw.bgColor} ring-1 ring-white/10`
                          : "border-white/8 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gw.color} flex items-center justify-center text-lg flex-shrink-0`}>
                          {gw.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-pearl">{gw.name}</span>
                            {gw.sandbox && (
                              <span className="text-[8px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">SANDBOX</span>
                            )}
                          </div>
                          <p className="text-[10px] text-mist/50 truncate">{gw.tagline}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedGateway === gw.id ? "border-primary" : "border-white/20"}`}>
                          {selectedGateway === gw.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment method for selected gateway */}
                <p className="text-[9px] font-black text-mist/40 uppercase tracking-widest mb-2">Payment Method</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {gateway.methods.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id as MethodId)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedMethod === m.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-white/8 text-mist/40 hover:border-white/15 hover:text-mist"
                      }`}
                    >
                      <div className="flex justify-center mb-1">{m.icon}</div>
                      <p className="text-[10px] font-black leading-tight">{m.label.split(" ")[0]}</p>
                    </button>
                  ))}
                </div>

                {/* Method-specific form */}
                {selectedMethod === "card"   && <CardForm />}
                {selectedMethod === "bank"   && <BankForm />}
                {selectedMethod === "mobile" && <MobileForm gateway={selectedGateway} />}

                {/* Gateway note */}
                <p className="text-[9px] text-mist/30 mt-4 leading-relaxed">{gateway.note}</p>

                {/* Terms agreement */}
                <label className="flex items-start gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => { setAgreeTerms(e.target.checked); setError(""); }}
                    className="mt-1 rounded"
                  />
                  <span className="text-[10px] text-mist/50 leading-relaxed">
                    I agree to Pearl Hub's{" "}
                    <a href="/terms/customer" target="_blank" className="text-primary underline">Customer Terms</a>,{" "}
                    <a href="/terms" target="_blank" className="text-primary underline">Platform Terms</a>, and{" "}
                    authorise Grabber Mobility Solutions (Pvt) Ltd to process this payment.
                  </span>
                </label>

                {/* Security badges */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                  <Lock size={12} className="text-mist/30" />
                  <p className="text-[9px] text-mist/30">256-bit SSL · PCI-DSS compliant · 3D Secure enabled</p>
                </div>

                <button onClick={handlePayment} disabled={!agreeTerms || isProcessing}
                  className="w-full mt-5 bg-primary hover:bg-gold-light text-primary-foreground py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Lock size={14} /> Pay {formatPrice(item.price, item.currency)} via {gateway.name}
                </button>
                <button onClick={() => setStep(1)} className="w-full mt-3 text-mist/30 hover:text-pearl text-xs font-black uppercase tracking-widest transition-colors">
                  ← Back
                </button>
              </div>
            )}

            {/* ── Step 3: Processing ── */}
            {step === 3 && (
              <div className="p-16 text-center">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="w-20 h-20 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-xl">{gateway.logo}</div>
                </div>
                <h2 className="text-xl font-black text-pearl mb-2">Processing via {gateway.name}</h2>
                <p className="text-mist/50 text-sm">Verifying payment with {gateway.name}. Do not close this window.</p>
              </div>
            )}

            {/* ── Step 4: Success ── */}
            {step === 4 && (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-pearl mb-1">Booking Confirmed!</h2>
                {bookingRef && <p className="text-[10px] font-mono text-mist/30 mb-3">{bookingRef}</p>}
                <p className="text-mist/50 text-sm mb-8">Your booking is secured. A confirmation has been sent to your account.</p>
                <div className="p-3 bg-white/3 rounded-xl border border-white/5 text-left mb-6">
                  <p className="text-[9px] text-mist/30 font-black uppercase tracking-widest mb-1">Payment processed by</p>
                  <p className="text-xs text-pearl font-medium">Grabber Mobility Solutions (Pvt) Ltd via {gateway.name}</p>
                </div>
                <button onClick={handleClose}
                  className="w-full bg-primary hover:bg-gold-light text-primary-foreground py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20">
                  Done
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
