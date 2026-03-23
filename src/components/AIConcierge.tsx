/**
 * AI Concierge — powered by the Anthropic Claude API.
 *
 * Architecture note:
 *   In production, the API call must go through a Supabase Edge Function
 *   (supabase/functions/ai-concierge/index.ts) so the API key is NEVER
 *   exposed on the client. The Edge Function receives the user query +
 *   listing context, calls the Anthropic API server-side, and returns
 *   the structured itinerary JSON.
 *
 *   For development convenience, this component calls the Anthropic API
 *   directly via the VITE_ANTHROPIC_API_KEY env var. Set that in .env.local
 *   and it will work locally. The var is stripped from production builds
 *   if you configure Vercel to only expose it to Edge Functions.
 *
 *   NEVER ship a production build with VITE_ANTHROPIC_API_KEY set —
 *   it will be visible in the browser bundle.
 */

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Car, Hotel, MapPin, Calendar,
  Loader2, CheckCircle2, Compass, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ItineraryDay {
  day: number;
  title: string;
  item: string;
  type: "stay" | "vehicle" | "event" | "activity";
}

interface Itinerary {
  title: string;
  destination: string;
  duration: string;
  highlights: ItineraryDay[];
  estimatedCost: string;
  aiNote: string;
}

const ICON_MAP = {
  stay:     <Hotel size={16} />,
  vehicle:  <Car size={16} />,
  event:    <Compass size={16} />,
  activity: <Compass size={16} />,
};

// ── Build context string from current listings ──────────────
function buildListingContext(
  stays: any[],
  vehicles: any[],
  events: any[],
  properties: any[]
): string {
  const fmt = (items: any[], label: string, nameKey: string, priceKey: string, locKey: string) =>
    items.slice(0, 5).map(i =>
      `  - ${i[nameKey]} (${i[locKey]}, Rs.${i[priceKey]?.toLocaleString() ?? "?"})`
    ).join("\n") || `  (none available)`;

  return `
Available stays (sample):
${fmt(stays, "stays", "name", "price_per_night", "location")}

Available vehicles (sample):
${fmt(vehicles, "vehicles", "title", "price_per_day", "location")}

Upcoming events (sample):
${fmt(events, "events", "title", "price_standard", "location")}
`.trim();
}

