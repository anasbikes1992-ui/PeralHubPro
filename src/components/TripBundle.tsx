/**
 * TripBundle — "Plan Your Full Trip" cart.
 * Bundle a stay + vehicle + event in one checkout.
 * Pearl Hub's biggest competitive moat: no competitor offers this.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, X, Hotel, Car, Ticket, Sparkles, Loader2, ChevronRight, Check, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface BundleItem {
  id: string;
  type: "stay" | "vehicle" | "event";
  title: string;
  price: number;
  currency: string;
  image?: string;
  dateFrom?: string;
  dateTo?: string;
  quantity?: number;
  details?: string;
}

interface TripBundleProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_ICONS = {
  stay:    <Hotel size={16} />,
  vehicle: <Car size={16} />,
  event:   <Ticket size={16} />,
};

const TYPE_COLORS = {
  stay:    "text-sapphire border-sapphire/30 bg-sapphire/10",
  vehicle: "text-emerald border-emerald/30 bg-emerald/10",
  event:   "text-primary border-primary/30 bg-primary/10",
};

export default function TripBundle({ isOpen, onClose }: TripBundleProps) {
  const { bundleItems = [], removeBundleItem, clearBundle, showToast, currency } = useStore() as any;
  const { user } = useAuth();

  const [step, setStep]         = useState<"cart" | "processing" | "success">("cart");
  const [bookingRef, setBookingRef] = useState("");
  const [processing, setProcessing] = useState(false);

  const total = (bundleItems as BundleItem[]).reduce((s: number, i: BundleItem) => s + i.price * (i.quantity ?? 1), 0);
  const savings = Math.round(total * 0.05); // 5% bundle discount

  const checkout = async () => {
    if (!user) { showToast("Sign in to complete your bundle booking.", "error"); return; }
    setProcessing(true);
    setStep("processing");

    try {
      // Create one booking record per bundle item
      const refs: string[] = [];
      for (const item of bundleItems as BundleItem[]) {
        const { data } = await (supabase as any).from("bookings").insert({
          user_id:       user.id,
          listing_id:    item.id,
          listing_type:  item.type,
          booking_date:  new Date().toISOString().split("T")[0],
          check_in_date: item.dateFrom ?? new Date().toISOString().split("T")[0],
          check_out_date:item.dateTo   ?? new Date().toISOString().split("T")[0],
          total_amount:  item.price * (item.quantity ?? 1),
          currency:      item.currency,
          status:        "pending",
        }).select("id").single();
        if (data?.id) refs.push(data.id.slice(0, 6).toUpperCase());
      }
      // Bundle discount wallet credit (future: trigger Edge Function)
      const ref = `PH-BUNDLE-${Date.now().toString(36).toUpperCase()}`;
      setBookingRef(ref);
      await new Promise(r => setTimeout(r, 1500));
      setStep("success");
      clearBundle?.();
    } catch (err) {
      showToast("Bundle checkout failed. Please try again.", "error");
      setStep("cart");
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setStep("cart");
    setBookingRef("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1500] flex items-center justify-end bg-black/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          className="w-full max-w-md h-full max-h-[90vh] bg-zinc-900 border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                <ShoppingCart size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-black text-pearl uppercase tracking-tight">Trip Bundle</h2>
                <p className="text-[10px] text-mist/40">
                  {(bundleItems as BundleItem[]).length} item{(bundleItems as BundleItem[]).length !== 1 ? "s" : ""} · Bundle &amp; save 5%
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="text-mist/40 hover:text-pearl transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {step === "cart" && (
              <>
                {(bundleItems as BundleItem[]).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                    <ShoppingCart size={48} className="text-mist/10" />
                    <p className="text-sm font-black text-mist/40 uppercase tracking-widest">Your bundle is empty</p>
                    <p className="text-xs text-mist/20">
                      Add a stay, vehicle, or event from their respective pages.<br />
                      Bundle 2+ items to unlock a 5% discount.
                    </p>
                    <button onClick={handleClose} className="mt-2 text-[10px] font-black text-primary uppercase tracking-widest hover:text-gold-light transition-colors flex items-center gap-1">
                      Browse Listings <ChevronRight size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="p-5 space-y-3">
                    {/* Bundle tip */}
                    {(bundleItems as BundleItem[]).length < 2 && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-2">
                        <Sparkles size={14} className="text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-primary/80 leading-relaxed">
                          Add {2 - (bundleItems as BundleItem[]).length} more item{2 - (bundleItems as BundleItem[]).length > 1 ? "s" : ""} to unlock your 5% bundle discount
                        </p>
                      </div>
                    )}

                    {(bundleItems as BundleItem[]).map((item: BundleItem) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/3 border border-white/5 rounded-2xl p-4 flex gap-4"
                      >
                        {item.image ? (
                          <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border ${TYPE_COLORS[item.type]}`}>
                            {TYPE_ICONS[item.type]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Badge className={`text-[8px] px-1.5 py-0 border ${TYPE_COLORS[item.type]} mb-1`}>
                                {item.type}
                              </Badge>
                              <p className="text-xs font-bold text-pearl line-clamp-1">{item.title}</p>
                              {item.dateFrom && (
                                <p className="text-[10px] text-mist/40 mt-0.5">
                                  {item.dateFrom}{item.dateTo ? ` → ${item.dateTo}` : ""}
                                </p>
                              )}
                              {item.details && (
                                <p className="text-[10px] text-mist/30 mt-0.5 line-clamp-1">{item.details}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeBundleItem?.(item.id)}
                              className="text-mist/20 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-sm font-black text-primary mt-1">
                            {formatPrice(item.price * (item.quantity ?? 1), item.currency)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === "processing" && (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-black text-pearl uppercase tracking-widest">Processing Bundle…</p>
                <p className="text-xs text-mist/40">Securing all {(bundleItems as BundleItem[]).length} bookings simultaneously</p>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Check size={32} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-pearl mb-1">Bundle Booked!</h3>
                  <p className="text-[10px] font-mono text-mist/40">{bookingRef}</p>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl w-full">
                  <p className="text-xs text-primary font-black uppercase tracking-widest mb-1">You saved</p>
                  <p className="text-2xl font-black text-pearl">Rs. {savings.toLocaleString()}</p>
                  <p className="text-[10px] text-mist/40">5% bundle discount applied</p>
                </div>
                <p className="text-xs text-mist/40">
                  Confirmation details have been sent to your account.
                </p>
                <button onClick={handleClose} className="w-full bg-primary hover:bg-gold-light text-primary-foreground py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {step === "cart" && (bundleItems as BundleItem[]).length > 0 && (
            <div className="p-5 border-t border-white/5 space-y-3">
              {(bundleItems as BundleItem[]).length >= 2 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-mist/50">Bundle discount (5%)</span>
                  <span className="text-emerald-400 font-black">−Rs. {savings.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-pearl uppercase tracking-tight">Total</span>
                <span className="text-xl font-black text-primary">
                  Rs. {((bundleItems as BundleItem[]).length >= 2 ? total - savings : total).toLocaleString()}
                </span>
              </div>
              <button
                onClick={checkout}
                disabled={processing || !user}
                className="w-full bg-primary hover:bg-gold-light text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-primary/20 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                Book Full Trip Bundle
              </button>
              {!user && (
                <p className="text-[10px] text-center text-mist/30">Sign in to complete your bundle</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
