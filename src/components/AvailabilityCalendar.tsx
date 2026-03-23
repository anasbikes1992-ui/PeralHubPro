/**
 * AvailabilityCalendar — real-time availability using Supabase Realtime.
 * Shows booked / available date ranges. Providers can block dates.
 * Guests see live availability with no stale data.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Lock, Unlock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvailabilityCalendarProps {
  listingId: string;
  listingType: "stay" | "vehicle" | "event";
  /** If true, provider can block/unblock dates */
  providerMode?: boolean;
  /** Called with [checkIn, checkOut] when guest selects a range */
  onRangeSelect?: (checkIn: string, checkOut: string) => void;
  pricePerNight?: number;
  currency?: string;
}

type DateStatus = "available" | "booked" | "blocked" | "selected" | "today";

interface BookedRange { check_in: string; check_out: string; }

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseDate(s: string): Date { return new Date(s + "T00:00:00"); }

function dateInRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

export default function AvailabilityCalendar({
  listingId, listingType, providerMode = false,
  onRangeSelect, pricePerNight, currency = "LKR",
}: AvailabilityCalendarProps) {
  const { user } = useAuth();
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading]   = useState(true);
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [selectEnd, setSelectEnd]     = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);

  // ── Load bookings + blocked dates ────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const [bookRes, blockRes] = await Promise.all([
      (supabase as any)
        .from("bookings")
        .select("check_in_date, check_out_date")
        .eq("listing_id", listingId)
        .in("status", ["pending", "confirmed"]),
      (supabase as any)
        .from("blocked_dates")
        .select("blocked_date")
        .eq("listing_id", listingId),
    ]);
    setBookedRanges(bookRes.data?.map((b: any) => ({
      check_in: b.check_in_date, check_out: b.check_out_date,
    })) ?? []);
    setBlockedDates(new Set(blockRes.data?.map((b: any) => b.blocked_date) ?? []));
    setLoading(false);
  }, [listingId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Realtime: refresh when bookings change ────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`availability-${listingId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "bookings",
        filter: `listing_id=eq.${listingId}`,
      }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [listingId, loadData]);

  // ── Date status calculation ───────────────────────────────
  const getStatus = (y: number, m: number, d: number): DateStatus => {
    const ds = formatDate(y, m, d);
    const dt = parseDate(ds);
    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

    if (ds === todayStr) return "today";
    if (dt < today) return "booked"; // past dates appear unavailable

    if (blockedDates.has(ds)) return "blocked";

    for (const r of bookedRanges) {
      if (dateInRange(dt, parseDate(r.check_in), parseDate(r.check_out))) return "booked";
    }

    if (selectStart && selectEnd) {
      const s = parseDate(selectStart), e = parseDate(selectEnd);
      if (dateInRange(dt, s, e)) return "selected";
    } else if (selectStart && ds === selectStart) return "selected";

    return "available";
  };

  // ── Calendar grid ─────────────────────────────────────────
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleDateClick = async (ds: string) => {
    const status = getStatus(
      parseInt(ds.slice(0, 4)),
      parseInt(ds.slice(5, 7)) - 1,
      parseInt(ds.slice(8, 10))
    );

    if (providerMode && user) {
      // Toggle blocked date
      setSaving(true);
      if (blockedDates.has(ds)) {
        await (supabase as any)
          .from("blocked_dates")
          .delete()
          .eq("listing_id", listingId)
          .eq("blocked_date", ds);
        setBlockedDates(prev => { const n = new Set(prev); n.delete(ds); return n; });
      } else if (status === "available" || status === "today") {
        await (supabase as any)
          .from("blocked_dates")
          .insert({ listing_id: listingId, user_id: user.id, blocked_date: ds });
        setBlockedDates(prev => new Set([...prev, ds]));
      }
      setSaving(false);
      return;
    }

    // Guest range selection
    if (status === "booked" || status === "blocked") return;
    if (!selectStart || (selectStart && selectEnd)) {
      setSelectStart(ds); setSelectEnd(null);
    } else {
      if (ds < selectStart) { setSelectStart(ds); setSelectEnd(null); return; }
      // Check no booked dates in range
      const s = parseDate(selectStart), e = parseDate(ds);
      let hasBooked = false;
      const cur = new Date(s);
      while (cur <= e) {
        const cs = cur.toISOString().split("T")[0];
        const cst = getStatus(
          parseInt(cs.slice(0, 4)),
          parseInt(cs.slice(5, 7)) - 1,
          parseInt(cs.slice(8, 10))
        );
        if (cst === "booked" || cst === "blocked") { hasBooked = true; break; }
        cur.setDate(cur.getDate() + 1);
      }
      if (hasBooked) { setSelectStart(ds); setSelectEnd(null); return; }
      setSelectEnd(ds);
      onRangeSelect?.(selectStart, ds);
    }
  };

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const nights = selectStart && selectEnd
    ? Math.max(0, Math.round((parseDate(selectEnd).getTime() - parseDate(selectStart).getTime()) / 86400000))
    : 0;

  const STATUS_STYLES: Record<DateStatus, string> = {
    available: "text-pearl hover:bg-primary/20 hover:text-primary cursor-pointer",
    booked:    "text-mist/20 line-through cursor-not-allowed",
    blocked:   "text-mist/20 bg-red-500/10 cursor-not-allowed",
    selected:  "bg-primary text-primary-foreground",
    today:     "ring-1 ring-primary text-primary font-bold",
  };

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="animate-spin text-primary" size={24} />
    </div>
  );

  return (
    <div className="bg-zinc-900 border border-white/8 rounded-[2rem] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
            else setViewMonth(m => m - 1);
          }}
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-mist hover:text-pearl transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-black text-pearl uppercase tracking-widest">{monthName}</span>
        <button
          onClick={() => {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
            else setViewMonth(m => m + 1);
          }}
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-mist hover:text-pearl transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-mist/30 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const ds = formatDate(viewYear, viewMonth, day);
          const status = getStatus(viewYear, viewMonth, day);
          return (
            <motion.button
              key={ds}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDateClick(ds)}
              className={`aspect-square rounded-xl text-xs flex items-center justify-center transition-all ${STATUS_STYLES[status]}`}
              title={status === "booked" ? "Already booked" : status === "blocked" ? "Blocked by provider" : ds}
            >
              {day}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {[
          { color: "bg-primary/60",    label: "Selected" },
          { color: "bg-red-500/20",    label: "Booked" },
          { color: "bg-white/5 ring-1 ring-primary", label: "Today" },
          { color: "bg-white/5",       label: "Available" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${l.color}`} />
            <span className="text-[10px] text-mist/50">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Guest selection summary */}
      {!providerMode && selectStart && (
        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-widest">
                {selectEnd ? `${nights} night${nights !== 1 ? "s" : ""}` : "Select check-out date"}
              </p>
              <p className="text-[10px] text-mist/60 mt-0.5">
                {selectStart}{selectEnd ? ` → ${selectEnd}` : ""}
              </p>
            </div>
            {selectEnd && pricePerNight && (
              <div className="text-right">
                <p className="text-xs text-mist/40">Total</p>
                <p className="text-lg font-black text-primary">
                  {currency === "LKR" ? "Rs." : currency} {(pricePerNight * nights).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          {selectEnd && (
            <button
              onClick={() => { setSelectStart(null); setSelectEnd(null); }}
              className="mt-2 text-[10px] text-mist/40 hover:text-mist transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Provider mode controls */}
      {providerMode && (
        <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
          <div className="flex items-start gap-2">
            {saving ? <Loader2 size={12} className="animate-spin text-amber-400 flex-shrink-0 mt-0.5" /> : <Lock size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />}
            <div>
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Provider Mode</p>
              <p className="text-[10px] text-mist/50 mt-0.5">
                Tap any available date to block it from bookings. Tap blocked dates to unblock.
              </p>
            </div>
          </div>
          <p className="text-[10px] text-mist/40 mt-2">
            {blockedDates.size} date{blockedDates.size !== 1 ? "s" : ""} blocked
          </p>
        </div>
      )}
    </div>
  );
}
