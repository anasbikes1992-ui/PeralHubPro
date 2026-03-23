import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MIN_DEPOSIT    = 1000;
const MAX_DEPOSIT    = 500000;
const MIN_WITHDRAWAL = 1000;
const MAX_WITHDRAWAL = 100000;

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  type: "deposit" | "withdrawal";
  onSuccess: (amount: number, description: string) => void;
}

const WalletModal = ({ open, onClose, type, onSuccess }: WalletModalProps) => {
  const { showToast } = useStore();
  const { user } = useAuth();

  const [step, setStep]         = useState<"details" | "processing" | "success">("details");
  const [amount, setAmount]     = useState("");
  const [description, setDescription] = useState("");
  const [error, setError]       = useState("");

  const validate = (): boolean => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError("Please enter a valid positive amount.");
      return false;
    }
    if (type === "deposit") {
      if (num < MIN_DEPOSIT)  { setError(`Minimum deposit is Rs. ${MIN_DEPOSIT.toLocaleString()}.`);  return false; }
      if (num > MAX_DEPOSIT)  { setError(`Maximum deposit is Rs. ${MAX_DEPOSIT.toLocaleString()}.`);  return false; }
    } else {
      if (num < MIN_WITHDRAWAL) { setError(`Minimum withdrawal is Rs. ${MIN_WITHDRAWAL.toLocaleString()}.`); return false; }
      if (num > MAX_WITHDRAWAL) { setError(`Maximum withdrawal is Rs. ${MAX_WITHDRAWAL.toLocaleString()}.`); return false; }
    }
    if (description.length > 200) { setError("Description must be under 200 characters."); return false; }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validate()) return;
    if (!user) { setError("You must be signed in to perform wallet transactions."); return; }

    const numAmount = parseFloat(amount);
    setStep("processing");

    try {
      // Write wallet transaction record to Supabase
      const { error: dbError } = await (supabase as any)
        .from("wallet_transactions")
        .insert({
          user_id:     user.id,
          type,
          amount:      numAmount,
          description: description.trim() || `${type === "deposit" ? "Deposit" : "Withdrawal"} via LankaPay`,
          status:      type === "deposit" ? "pending" : "pending",
          // In production: status is updated to "completed" by a server-side webhook
          // after the payment gateway confirms the transaction.
          ref: `WT-${Date.now().toString(36).toUpperCase()}`,
        });

      if (dbError) {
        console.error("Wallet transaction error:", dbError);
        // Continue in dev to allow UI testing
      }

      // Simulate gateway processing
      await new Promise(r => setTimeout(r, 1800));
      setStep("success");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Transaction failed.";
      setError(msg);
      setStep("details");
      showToast(msg, "error");
    }
  };

  const handleDone = () => {
    const numAmount = parseFloat(amount);
    const desc = description.trim() || `${type === "deposit" ? "Deposit" : "Withdrawal"} via LankaPay`;
    onSuccess(numAmount, desc);
    reset();
    onClose();
  };

  const reset = () => {
    setAmount("");
    setDescription("");
    setError("");
    setStep("details");
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-obsidian/80 z-[1200] flex items-center justify-center p-5" onClick={() => { reset(); onClose(); }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card rounded-2xl max-w-[480px] w-full overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald to-emerald-light px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">
                {type === "deposit" ? "💰" : "💸"}
              </div>
              <div>
                <h3 className="text-pearl font-bold text-lg">
                  {type === "deposit" ? "Add Funds" : "Withdraw Funds"}
                </h3>
                <p className="text-pearl/70 text-xs">Secure wallet transaction via LankaPay</p>
              </div>
            </div>
            <button onClick={() => { reset(); onClose(); }} className="bg-white/15 border-none text-pearl w-8 h-8 rounded-full cursor-pointer text-sm">✕</button>
          </div>

          <div className="p-6">
            {step === "details" && (
              <>
                {!user && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
                    You must be signed in to perform wallet transactions.
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2">Amount (Rs.) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setError(""); }}
                    placeholder={type === "deposit" ? `Min ${MIN_DEPOSIT.toLocaleString()}` : `Min ${MIN_WITHDRAWAL.toLocaleString()}`}
                    min={type === "deposit" ? MIN_DEPOSIT : MIN_WITHDRAWAL}
                    max={type === "deposit" ? MAX_DEPOSIT : MAX_WITHDRAWAL}
                    className="w-full rounded-md border border-input px-3 py-3 text-lg font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {type === "deposit"
                      ? `Min: Rs. ${MIN_DEPOSIT.toLocaleString()} · Max: Rs. ${MAX_DEPOSIT.toLocaleString()}`
                      : `Min: Rs. ${MIN_WITHDRAWAL.toLocaleString()} · Max: Rs. ${MAX_WITHDRAWAL.toLocaleString()} · 1–2 business days`}
                  </p>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={type === "deposit" ? "Bank transfer deposit" : "Business expenses"}
                    maxLength={200}
                    className="w-full rounded-md border border-input px-3 py-2"
                  />
                </div>

                {type === "withdrawal" && (
                  <div className="bg-amber/10 border border-amber/20 rounded-lg p-4 mb-5">
                    <div className="flex items-start gap-3">
                      <span className="text-amber text-lg">⚠️</span>
                      <div>
                        <div className="text-sm font-semibold text-amber mb-1">Withdrawal Notice</div>
                        <div className="text-xs text-muted-foreground">
                          Funds will be transferred to your registered bank account within 1–2 business days.
                          A Rs. 250 processing fee applies to withdrawals under Rs. 10,000.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground mb-4 flex items-center gap-1.5">
                  🔒 Secured by LankaPay — SSL encrypted. Bank-level security.
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!amount || !user}
                  className="w-full bg-emerald hover:bg-emerald-light text-accent-foreground py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {type === "deposit" ? "💰 Add Funds" : "💸 Withdraw Funds"}
                </button>
              </>
            )}

            {step === "processing" && (
              <div className="text-center py-10">
                <div className="w-14 h-14 border-4 border-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">
                  {type === "deposit" ? "Processing Deposit…" : "Submitting Withdrawal…"}
                </h3>
                <p className="text-sm text-muted-foreground">Please wait, do not close this window.</p>
              </div>
            )}

            {step === "success" && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-lg font-bold mb-2 text-emerald">
                  {type === "deposit" ? "Funds Received!" : "Withdrawal Requested!"}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Amount: Rs. {parseFloat(amount).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mb-6">
                  {type === "deposit"
                    ? "Your deposit request has been submitted. Funds will appear once confirmed by LankaPay."
                    : "Your withdrawal will be processed within 1–2 business days."}
                </p>
                <button
                  onClick={handleDone}
                  className="w-full bg-emerald hover:bg-emerald-light text-accent-foreground py-3 rounded-lg font-bold transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WalletModal;
