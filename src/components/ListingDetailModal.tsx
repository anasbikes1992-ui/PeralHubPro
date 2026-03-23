import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { formatPrice, cn } from "@/lib/utils";
import { getRecommendations, Recommandable } from "@/lib/recommendations";
import CheckoutModal from "@/components/CheckoutModal"; // Corrected path based on common project structure

// Define specific interfaces for each item type
interface PropertyItem {
  id: string;
  title: string;
  description: string;
  location: string;
  property_type: string;
  price: number;
  currency: string;
  lat: number;
  lng: number;
  images: string[];
}

interface StayItem {
  id: string;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  currency: string;
  lat: number;
  lng: number;
  image: string;
}

interface VehicleItem {
  id: string;
  name: string;
  description: string;
  location: string;
  vehicle_type: string;
  price_per_day: number;
  currency: string;
  lat: number;
  lng: number;
  image: string;
}

interface EventItem {
  id: string;
  name: string;
  description: string;
  venue: string;
  category: string;
  prices: { [key: string]: number };
  currency: string;
  lat: number;
  lng: number;
  image: string;
}

// Union type for all possible item types
type ListingItem = PropertyItem | StayItem | VehicleItem | EventItem;

interface ListingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ListingItem; // Use the union type for better type safety
  type: "property" | "stay" | "vehicle" | "event";
}

const ListingDetailModal = ({ isOpen, onClose, item, type }: ListingDetailModalProps) => {
  const { properties, stays, vehicles, events, addRecentlyViewed } = useStore();
  const [showCheckout, setShowCheckout] = useState(false);

  // Map stores to recommendable pool
  const recommendablePool = useMemo(() => {
    const all: Recommandable[] = [
      ...properties.map(p => ({ id: p.id, type: "property", category: p.property_type || "property", location: p.location, price: p.price, lat: p.lat, lng: p.lng })),
      ...stays.map(s => ({ id: s.id, type: "stay", category: "stay", location: s.location, price: s.price_per_night, lat: s.lat, lng: s.lng })),
      ...vehicles.map(v => ({ id: v.id, type: "vehicle", category: v.vehicle_type || "vehicle", location: v.location, price: v.price_per_day, lat: v.lat, lng: v.lng })),
      ...events.map(e => ({ id: e.id, type: "event", category: e.category || "event", location: e.venue, price: Object.values(e.prices)[0] as number, lat: e.lat, lng: e.lng })),
    ];
    return all;
  }, [properties, stays, vehicles, events]);

  const currentRecommendable: Recommandable = useMemo(() => ({
    id: item.id,
    type: type as string,
    category: (item as any).property_type || (item as any).vehicle_type || (item as any).category || 'stay',
    location: (item as any).location || (item as any).venue,
    price: (item as any).price || (item as any).price_per_night || (item as any).price_per_day || ((item as any).prices ? Object.values((item as any).prices)[0] as number : 0),
    lat: item.lat,
    lng: item.lng
  }), [item, type]);

  const recommendations = useMemo(() => {
    return getRecommendations(currentRecommendable, recommendablePool, 3);
  }, [currentRecommendable, recommendablePool]);

  if (!isOpen) return null;

  const displayPrice = (item as any).price || (item as any).price_per_night || (item as any).price_per_day || ((item as any).prices ? Object.values((item as any).prices)[0] as number : 0);
  const displayCurrency = (item as any).currency || "LKR";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="bg-obsidian border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl my-8"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left: Gallery */}
            <div className="lg:w-3/5 relative aspect-video lg:aspect-auto">
              {((item as any).images?.[0] || (item as any).image) ? (
                <img src={(item as any).images?.[0] || (item as any).image} alt={(item as any).title || (item as any).name || 'Listing'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-6xl">🖼️</div>
              )}
              <button onClick={onClose} className="absolute top-6 left-6 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-pearl hover:bg-black/70 transition-all">✕</button>
            </div>

            {/* Right: Info */}
            <div className="lg:w-2/5 p-10 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30">{type}</span>
                <span className="text-mist text-[11px] font-bold uppercase tracking-wider">📍 {(item as any).location || (item as any).venue || 'Sri Lanka'}</span>
              </div>
              
              <h1 className="text-3xl font-black text-pearl mb-4 leading-tight">{(item as any).title || (item as any).name || 'Premium Selection'}</h1>
              <p className="text-mist text-sm leading-relaxed mb-8 opacity-80">{(item as any).description || "Experience the finest of Sri Lanka in this premium selection. High-end amenities and verified quality guaranteed."}</p>

              <div className="mt-auto pt-8 border-t border-white/10">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-mist mb-1">Price</div>
                    <div className="text-3xl font-black text-primary">{formatPrice(displayPrice, displayCurrency)}<span className="text-xs font-bold text-mist">/ booking</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-mist mb-1">Status</div>
                    <div className="text-sm font-bold text-emerald">Available Now</div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-gradient-to-br from-primary to-gold-dark text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Book This Now
                </button>
              </div>
            </div>
          </div>

          {/* AI Recommendations Section */}
          <div className="p-10 bg-white/[0.02] border-t border-white/5">
            <h3 className="text-sm font-black text-pearl uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-primary/50" />
              AI Suggestions: You Might Also Like
              <span className="w-8 h-px bg-primary/50" />
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec, i) => {
                // Find original item in store to get display info
                const original = [...properties, ...stays, ...vehicles, ...events].find(x => x.id === rec.id);
                if (!original) return null;
                
                return (
                  <div key={rec.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex gap-4 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0">
                      <img src={original.images ? original.images[0] : original.image} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">{rec.type}</div>
                      <div className="text-sm font-bold text-pearl truncate mb-1">{(original as any).title || (original as any).name}</div>
                      <div className="text-xs font-black text-primary">{formatPrice(rec.price, "LKR")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <CheckoutModal 
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        item={{
          title: (item as any).title || (item as any).name,
          price: displayPrice,
          currency: displayCurrency,
          type: type
        }}
        onSuccess={() => {
          // Additional success logic if needed
        }}
      />
    </AnimatePresence>
  );
};

export default ListingDetailModal;