export default function AIConcierge() {
  const { stays, vehicles, events, properties } = useStore();
  const [query, setQuery]         = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError]         = useState("");

  const generatePlan = async () => {
    if (!query.trim()) return;
    setError("");
    setIsPlanning(true);
    setItinerary(null);

    const listingContext = buildListingContext(stays, vehicles, events, properties);

    const systemPrompt = `You are Pearl Hub's AI Travel Concierge for Sri Lanka.
You help users plan trips using Pearl Hub's real listings: properties, stays, vehicles, and events.
Always respond with a JSON object matching this exact schema and NOTHING else — no markdown, no explanation:
{
  "title": string,
  "destination": string,
  "duration": string,
  "highlights": [
    { "day": number, "title": string, "item": string, "type": "stay"|"vehicle"|"event"|"activity" }
  ],
  "estimatedCost": string (in LKR format like "Rs. 45,000"),
  "aiNote": string (1-2 sentence insight about timing, weather, or local tips)
}
Use Sri Lankan locations. Keep highlights to 3-4 items. Be specific and practical.`;

    const userMessage = `User request: "${query}"

Current Pearl Hub listings context:
${listingContext}

Generate a personalised Sri Lanka trip itinerary based on this request.`;

    try {
      // ── Production path: call Supabase Edge Function ────────
      // const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-concierge`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      //   },
      //   body: JSON.stringify({ query, listingContext }),
      // });

      // ── Development path: direct Anthropic API call ─────────
      // Requires VITE_ANTHROPIC_API_KEY in .env.local (never production)
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

      if (!apiKey) {
        // Graceful fallback when API key is not configured
        throw new Error("ANTHROPIC_API_KEY_MISSING");
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const text = data.content?.[0]?.text ?? "";

      // Strip any accidental markdown fences
      const clean = text.replace(/```json|```/gi, "").trim();
      const parsed: Itinerary = JSON.parse(clean);
      setItinerary(parsed);

    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "";

      if (msg === "ANTHROPIC_API_KEY_MISSING") {
        // Show a rich demo itinerary as fallback so the UI is useful
        // even in environments without the API key configured
        const demoStay    = stays[0];
        const demoVehicle = vehicles[0];
        const demoEvent   = events[0];
        setItinerary({
          title: `Your ${query.length > 30 ? "Personalised" : query} Sri Lanka Journey`,
          destination: "Colombo / Galle / South Coast",
          duration: "3 Days / 2 Nights",
          highlights: [
            { day: 1, title: "Grand Arrival & City Exploration",   item: demoStay?.name    || "Luxury Colombo Stay",   type: "stay"     },
            { day: 2, title: "Coastal Discovery Drive",            item: demoVehicle?.title || "Premium Vehicle",       type: "vehicle"  },
            { day: 3, title: "Cultural & Event Experience",        item: demoEvent?.title  || "Signature Local Event", type: "event"    },
          ],
          estimatedCost: "Rs. 185,000 – Rs. 250,000",
          aiNote: "⚠️ This is a demo itinerary. Add VITE_ANTHROPIC_API_KEY to .env.local to enable AI-powered personalisation based on your actual query.",
        });
        setError("");
      } else {
        setError(msg || "Failed to generate itinerary. Please try again.");
        console.error("AI Concierge error:", err);
      }
    } finally {
      setIsPlanning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generatePlan(); }
  };

  return (
    <div className="bg-zinc-950 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-all duration-1000" />

      <div className="p-10 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">AI Concierge</h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Powered by Claude</p>
            </div>
          </div>
          <Badge className="bg-white/5 text-mist border-white/10 px-3 py-1 font-black text-[9px] uppercase tracking-widest">
            {import.meta.env.VITE_ANTHROPIC_API_KEY ? "AI Active" : "Demo Mode"}
          </Badge>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {!itinerary ? (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-pearl leading-tight">
              Where should your next{" "}
              <span className="text-primary italic">Signature Experience</span> begin?
            </h3>
            <div className="relative">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 'Plan a 3-day luxury trip to Galle for a family of 4 in March…'"
                maxLength={300}
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 pr-40 text-sm text-pearl placeholder:text-mist/30 outline-none focus:border-primary/50 transition-all"
              />
              <div className="absolute right-3 top-3">
                <Button
                  onClick={generatePlan}
                  disabled={isPlanning || !query.trim()}
                  className="h-10 rounded-xl bg-primary hover:bg-gold-light text-primary-foreground font-black uppercase text-[10px] tracking-widest px-6"
                >
                  {isPlanning ? <Loader2 size={16} className="animate-spin" /> : "Plan My Trip"}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Beach Getaway", "Cultural Tour", "Luxury Honeymoon", "Adventure Trek", "Family Holiday"].map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(`Plan a ${tag} in Sri Lanka for 3–4 days`)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-mist/60 hover:text-primary hover:border-primary/30 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
            {!import.meta.env.VITE_ANTHROPIC_API_KEY && (
              <p className="text-[10px] text-mist/30 italic">
                Demo mode: Add <code className="font-mono bg-white/5 px-1 rounded">VITE_ANTHROPIC_API_KEY</code> to <code className="font-mono bg-white/5 px-1 rounded">.env.local</code> for live AI responses.
              </p>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div>
              <h3 className="text-2xl font-black text-primary leading-none mb-2">{itinerary.title}</h3>
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-mist">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {itinerary.destination}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {itinerary.duration}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {itinerary.highlights.map(h => (
                <div key={h.day} className="p-6 bg-white/5 border border-white/5 rounded-3xl group/card hover:border-primary/30 transition-all">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Day {h.day}</p>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover/card:scale-110 transition-transform">
                    {ICON_MAP[h.type] ?? <Compass size={16} />}
                  </div>
                  <h4 className="text-sm font-bold text-pearl mb-1">{h.title}</h4>
                  <p className="text-[11px] text-mist/60 font-medium">{h.item}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={60} className="text-primary" />
              </div>
              <p className="text-xs italic text-pearl leading-relaxed relative z-10">"{itinerary.aiNote}"</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-mist/40 mb-1">Estimated Package</p>
                <p className="text-2xl font-black text-white">{itinerary.estimatedCost}</p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  className="rounded-2xl border border-white/10 text-mist font-black uppercase text-[10px] tracking-widest"
                  onClick={() => { setItinerary(null); setQuery(""); }}
                >
                  New Plan
                </Button>
                <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-gold-light text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                  Browse Listings
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
