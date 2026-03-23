import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useTranslation } from "react-i18next";
import LeafletMap from "@/components/LeafletMap";
import heroPropertyImg from "@/assets/hero-property.jpg";

const HomePage = () => {
  const { properties, stays, vehicles, events, recentlyViewed } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const categories = [
    { id: "all", label: "All", icon: "🔍" },
    { id: "property", label: "Property", icon: "🏘️" },
    { id: "stays", label: "Stays", icon: "🏨" },
    { id: "vehicles", label: "Vehicles", icon: "🚗" },
    { id: "events", label: "Events", icon: "🎭" },
    { id: "sme", label: "Marketplace", icon: "🏪" },
  ];

  const locationOptions = [
    { value: "all", label: "All Island" },
    { value: "colombo", label: "Colombo" },
    { value: "kandy", label: "Kandy" },
    { value: "galle", label: "Galle" },
    { value: "negombo", label: "Negombo" },
    { value: "ella", label: "Ella" },
  ];

  const stats = [
    { value: "12.4k+", label: "Properties", icon: "🏘️" },
    { value: "3.2k+", label: "Luxury Stays", icon: "🏨" },
    { value: "1.8k+", label: "Vehicles", icon: "🚗" },
    { value: "500+", label: "Live Events", icon: "🎫" },
  ];

  const trendingTags = ["#Beach Villas", "#Penthouse", "#EV Rentals", "#Live Concerts", "#Local Crafts"];

  const categoryCards = [
    { id: "property", title: "Property", subtitle: "Sale • Rent • Lease", icon: "🏘️", count: "6,240+", colorClass: "text-emerald border-emerald", desc: "Find your perfect property across Sri Lanka. Verified owners and licensed brokers." },
    { id: "stays", title: "Stays", subtitle: "Hotels • Villas • Hostels", icon: "🏨", count: "3,180+", colorClass: "text-sapphire border-sapphire", desc: "From 5-star luxury to boutique lodges. Sri Lanka Tourism Board approved." },
    { id: "vehicles", title: "Rent-a-Vehicle", subtitle: "Cars • Vans • Luxury Coaches", icon: "🚗", count: "1,820+", colorClass: "text-ruby border-ruby", desc: "Self-drive or chauffeured. Cars, vans, jeeps, buses island-wide." },
    { id: "events", title: "Events & Cinema", subtitle: "Tickets • Seats • QR Entry", icon: "🎭", count: "540+", colorClass: "text-indigo border-indigo", desc: "Cinema, concerts, and sports. Real-time seat selection with QR tickets." },
    { id: "sme", title: "SME Marketplace", subtitle: "Local Goods • Services", icon: "🏪", count: "1,200+", colorClass: "text-amber-500 border-amber-500", desc: "Support local businesses. Authentic Sri Lankan products, crafts, and services." },
  ];

  const allMarkers = [
    ...properties.map(p => ({ lat: p.lat, lng: p.lng, title: p.title, location: p.location, price: p.price, emoji: "🏘️", type: "property" })),
    ...stays.map(s => ({ lat: s.lat, lng: s.lng, title: s.name, location: s.location, price: s.price_per_night, emoji: "🏨", type: "stay", rating: s.rating })),
    ...vehicles.map(v => ({ lat: v.lat, lng: v.lng, title: v.title, location: v.location, price: v.price_per_day, emoji: "🚗", type: "vehicle" })),
    ...events.map(e => ({ lat: e.lat, lng: e.lng, title: e.title, location: e.venue, emoji: "🎭", type: "event" })),
  ];

  const handleSearch = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=${activeCategory}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(215 35% 7%) 0%, hsl(210 29% 12%) 50%, hsl(210 53% 18%) 100%)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${heroPropertyImg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/[0.04] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-emerald/[0.06] pointer-events-none" />
        <div className="container text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-1.5 bg-primary/15 text-primary text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">✨ Sri Lanka's #1 Ecosystem</div>
            <h1 className="font-display text-pearl font-black leading-tight mb-2" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
              {t("home.hero_title")}
            </h1>
            <h2 className="font-display text-fog/60 font-light mb-6" style={{ fontSize: "clamp(20px, 3vw, 40px)" }}>
              {t("home.hero_subtitle")}
            </h2>
            <p className="text-fog text-base max-w-[600px] mx-auto mb-10 leading-relaxed">
              From colonial bungalows in Nuwara Eliya to high-rise apartments in Colombo. PearlHub is your gateway to the finest assets in Sri Lanka.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="max-w-[700px] mx-auto bg-card rounded-xl p-1.5 pl-5 flex items-center gap-2 shadow-2xl mb-6">
              <span className="text-lg">🔍</span>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="What are you looking for today?"
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="flex-1 border-none outline-none text-base font-body bg-transparent text-foreground" />
              <div className="flex items-center gap-2 border-l border-border pl-3">
                <span className="text-sm">📍</span>
                <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                  className="border-none outline-none text-sm font-medium bg-transparent text-foreground cursor-pointer">
                  {locationOptions.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <button onClick={handleSearch} className="bg-obsidian hover:bg-slate text-pearl px-7 py-3 rounded-lg text-base font-bold transition-all">Search Hub</button>
            </div>

            <div className="flex justify-center gap-2 flex-wrap mb-12">
              {trendingTags.map(tag => (
                <button key={tag} onClick={() => { setSearchQuery(tag.replace("#", "")); handleSearch(); }}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold border border-white/15 text-fog/80 hover:text-pearl hover:border-white/30 transition-all uppercase tracking-wider">
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[700px] mx-auto">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center p-4 rounded-xl" style={{ background: "hsla(210 29% 17% / 0.6)", border: "1px solid hsla(30 33% 96% / 0.08)" }}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-display text-2xl font-bold text-pearl">{s.value}</div>
                <div className="text-[11px] text-fog uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl mb-2">Explore Sri Lanka with Pearl Hub</h2>
            <p className="text-muted-foreground text-base">Four powerful platforms, one seamless experience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryCards.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/${cat.id}`)}
                className="cursor-pointer bg-background rounded-2xl p-7 text-center transition-all hover:-translate-y-1 hover:shadow-xl border-2 border-transparent hover:border-primary/30 group">
                <div className="text-5xl mb-3">{cat.icon}</div>
                <h3 className={`text-xl mb-1 ${cat.colorClass.split(' ')[0]}`}>{cat.title}</h3>
                <div className="text-xs text-muted-foreground font-medium mb-2.5">{cat.subtitle}</div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">{cat.desc}</p>
                <div className={`font-display text-2xl font-bold ${cat.colorClass.split(' ')[0]}`}>{cat.count}</div>
                <div className="text-[11px] text-muted-foreground">listings</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-7">
            <h2 className="text-3xl mb-2">Explore on the Map</h2>
            <p className="text-muted-foreground">Properties, stays, vehicles, and events — all on one interactive map</p>
          </div>
          <LeafletMap markers={allMarkers} center={[7.8731, 80.7718]} zoom={8} height="500px" />
          <div className="flex gap-4 justify-center mt-4 flex-wrap">
            {[["bg-emerald","Properties"],["bg-sapphire","Stays"],["bg-ruby","Vehicles"],["bg-primary","Events"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-[13px]">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="py-12">
          <div className="container">
            <h2 className="text-2xl mb-2">Continue Where You Left Off</h2>
            <p className="text-muted-foreground text-sm mb-6">Your recently viewed listings</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {recentlyViewed.slice(0, 5).map(item => (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => navigate(`/${item.type === "stay" ? "stays" : item.type === "event" ? "events" : item.type === "vehicle" ? "vehicles" : "property"}`)}
                  className="bg-card rounded-xl overflow-hidden border border-border cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
                  {item.image.startsWith("http") ? (
                    <img src={item.image} alt={item.title} className="w-full h-24 object-cover" loading="lazy" />
                  ) : (
                    <div className="h-24 flex items-center justify-center text-3xl bg-background">{item.image}</div>
                  )}
                  <div className="p-3">
                    <div className="font-bold text-sm truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground truncate">📍 {item.location}</div>
                    {item.price && <div className="text-sm font-bold text-primary mt-1">Rs. {item.price.toLocaleString()}</div>}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-gold-dark capitalize mt-1">{item.type}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl mb-2">Why Pearl Hub?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🛡️", title: "Verified Listings", desc: "All property owners provide NIC and deed documentation. Brokers require owner consent." },
              { icon: "💎", title: "Transparent Pricing", desc: "Clear commission structure with no hidden fees. Buyers get cashback on owner sales." },
              { icon: "🗺️", title: "Interactive Maps", desc: "Explore all listings on Leaflet-powered interactive maps with real-time data." },
              { icon: "🎫", title: "QR Ticket System", desc: "Tamper-proof QR-coded tickets for cinema, concerts, and sports events." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-5">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="text-base mb-1.5">{item.title}</h4>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
