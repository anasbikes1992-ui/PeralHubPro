import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { PERMISSIONS, formatPrice } from "@/lib/utils";
import TrustBanner from "@/components/TrustBanner";
import ShareButtons from "@/components/ShareButtons";
import SocialListingModal from "@/components/SocialListingModal"; // This is actually the business reg modal
import { SMEBusiness, SMEProduct } from "@/types";
import { PlusCircle, ShoppingBag, Phone, Globe, CheckCircle } from "lucide-react";

const SMEPage = () => {
  const { 
    smeBusinesses, currentUser, userRole, 
    addNotification, toggleSMEProduct 
  } = useStore();
  
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const categories = [
    { id: "all", label: "All Businesses" },
    { id: "tourism", label: "🏝️ Tourism" },
    { id: "food", label: "🍽️ Food" },
    { id: "shopping", label: "🛍️ Shopping" },
    { id: "services", label: "🛠️ Services" },
  ];

  const filtered = smeBusinesses.filter(biz => {
    const matchesSearch = biz.business_name.toLowerCase().includes(search.toLowerCase()) || 
                         biz.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || biz.category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="py-10" style={{ background: "linear-gradient(135deg, hsl(32 95% 44%), hsl(32 95% 25%))" }}>
        <div className="container flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-pearl text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">🛍️ SME Marketplace</div>
            <h1 className="text-pearl text-3xl font-black">Local SME Hub</h1>
            <p className="text-pearl/75 mt-1.5">Support local businesses • Authentic Sri Lankan products • Verified sellers</p>
          </div>
          {PERMISSIONS.canRegisterSME(userRole) && (
            <button onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-pearl px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/25 transition-all shadow-lg">
              <PlusCircle className="w-5 h-5" /> Register Your Business
            </button>
          )}
        </div>
      </div>

      <TrustBanner stats={[
        { value: "1,200+", label: "SMEs", icon: "🏪" },
        { value: "Verified", label: "Local Sellers", icon: "✅" },
        { value: "4.9★", label: "Trust Score", icon: "⭐" },
        { value: "LankaPay", label: "Secure Payments", icon: "💳" },
      ]} />

      <div className="bg-card border-b border-border py-4 sticky top-16 z-30 backdrop-blur-md bg-card/80">
        <div className="container flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <input 
              type="text" 
              placeholder="Search products, services, or businesses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(c => (
              <button key={c.id} onClick={() => setFilter(c.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold border transition-all ${filter === c.id ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20" : "bg-background text-muted-foreground border-border hover:border-amber-500/50"}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold mb-2">No businesses found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map((biz) => (
              <motion.div key={biz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row border-b border-border">
                  <div className="md:w-64 h-48 md:h-auto overflow-hidden bg-muted flex items-center justify-center text-7xl relative">
                    {biz.images?.[0] ? <img src={biz.images[0]} alt={biz.business_name} className="w-full h-full object-cover" /> : "🏪"}
                    {biz.verified && (
                      <div className="absolute top-4 left-4 bg-emerald/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <CheckCircle className="w-3 h-3" /> VERIFIED
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h2 className="text-2xl font-black mb-1">{biz.business_name}</h2>
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 uppercase tracking-tighter">{biz.category}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"><Phone className="w-4 h-4" /></button>
                          {biz.website && <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"><Globe className="w-4 h-4" /></button>}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{biz.description}</p>
                      <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                        <span className="flex items-center gap-1.5">📍 {biz.location}</span>
                        <span className="flex items-center gap-1.5">📞 {biz.phone}</span>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center bg-muted/30 p-3 rounded-2xl">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">👤</div>)}
                        <span className="ml-4 text-[11px] font-bold text-muted-foreground self-center">Trusted by 2.4k+ locals</span>
                      </div>
                      <button className="bg-amber-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20">Visit Store</button>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                {biz.products && biz.products.length > 0 && (
                  <div className="p-6 bg-muted/10">
                    <h4 className="text-sm font-black mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-600" /> Featured Products
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {biz.products.map((product) => (
                        <div key={product.id} className={`bg-card p-4 rounded-2xl border border-border shadow-sm transition-all ${!product.is_active && "opacity-60 grayscale"}`}>
                          <div className="h-32 mb-3 rounded-xl overflow-hidden bg-muted flex items-center justify-center text-4xl">
                            {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : "📦"}
                          </div>
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-bold text-sm line-clamp-1">{product.name}</h5>
                            {currentUser && biz.owner_id === currentUser.id && (
                              <button onClick={() => toggleSMEProduct(biz.id, product.id)} 
                                className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-black ${product.is_active ? "bg-emerald/10 text-emerald" : "bg-ruby/10 text-ruby"}`}>
                                {product.is_active ? "Active" : "Paused"}
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-black text-amber-600">{formatPrice(product.price)}</span>
                            <button className="bg-background border border-border text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-amber-600 hover:text-white transition-all">Order</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <SocialListingModal 
        open={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          addNotification("Success", "Business registered successfully! Our team will review it shortly.");
          setShowRegisterModal(false);
        }}
      />
    </div>
  );
};

export default SMEPage;
