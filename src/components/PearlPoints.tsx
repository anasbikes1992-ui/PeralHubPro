/**
 * PearlPoints — Loyalty programme.
 * 1 point per Rs. 100 spent. Redeem at checkout (80% value, 20% cap).
 * Shown in the customer dashboard and during checkout.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, TrendingUp, Gift, Loader2 } from "lucide-react";

interface PointsData {
  total_earned: number;
  total_redeemed: number;
  balance: number;
  tier: "Standard" | "Silver" | "Gold" | "Elite";
}

const TIERS = [
  { name: "Standard", min: 0,     max: 4999,  color: "text-mist",    bg: "bg-mist/10",    icon: "●" },
  { name: "Silver",   min: 5000,  max: 14999, color: "text-gray-300",bg: "bg-gray-300/10",icon: "◆" },
  { name: "Gold",     min: 15000, max: 49999, color: "text-primary",  bg: "bg-primary/10", icon: "★" },
  { name: "Elite",    min: 50000, max: Infinity, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: "♛" },
];

function getTier(points: number) {
  return TIERS.find(t => points >= t.min && points <= t.max) ?? TIERS[0];
}

export function PearlPointsWidget() {
  const { user } = useAuth();
  const [data, setData]     = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      const { data: rows } = await (supabase as any)
        .from("pearl_points")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (rows) {
        setData({ ...rows, tier: getTier(rows.balance).name as any });
      } else {
        setData({ total_earned: 0, total_redeemed: 0, balance: 0, tier: "Standard" });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="animate-spin text-primary/40" size={20} />
    </div>
  );
  if (!data) return null;

  const tier = getTier(data.balance);
  const nextTier = TIERS.find(t => t.min > data.balance);
  const progress = nextTier
    ? Math.min(100, ((data.balance - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;
  const lkrValue = Math.floor(data.balance * 0.8);

  return (
    <div className="bg-zinc-900 border border-white/8 rounded-[2rem] p-6 space-y-5">
      {/* Tier badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl ${tier.bg} flex items-center justify-center text-lg ${tier.color}`}>
            {tier.icon}
          </div>
          <div>
            <p className="text-[10px] font-black text-mist/40 uppercase tracking-widest">Loyalty Tier</p>
            <p className={`text-sm font-black uppercase tracking-tight ${tier.color}`}>{tier.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-mist/40 uppercase tracking-widest">Balance</p>
          <p className="text-xl font-black text-primary">{data.balance.toLocaleString()}</p>
          <p className="text-[9px] text-mist/30">≈ Rs. {lkrValue.toLocaleString()} value</p>
        </div>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div>
          <div className="flex justify-between text-[9px] text-mist/40 mb-1.5">
            <span>{tier.name}</span>
            <span>{(nextTier.min - data.balance).toLocaleString()} pts to {nextTier.name}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Sparkles size={14} />, label: "Earned",   value: data.total_earned.toLocaleString() },
          { icon: <Gift size={14} />,     label: "Redeemed", value: data.total_redeemed.toLocaleString() },
          { icon: <TrendingUp size={14}/>,label: "Balance",  value: data.balance.toLocaleString() },
        ].map(s => (
          <div key={s.label} className="bg-white/3 rounded-xl p-3 text-center">
            <div className="text-primary/60 flex justify-center mb-1">{s.icon}</div>
            <p className="text-xs font-black text-pearl">{s.value}</p>
            <p className="text-[9px] text-mist/30 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Earn rate */}
      <div className="p-3 bg-primary/5 border border-primary/15 rounded-2xl">
        <p className="text-[10px] text-primary/80 font-medium leading-relaxed">
          Earn <strong>1 Pearl Point</strong> per Rs. 100 spent across all verticals.
          Redeem at checkout — 1 pt = Rs. 0.80 (up to 20% discount per booking).
        </p>
      </div>
    </div>
  );
}

/** Small inline badge for checkout screens */
export function PearlPointsBadge({ points, onRedeem }: { points: number; onRedeem?: (pts: number) => void }) {
  const [redeeming, setRedeeming] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(0);

  const maxRedeem = Math.floor(points * 0.8);

  return (
    <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-primary" />
        <div>
          <p className="text-xs font-black text-primary">{points.toLocaleString()} Pearl Points</p>
          <p className="text-[10px] text-mist/50">≈ Rs. {Math.floor(points * 0.8).toLocaleString()} value</p>
        </div>
      </div>
      {onRedeem && points > 0 && (
        <button
          onClick={() => { onRedeem(points); }}
          className="text-[10px] font-black text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all uppercase tracking-widest"
        >
          Redeem
        </button>
      )}
    </div>
  );
}
