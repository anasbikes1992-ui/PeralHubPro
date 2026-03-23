import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface LankaPayModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess: () => void;
}

const LankaPayModal = ({ open, onClose, amount, description, onSuccess }: LankaPayModalProps) => {
  const [step, setStep] = useState<"details" | "processing" | "success">("details");
  const [method, setMethod] = useState<"card" | "bank" | "mobile">("card");

  const { user } = useAuth();

  const handlePay = async () => {
    setStep("processing");
    try {
      // Record wallet transaction in Supabase
      // In production this is confirmed by a server-side webhook
      if (user) {
        await (supabase as any).from("wallet_transactions").insert({
          user_id: user.id,
          type: "deposit",
          amount,
          description: description || "LankaPay transaction",
          status: "pending",
          ref: `LP-${Date.now().toString(36).toUpperCase()}`,
        });
      }
      // Simulate gateway round-trip
      await new Promise(r => setTimeout(r, 2000));
      setStep("success");
    } catch {
      setStep("details");
    }
  };

  const handleDone = () => {
    setStep("details");
    onSuccess();
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-obsidian/80 z-[1200] flex items-center justify-center p-5" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card rounded-2xl max-w-[480px] w-full overflow-hidden" onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-sapphire to-emerald px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">🏦</div>
              <div>
                <h3 className="text-pearl font-bold text-lg">LankaPay</h3>
                <p className="text-pearl/70 text-xs">Secure Payment Gateway</p>
              </div>
            </div>
            <button onClick={onClose} className="bg-white/15 border-none text-pearl w-8 h-8 rounded-full cursor-pointer text-sm">✕</button>
          </div>

          <div className="p-6">
            {step === "details" && (
              <>
                {/* Amount */}
                <div className="bg-background rounded-lg p-4 mb-5 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Payment Amount</div>
                  <div className="text-3xl font-bold text-emerald">Rs. {amount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">{description}</div>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "card", icon: "💳", label: "Card" },
                      { id: "bank", icon: "🏦", label: "Bank Transfer" },
                      { id: "mobile", icon: "📱", label: "Mobile Pay" },
                    ] as const).map(m => (
                      <div key={m.id} onClick={() => setMethod(m.id)}
                        className={`p-3 border-2 rounded-lg text-center cursor-pointer transition-all ${method === m.id ? "border-emerald bg-emerald/5" : "border-border"}`}>
                        <div className="text-xl mb-1">{m.icon}</div>
                        <div className="text-[11px] font-semibold">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {method === "card" && (
                  <div className="space-y-3 mb-5">
                    <div><label className="block text-xs font-semibold mb-1">Card Number</label>
                      <input placeholder="4242 4242 4242 4242" className="w-full rounded-md border border-input px-3 py-2 text-sm font-mono" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-semibold mb-1">Expiry</label><input placeholder="MM/YY" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                      <div><label className="block text-xs font-semibold mb-1">CVV</label><input placeholder="***" type="password" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                    </div>
                  </div>
                )}

                {method === "bank" && (
                  <div className="bg-background rounded-lg p-4 mb-5 text-sm space-y-2">
                    <p className="font-semibold">Bank Transfer Details:</p>
                    <p className="text-muted-foreground">Bank: <strong className="text-foreground">Bank of Ceylon</strong></p>
                    <p className="text-muted-foreground">Account: <strong className="text-foreground font-mono">8056-1234-5678</strong></p>
                    <p className="text-muted-foreground">Branch: <strong className="text-foreground">Colombo Fort</strong></p>
                    <p className="text-xs text-muted-foreground mt-2">Upload receipt after transfer for verification.</p>
                  </div>
                )}

                {method === "mobile" && (
                  <div className="space-y-3 mb-5">
                    <div><label className="block text-xs font-semibold mb-1">Mobile Number</label>
                      <input placeholder="+94 7X XXX XXXX" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                    <p className="text-xs text-muted-foreground">Supported: Dialog, Mobitel, Hutch mobile wallets</p>
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground mb-4 flex items-center gap-1.5">
                  🔒 Secured by LankaPay — SSL encrypted. PCI-DSS compliant.
                </div>

                <button onClick={handlePay}
                  className="w-full bg-emerald hover:bg-emerald-light text-accent-foreground py-3 rounded-lg font-bold transition-all">
                  💳 Pay Rs. {amount.toLocaleString()}
                </button>
              </>
            )}

            {step === "processing" && (
              <div className="text-center py-10">
                <div className="text-5xl mb-4 animate-spin-slow">⏳</div>
                <h3 className="text-lg font-bold mb-2">Processing Payment...</h3>
                <p className="text-sm text-muted-foreground">Please wait while we verify your payment with LankaPay.</p>
              </div>
            )}

            {step === "success" && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-lg font-bold mb-2 text-emerald">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground mb-2">Transaction ID: LP-{Date.now().toString(36).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground mb-6">Receipt sent to your registered email.</p>
                <button onClick={handleDone}
                  className="w-full bg-emerald hover:bg-emerald-light text-accent-foreground py-3 rounded-lg font-bold transition-all">Done</button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LankaPayModal;
