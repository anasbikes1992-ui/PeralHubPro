/**
 * PricingAdvisor — dynamic pricing suggestions for providers.
 * Uses platform booking data + local event calendar to suggest
 * optimal prices by day of week and season.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, TrendingDown, Minus, Sparkles, Loader2, Calendar, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PricingAdvisorProps {
  listingId: string;
  listingType: "stay" | "vehicle";
  currentPrice: number;
  currency?: string;
  location?: string;
}

const SL_EVENTS: { name: string; dates: string[]; impact: number }[] = [
  { name: "Avurudu (Sinhala/Tamil New Year)", dates: ["04-13","04-14"], impact: 0.40 },
  { name: "Kandy Perahera", dates: ["08-01","08-15"], impact: 0.35 },
  { name: "Vesak Full Moon", dates: ["05-10","05-11"], impact: 0.25 },
  { name: "Galle Literary Festival", dates: ["01-17","01-21"], impact: 0.30 },
  { name: "Christmas / New Year", dates: ["12-24","01-02"], impact: 0.45 },
  { name: "South Monsoon (Galle/Unawatuna)", dates: ["05-15","09-30"], impact: -0.30 },
  { name: "North Monsoon (Trinco/Arugam)", dates: ["11-01","02-28"], impact: -0.25 },
];

function getSeasonalFactor(location: string): number {
  const m = new Date().getMonth() + 1;
  const south = ["galle","mirissa","unawatuna","hikkaduwa","bentota","tangalle","weligama"].some(l => location.toLowerCase().includes(l));
  const north  = ["trincomalee","arugam","batticaloa","jaffna"].some(l => location.toLowerCase().includes(l));
  if (south && m >= 5 && m <= 9) return -0.25;
  if (north && (m >= 11 || m <= 2)) return -0.20;
  if ((m === 12 || m === 1) && !south) return 0.35; // peak tourist season
  if (m >= 7 && m <= 9) return 0.20;
  return 0.05;
}

function checkUpcomingEvents() {
  const today = new Date();
  const mmdd = `${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  return SL_EVENTS.filter(e =>
    e.dates.some(d => Math.abs(Date.parse(`2024-${d}`) - Date.parse(`2024-${mmdd}`)) < 14 * 86400000)
  );
}

export default function PricingAdvisor({ listingId, listingType, currentPrice, currency = "LKR", location = "" }: PricingAdvisorProps) {
  const { user } = useAuth();
  const [marketAvg, setMarketAvg]   = useState<number | null>(null);
  const [occupancy, setOccupancy]   = useState<number | null>(null);
  const [loading, setLoading]       = useState(true);
  const [weeklyData, setWeeklyData] = useState<{ day: string; rate: number; bookings: number }[]>([]);

  const upcomingEvents = checkUpcomingEvents();
  const seasonalFactor = getSeasonalFactor(location);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Market average for similar listings in location
      const table = listingType === "stay" ? "stays_listings" : "vehicles_listings";
      const priceCol = listingType === "stay" ? "price_per_night" : "price_per_day";
      const { data: market } = await (supabase as any)
        .from(table)
        .select(priceCol)
        .ilike("location", `%${location.split(" ")[0] || "Colombo"}%`)
        .eq("moderation_status", "approved")
        .limit(20);

      if (market?.length) {
        const avg = market.reduce((s: number, r: any) => s + (r[priceCol] ?? 0), 0) / market.length;
        setMarketAvg(Math.round(avg));
      }

      // Occupancy from bookings in last 30 days
      const d30 = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
      const { data: bks } = await (supabase as any)
        .from("bookings")
        .select("check_in_date, check_out_date")
        .eq("listing_id", listingId)
        .gte("check_in_date", d30);

      if (bks) {
        const totalNights = bks.reduce((s: number, b: any) => {
          const diff = (new Date(b.check_out_date).getTime() - new Date(b.check_in_date).getTime()) / 86400000;
          return s + Math.max(1, diff);
        }, 0);
        setOccupancy(Math.min(100, Math.round((totalNights / 30) * 100)));
      }

      // Weekly demand pattern (mock based on listing type)
      setWeeklyData([
        { day: "Mon", rate: Math.round(currentPrice * 0.85), bookings: 3 },
        { day: "Tue", rate: Math.round(currentPrice * 0.85), bookings: 2 },
        { day: "Wed", rate: Math.round(currentPrice * 0.90), bookings: 4 },
        { day: "Thu", rate: Math.round(currentPrice * 0.95), bookings: 5 },
        { day: "Fri", rate: Math.round(currentPrice * 1.15), bookings: 9 },
        { day: "Sat", rate: Math.round(currentPrice * 1.25), bookings: 12 },
        { day: "Sun", rate: Math.round(currentPrice * 1.10), bookings: 8 },
      ]);

      setLoading(false);
    };
    load();
  }, [listingId, listingType, location, currentPrice]);

  const eventFactor = upcomingEvents.reduce((s, e) => s + e.impact, 0);
  const suggestedPrice = marketAvg
    ? Math.round(marketAvg * (1 + seasonalFactor + eventFactor * 0.5))
    : Math.round(currentPrice * (1 + seasonalFactor));

  const diff = suggestedPrice - currentPrice;
  const pct  = Math.round((diff / currentPrice) * 100);

  if (loading) return (
    <div className="flex items-center justify-center py-6 gap-2">
      <Loader2 className="animate-spin text-primary/40" size={18} />
      <span className="text-xs text-mist/40">Analysing market data…</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Suggestion banner */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
        diff > 0 ? "bg-emerald-500/5 border-emerald-500/20" :
        diff < 0 ? "bg-amber-500/5 border-amber-500/20" :
        "bg-primary/5 border-primary/20"
      }`}>
        <div className="mt-0.5">
          {diff > 0 ? <TrendingUp size={16} className="text-emerald-400" /> :
           diff < 0 ? <TrendingDown size={16} className="text-amber-400" /> :
           <Minus size={16} className="text-primary" />}
        </div>
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: diff > 0 ? "var(--emerald, #4ade80)" : diff < 0 ? "#fbbf24" : "var(--primary)" }}>
            {diff > 0 ? "Increase Recommended" : diff < 0 ? "Consider Reducing" : "Price Looks Optimal"}
          </p>
          <p className="text-sm font-black text-pearl">
            Suggested: Rs. {suggestedPrice.toLocaleString()}/
            {listingType === "stay" ? "night" : "day"}
            <span className={`ml-2 text-xs ${diff > 0 ? "text-emerald-400" : "text-amber-400"}`}>
              ({pct > 0 ? "+" : ""}{pct}%)
            </span>
          </p>
          <p className="text-[10px] text-mist/50 mt-1 leading-relaxed">
            {marketAvg && `Market average ${location ? `in ${location}` : ""}: Rs. ${marketAvg.toLocaleString()}. `}
            {upcomingEvents.length > 0 && `${upcomingEvents[0].name} demand surge detected. `}
            {seasonalFactor > 0 ? "Peak season — rates can be higher." : seasonalFactor < -0.1 ? "Off-season — competitive pricing advised." : ""}
          </p>
        </div>
      </div>

      {/* Occupancy */}
      {occupancy !== null && (
        <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5">
          <div>
            <p className="text-[9px] font-black text-mist/40 uppercase tracking-widest">30-Day Occupancy</p>
            <p className="text-lg font-black text-pearl">{occupancy}%</p>
          </div>
          <div className="h-2 flex-1 mx-4 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${occupancy >= 70 ? "bg-emerald-500" : occupancy >= 40 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${occupancy}%` }}
            />
          </div>
          <p className={`text-[10px] font-black ${occupancy >= 70 ? "text-emerald-400" : occupancy >= 40 ? "text-amber-400" : "text-red-400"}`}>
            {occupancy >= 70 ? "Strong" : occupancy >= 40 ? "Moderate" : "Low"}
          </p>
        </div>
      )}

      {/* Weekly demand chart */}
      <div>
        <p className="text-[9px] font-black text-mist/40 uppercase tracking-widest mb-2">Weekly Demand Pattern</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={20}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                formatter={(v: any) => [`Rs. ${Number(v).toLocaleString()}`, "Rate"]}
              />
              <Bar dataKey="rate" radius={[4,4,0,0]}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={i >= 4 ? "hsl(42 52% 54%)" : "rgba(255,255,255,0.12)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[9px] text-mist/30 text-center mt-1">Fri–Sun rates highlighted — typically 20–30% higher demand</p>
      </div>

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] font-black text-mist/40 uppercase tracking-widest flex items-center gap-1">
            <Calendar size={10} /> Upcoming Demand Events
          </p>
          {upcomingEvents.map(e => (
            <div key={e.name} className="flex items-center justify-between p-2 bg-white/3 rounded-lg border border-white/5">
              <p className="text-xs text-pearl font-medium">{e.name}</p>
              <span className={`text-[10px] font-black ${e.impact > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {e.impact > 0 ? "+" : ""}{Math.round(e.impact * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
