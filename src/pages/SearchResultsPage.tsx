import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, calculateDistance } from "@/lib/utils";
import { Search, MapPin, Loader2, Languages, SlidersHorizontal } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  listing_type: string;
  location: string;
  price: number;
  image: string;
  rating: number;
}

const TYPE_LINKS: Record<string, string> = {
  stay: "/stays", vehicle: "/vehicles", event: "/events", property: "/property",
};
const TYPE_ICONS: Record<string, string> = {
  stay: "🏨", vehicle: "🚗", event: "🎫", property: "🏘️",
};

const SearchResultsPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { language, isExpatMode } = useStore() as any;
  const rawQuery = params.get("q") || "";
  const category  = params.get("category") || "all";

  const [query, setQuery]         = useState(rawQuery);
  const [inputVal, setInputVal]   = useState(rawQuery);
  const [results, setResults]     = useState<SearchResult[]>([]);
  const [loading, setLoading]     = useState(false);
  const [translatedQuery, setTranslatedQuery] = useState<string>("");
  const [sortBy, setSortBy]       = useState<"relevance" | "price_asc" | "price_desc">("relevance");
  const [userLoc, setUserLoc]     = useState<{ lat: number; lng: number } | null>(null);
  const [translating, setTranslating] = useState(false);

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

  // ── Translate query if not in English ────────────────────
  const translateQuery = useCallback(async (q: string): Promise<string> => {
    if (!q || !apiKey) return q;
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "en" || language === "en") return q;
    setTranslating(true);
    try {
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
          max_tokens: 80,
          system: "Translate the user's property/travel search query to English for a Sri Lanka marketplace search engine. Return ONLY the English translation, no explanation.",
          messages: [{ role: "user", content: q }],
        }),
      });
      if (res.ok) {
        const d = await res.json();
        return d.content?.[0]?.text?.trim() ?? q;
      }
    } catch {}
    setTranslating(false);
    return q;
  }, [apiKey, language]);

  // ── Run search ────────────────────────────────────────────
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      // Translate non-English queries
      const englishQ = await translateQuery(q);
      if (englishQ !== q) setTranslatedQuery(englishQ);
      setTranslating(false);

      // Use the unified search function
      const { data, error } = await (supabase as any).rpc("search_all_listings", {
        p_query: englishQ,
        p_limit: 40,
      });

      if (error) {
        // Fallback: parallel ilike queries if RPC not yet deployed
        const searchQ = `%${englishQ}%`;
        const [sr, vr, er, pr] = await Promise.all([
          (supabase as any).from("stays_listings").select("id,name,location,price_per_night,images,rating").ilike("name", searchQ).eq("moderation_status","approved").limit(10),
          (supabase as any).from("vehicles_listings").select("id,title,location,price_per_day,images,rating").ilike("title", searchQ).eq("moderation_status","approved").limit(10),
          (supabase as any).from("events_listings").select("id,title,location,price_standard,images").ilike("title", searchQ).eq("moderation_status","approved").limit(10),
          (supabase as any).from("properties_listings").select("id,title,location,price,images").ilike("title", searchQ).eq("moderation_status","approved").limit(10),
        ]);
        const combined: SearchResult[] = [
          ...(sr.data || []).map((r: any) => ({ id: r.id, title: r.name, listing_type: "stay",     location: r.location, price: r.price_per_night, image: r.images?.[0] ?? "", rating: r.rating ?? 0 })),
          ...(vr.data || []).map((r: any) => ({ id: r.id, title: r.title, listing_type: "vehicle",  location: r.location, price: r.price_per_day,   image: r.images?.[0] ?? "", rating: r.rating ?? 0 })),
          ...(er.data || []).map((r: any) => ({ id: r.id, title: r.title, listing_type: "event",    location: r.location, price: r.price_standard ?? 0, image: r.images?.[0] ?? "", rating: 0 })),
          ...(pr.data || []).map((r: any) => ({ id: r.id, title: r.title, listing_type: "property", location: r.location, price: r.price,           image: r.images?.[0] ?? "", rating: 0 })),
        ];
        setResults(combined);
      } else {
        setResults(data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [translateQuery]);

  useEffect(() => {
    if (rawQuery) { setInputVal(rawQuery); runSearch(rawQuery); }
  }, [rawQuery]);

  // ── Sort results ──────────────────────────────────────────
  const sorted = [...results].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    return 0;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputVal.trim())}&category=${category}`);
      runSearch(inputVal.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search bar */}
      <div className="bg-card border-b border-border py-6">
        <div className="container px-4 max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Search properties, stays, vehicles, events… (any language)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-gold-light transition-all">
              Search
            </button>
          </form>

          {/* Translation notice */}
          {translatedQuery && translatedQuery !== query && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Languages size={12} className="text-primary" />
              Searching for: "<span className="text-primary font-medium">{translatedQuery}</span>" (auto-translated)
            </div>
          )}
          {translating && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin text-primary" />
              Translating your search query…
            </div>
          )}
        </div>
      </div>

      <div className="container px-4 py-8 max-w-5xl mx-auto">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold">
              {loading ? "Searching…" : `${results.length} result${results.length !== 1 ? "s" : ""}`}
              {query && <span className="text-muted-foreground font-normal"> for "<em>{query}</em>"</span>}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-sm border border-input rounded-lg px-3 py-1.5 bg-background outline-none focus:border-primary"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={28} />
            <span className="text-muted-foreground">Searching across all verticals…</span>
          </div>
        )}

        {/* No results */}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold mb-2">No results found</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Try a different search term or browse by category. You can search in Sinhala, Tamil, or any language.
            </p>
          </div>
        )}

        {/* Results grid */}
        {!loading && sorted.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {sorted.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`${TYPE_LINKS[item.listing_type] ?? "/"}?highlight=${item.id}`}
                    className="block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all group"
                  >
                    {item.image ? (
                      <div className="h-40 overflow-hidden">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-40 bg-muted flex items-center justify-center text-5xl">
                        {TYPE_ICONS[item.listing_type] ?? "📋"}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                          {TYPE_ICONS[item.listing_type]} {item.listing_type}
                        </span>
                        {item.rating > 0 && (
                          <span className="text-xs text-muted-foreground ml-auto">★ {item.rating.toFixed(1)}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin size={10} /> {item.location}
                      </div>
                      {item.price > 0 && (
                        <p className="font-bold text-primary mt-2 text-sm">
                          Rs. {item.price.toLocaleString()}
                          <span className="text-muted-foreground font-normal text-xs ml-1">
                            {item.listing_type === "stay" ? "/night" : item.listing_type === "vehicle" ? "/day" : ""}
                          </span>
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
