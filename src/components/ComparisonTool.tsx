import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

const ComparisonTool = () => {
  const { compareItems, removeFromCompare, clearCompare } = useStore();

  if (compareItems.length === 0) return null;

  const metrics = [
    { key: "location", label: "📍 Registry", icon: "🌐" },
    { key: "price", label: "💰 Valuation", icon: "💵" },
    { key: "rating", label: "⭐ Reputation", icon: "★" },
    { key: "type", label: "🏷️ Category", icon: "💎" },
    { key: "details", label: "📐 Parameters", icon: "⚙️" },
    { key: "features", label: "✨ Attributes", icon: "⚡" },
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 200, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: 200, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[2000] p-6 pointer-events-none"
      >
        <div className="container max-w-6xl mx-auto pointer-events-auto">
          <div className="bg-zinc-900/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden shadow-black/80">
            {/* Header */}
            <div className="bg-white/5 px-10 py-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  Market Comparison
                </Badge>
                <h4 className="text-sm font-black text-pearl uppercase tracking-tight">
                  Analyzing <span className="text-primary italic">{compareItems.length} Assets</span>
                </h4>
              </div>
              <button 
                onClick={clearCompare} 
                className="text-[10px] font-black uppercase tracking-widest text-mist hover:text-ruby transition-all"
              >
                Clear Registry
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="p-10 overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-4 gap-8">
                  <div className="col-span-1 py-4">
                     {metrics.map(m => (
                       <div key={m.key} className="h-16 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-mist border-b border-white/5 last:border-0">
                          <span className="text-base opacity-40">{m.icon}</span>
                          {m.label}
                       </div>
                     ))}
                  </div>

                  {compareItems.map(item => (
                    <div key={item.id} className="col-span-1 group relative">
                       <div className="absolute -top-4 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => removeFromCompare(item.id)}
                            className="w-8 h-8 rounded-full bg-ruby text-pearl flex items-center justify-center text-xs shadow-xl active:scale-90 transition-transform"
                          >
                            ✕
                          </button>
                       </div>

                       <div className="mb-6">
                          <div className="h-12 flex items-center mb-4">
                             <h5 className="text-sm font-black text-pearl uppercase leading-tight line-clamp-2">
                               {item.title}
                             </h5>
                          </div>
                          
                          <div className="space-y-0">
                             <div className="h-16 flex items-center text-xs font-bold text-pearl/80 border-b border-white/10">
                                {item.location}
                             </div>
                             <div className="h-16 flex items-center text-sm font-black text-primary border-b border-white/10">
                                {item.price ? formatPrice(item.price, "LKR") : "—"}
                             </div>
                             <div className="h-16 flex items-center text-xs font-bold text-gold-dark border-b border-white/10 gap-1.5">
                                {item.rating ? <><span>★</span> {item.rating}</> : "—"}
                             </div>
                             <div className="h-16 flex items-center text-[10px] font-black uppercase tracking-widest text-mist border-b border-white/10">
                                {item.subtype || item.itemType}
                             </div>
                             <div className="h-16 flex items-center text-[11px] font-medium text-mist/80 border-b border-white/10 line-clamp-2">
                                {item.details || "—"}
                             </div>
                             <div className="h-16 flex items-center text-[11px] font-medium text-mist/80 line-clamp-2">
                                {item.features || "—"}
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComparisonTool;
