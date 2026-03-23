import { useState } from "react";
import { useStore } from "@/store/useStore";
import LeafletMap from "@/components/LeafletMap";
import LankaPayModal from "@/components/LankaPayModal";
import { Property } from "@/types";
import { PERMISSIONS, formatPrice } from "@/lib/utils";
import InquiryModal from "@/components/InquiryModal";
import TrustBanner from "@/components/TrustBanner";
import ShareButtons from "@/components/ShareButtons";
import ComparisonTool from "@/components/ComparisonTool";
import ImageUpload from "@/components/ImageUpload";
import { getRecommendations, Recommandable } from "@/lib/recommendations";
import CheckoutModal from "@/components/CheckoutModal";
import ValuationTool from "@/components/ValuationTool";
import { useMemo } from "react";
import { useProperties } from "@/hooks/useListings";

const PropertyPage = () => {
  const { 
    currentUser, userRole,
    favorites, toggleFavorite, 
    addRecentlyViewed, addToCompare, compareItems,
    addNotification
  } = useStore();

  // ── Filter state (must be declared before hook) ─────────
  const [filter, setFilter] = useState({ type: "all", minPrice: "", maxPrice: "", beds: "all", location: "" });

  // ── Real Supabase data via React Query ──────────────────
  const { data: properties = [], isLoading: propertiesLoading } = useProperties({
    location: filter.location || undefined,
    type: filter.type !== "all" ? filter.type : undefined,
    maxPrice: filter.maxPrice ? parseInt(filter.maxPrice) : undefined,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"listings" | "wanted">("listings");
  const [showWantedModal, setShowWantedModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentContext, setPaymentContext] = useState<{ amount: number; description: string; onSuccess: () => void }>({ amount: 0, description: "", onSuccess: (_ref: string) => {} });
  const [showInquiry, setShowInquiry] = useState(false);
  const [listingImages, setListingImages] = useState<string[]>([]);
  const [wantedImages, setWantedImages] = useState<string[]>([]);
  
  const wantedListings = [
    { id: "W001", title: "Looking for 3BR House in Colombo 5/7", location: "Colombo 05 or 07", budget: "Rs. 50M – 70M", beds: 3, area: "2,500+ sq.ft", description: "Family looking for a spacious 3-bedroom house in a quiet residential area with parking and garden.", contact: "Verified Buyer", date: "2024-03-10" },
    { id: "W002", title: "Commercial Space Needed – Pettah", location: "Colombo 11 (Pettah)", budget: "Rs. 150K – 250K /mo", beds: 0, area: "1,000+ sq.ft", description: "Retail business needs ground-floor commercial space with good foot traffic.", contact: "Verified Buyer", date: "2024-03-08" },
    { id: "W003", title: "Beach Plot – South Coast", location: "Galle / Mirissa / Tangalle", budget: "Rs. 20M – 40M", beds: 0, area: "15+ perches", description: "Looking for beachfront or beach-adjacent land for villa development.", contact: "Verified Buyer", date: "2024-03-05" },
  ];

  // Properties are pre-filtered by the useProperties hook (server-side via Supabase query)
  // Client-side bed filter retained since it's not in the hook yet
  const filtered = properties.filter(p => {
    if (filter.beds !== "all" && (p.beds ?? p.bedrooms ?? 0) < parseInt(filter.beds)) return false;
    return true;
  });

  const recommendablePool = useMemo(() => {
    const all: Recommandable[] = [
      ...properties.map(p => ({ id: p.id, type: "property", category: p.property_type, location: p.location, price: p.price, lat: p.lat, lng: p.lng })),
    ];
    return all;
  }, [properties]);

  const recommendations = useMemo(() => {
    if (!selectedProp) return [];
    const current: Recommandable = { 
      id: selectedProp.id, type: "property", category: selectedProp.property_type, 
      location: selectedProp.location, price: selectedProp.price, 
      lat: selectedProp.lat, lng: selectedProp.lng 
    };
    return getRecommendations(current, recommendablePool, 3);
  }, [selectedProp, recommendablePool]);

  const mapMarkers = filtered.map(p => ({ lat: p.lat, lng: p.lng, title: p.title, location: p.location, price: p.price, emoji: "🏘️", type: "property" }));
  const typeColorMap: Record<string, string> = { sale: "bg-emerald/10 text-emerald", rent: "bg-sapphire/10 text-sapphire", lease: "bg-primary/10 text-gold-dark" };

  const initiatePayment = (amount: number, description: string, onSuccess: () => void) => {
    setPaymentContext({ amount, description, onSuccess });
    setShowPayment(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-emerald to-emerald/70 py-10">
        <div className="container">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 text-pearl text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">🏘️ Property Marketplace</div>
              <h1 className="text-pearl text-3xl">Find Your Perfect Property</h1>
              <p className="text-pearl/75 mt-1.5">Sales • Rentals • Leases across Sri Lanka</p>
            </div>
            <div className="flex gap-2">
              {PERMISSIONS.canListProperty(userRole) && (
                <button onClick={() => setShowListingModal(true)} className="bg-primary hover:bg-gold-light text-primary-foreground px-7 py-3 rounded-lg font-bold transition-all">➕ List Property</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border-b border-border">
        <div className="container flex gap-0">
          <button onClick={() => setActiveTab("listings")}
            className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${activeTab === "listings" ? "border-emerald text-emerald" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            🏠 Property Listings
          </button>
          <button onClick={() => setActiveTab("wanted")}
            className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${activeTab === "wanted" ? "border-primary text-gold-dark" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            🔍 Wanted Properties
          </button>
        </div>
      </div>
      <TrustBanner stats={[
        { value: "6,240+", label: "Properties", icon: "🏘️" },
        { value: "890+", label: "Verified Owners", icon: "✓" },
        { value: "Rs. 3.9M", label: "Transacted", icon: "💰" },
        { value: "4.8★", label: "Avg Rating", icon: "⭐" },
      ]} />

      {activeTab === "listings" && (
        <>
          <div className="bg-card border-b border-border py-4">
            <div className="container flex gap-3 items-center flex-wrap">
              <select value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})} className="rounded-md border border-input px-3 py-2 text-sm bg-card w-auto">
                <option value="all">All Types</option><option value="sale">For Sale</option><option value="rent">For Rent</option><option value="lease">For Lease</option>
              </select>
              <input value={filter.location} onChange={e => setFilter({...filter, location: e.target.value})} placeholder="🔍 Location" className="rounded-md border border-input px-3 py-2 text-sm w-44" />
              <input value={filter.minPrice} onChange={e => setFilter({...filter, minPrice: e.target.value})} placeholder="Min Price" className="rounded-md border border-input px-3 py-2 text-sm w-28" type="number" />
              <input value={filter.maxPrice} onChange={e => setFilter({...filter, maxPrice: e.target.value})} placeholder="Max Price" className="rounded-md border border-input px-3 py-2 text-sm w-28" type="number" />
              <select value={filter.beds} onChange={e => setFilter({...filter, beds: e.target.value})} className="rounded-md border border-input px-3 py-2 text-sm bg-card w-auto">
                <option value="all">Any Beds</option><option value="1">1+ Beds</option><option value="2">2+ Beds</option><option value="3">3+ Beds</option><option value="4">4+ Beds</option>
              </select>
              <div className="ml-auto flex gap-1">
                {(["grid","list","map"] as const).map(m => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition-all capitalize ${viewMode === m ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-input"}`}>
                    {m === "grid" ? "⊞" : m === "list" ? "☰" : "🗺️"} {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="container py-10">
            {viewMode === "map" ? (
              <LeafletMap markers={mapMarkers} center={[7.8731, 80.7718]} zoom={8} height="550px" />
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
                {filtered.map(prop => (
                  <div key={prop.id} onClick={() => { setSelectedProp(prop); addRecentlyViewed({ id: prop.id, title: prop.title, type: "property", price: prop.price, image: prop.images[0], location: prop.location }); }} className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border border-border">
                    {viewMode === "grid" ? (
                      <>
                        <div className="h-44 relative overflow-hidden">
                          {prop.images[0].startsWith("http") ? (
                            <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald/10 to-emerald/[0.03] flex items-center justify-center text-6xl">{prop.images[0]}</div>
                          )}
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${typeColorMap[prop.listing_type]}`}>{prop.listing_type === "sale" ? "For Sale" : prop.listing_type === "rent" ? "For Rent" : "For Lease"}</span>
                          </div>
                          <div className="absolute top-3 right-3 flex gap-1.5">
                            <button onClick={e => { e.stopPropagation(); toggleFavorite(prop.id); }}
                              className="w-8 h-8 rounded-full bg-card/90 flex items-center justify-center text-sm border-none cursor-pointer">
                              {favorites.includes(prop.id) ? "❤️" : "🤍"}
                            </button>
                            <button onClick={e => { e.stopPropagation(); addToCompare({ id: prop.id, title: prop.title, itemType: "property", location: prop.location, price: prop.price, subtype: prop.property_type, details: `${prop.bedrooms}BR ${prop.bathrooms}BA ${prop.area_sqft.toLocaleString()}sqft`, features: prop.features.slice(0,3).join(", ") }); addNotification("Added to compare", compareItems.length >= 3 ? "Waitlist full" : "Item added"); }}
                              className="w-8 h-8 rounded-full bg-card/90 flex items-center justify-center text-sm border-none cursor-pointer" title="Compare">
                              📊
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="font-display text-base font-bold mb-1 leading-tight">{prop.title}</div>
                          <div className="text-[13px] text-muted-foreground mb-3">📍 {prop.location}</div>
                          <div className="flex gap-4 mb-3">
                            {prop.bedrooms > 0 && <span className="text-xs text-muted-foreground">🛏 {prop.bedrooms}</span>}
                            {prop.bathrooms > 0 && <span className="text-xs text-muted-foreground">🚿 {prop.bathrooms}</span>}
                            <span className="text-xs text-muted-foreground">📐 {prop.area_sqft.toLocaleString()} sq.ft</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="font-display text-lg font-bold text-emerald">{formatPrice(prop.price)}</div>
                              {prop.listing_type === "rent" && <div className="text-[11px] text-muted-foreground">/ month</div>}
                            </div>
                            <span className="text-[11px] text-muted-foreground">👁 {prop.views}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex">
                        <div className="w-24 flex-shrink-0 overflow-hidden">
                          {prop.images[0].startsWith("http") ? (
                            <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-background flex items-center justify-center text-4xl">{prop.images[0]}</div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex items-center gap-5 flex-wrap">
                          <div className="flex-1 min-w-[200px]">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase mr-2 ${typeColorMap[prop.listing_type]}`}>{prop.listing_type}</span>
                            <div className="font-display text-base font-bold mt-1">{prop.title}</div>
                            <div className="text-[13px] text-muted-foreground">📍 {prop.location}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-xl font-bold text-emerald">{formatPrice(prop.price)}</div>
                            <div className="text-[11px] text-muted-foreground">👁 {prop.views} views</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-5xl mb-3">🏘️</div>
                <h3>No properties found</h3>
                <p className="mt-2">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Wanted Tab - open to ALL roles */}
      {activeTab === "wanted" && (
        <div className="container py-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl mb-1">🔍 Wanted Properties</h2>
              <p className="text-muted-foreground text-sm">Buyers looking for specific properties — connect with them directly.</p>
            </div>
            {PERMISSIONS.canPostWanted(userRole) && (
              <button onClick={() => setShowWantedModal(true)}
                className="bg-primary hover:bg-gold-light text-primary-foreground px-6 py-3 rounded-lg font-bold transition-all">
                ➕ Post Wanted Ad
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {wantedListings.map(w => (
              <div key={w.id} className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-all">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-gold-dark">WANTED</span>
                      <span className="text-[11px] text-muted-foreground">📅 {w.date}</span>
                    </div>
                    <h3 className="text-base font-bold mb-1">{w.title}</h3>
                    <div className="flex gap-4 text-[13px] text-muted-foreground mb-2">
                      <span>📍 {w.location}</span>
                      <span>💰 {w.budget}</span>
                      {w.beds > 0 && <span>🛏 {w.beds}+ beds</span>}
                      <span>📐 {w.area}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{w.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-2">👤 {w.contact}</div>
                    <button onClick={() => addNotification("Enquiry Sent", "Enquiry sent to the buyer!")}
                      className="bg-emerald hover:bg-emerald-light text-accent-foreground px-4 py-2 rounded-lg text-xs font-bold transition-all">
                      📞 Contact Buyer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedProp && (
        <div className="fixed inset-0 bg-obsidian/75 z-[1000] flex items-center justify-center p-5 fade-in" onClick={() => setSelectedProp(null)}>
          <div className="bg-card rounded-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto fade-up" onClick={e => e.stopPropagation()}>
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              {selectedProp.images[0].startsWith("http") ? (
                <img src={selectedProp.images[0]} alt={selectedProp.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald to-emerald/70 flex items-center justify-center text-6xl text-pearl">{selectedProp.images[0]}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent" />
              <div className="absolute bottom-4 left-7 right-7 flex justify-between items-end">
                <div>
                  <h2 className="text-pearl text-xl mb-1">{selectedProp.title}</h2>
                  <p className="text-pearl/75 text-sm">📍 {selectedProp.location} • {selectedProp.property_type}</p>
                </div>
                <button onClick={() => setSelectedProp(null)} className="bg-white/15 border-none text-pearl w-9 h-9 rounded-full cursor-pointer text-lg">✕</button>
              </div>
            </div>
            <div className="p-7">
              <div className="mb-4">
                <ShareButtons title={selectedProp.title} description={`${formatPrice(selectedProp.price)} – ${selectedProp.location}`} />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Price", value: `Rs. ${selectedProp.price.toLocaleString()}${selectedProp.listing_type === "rent" ? "/mo" : ""}` },
                  { label: "Type", value: selectedProp.listing_type.charAt(0).toUpperCase() + selectedProp.listing_type.slice(1) },
                  ...(selectedProp.bedrooms > 0 ? [{ label: "Bedrooms", value: String(selectedProp.bedrooms) }] : []),
                  ...(selectedProp.bathrooms > 0 ? [{ label: "Bathrooms", value: String(selectedProp.bathrooms) }] : []),
                  { label: "Area", value: `${selectedProp.area_sqft.toLocaleString()} sq.ft` },
                  { label: "Listed By", value: selectedProp.owner_id ? "Direct Owner" : "Licensed Broker" },
                  { label: "Views", value: `👁 ${selectedProp.views}` },
                  { label: "Listed On", value: selectedProp.listed },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-background rounded-lg">
                    <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                    <div className="font-bold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
              {selectedProp.owner_id && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 text-xs text-muted-foreground">
                  🎁 <strong className="text-gold-dark">Buyer Discount Available:</strong> 0.5% cashback via seller promo code (owner-listed property only)
                </div>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{selectedProp.description}</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {selectedProp.features?.map(a => <span key={a} className="inline-block px-2 py-0.5 bg-pearl-dark rounded text-[11px] font-medium text-muted-foreground">{a}</span>)}
              </div>
              <LeafletMap markers={[{ lat: selectedProp.lat, lng: selectedProp.lng, title: selectedProp.title, location: selectedProp.location, price: selectedProp.price, emoji: "🏘️", type: "property" }]} center={[selectedProp.lat, selectedProp.lng]} zoom={14} height="250px" />
              <div className="flex gap-2.5 mt-5">
                <button onClick={() => setShowInquiry(true)}
                  className="flex-1 bg-emerald hover:bg-emerald-light text-accent-foreground py-3 rounded-lg font-bold transition-all">📞 Enquire Now</button>
                <button onClick={() => toggleFavorite(selectedProp.id)}
                  className="px-6 py-3 rounded-lg font-bold border border-input bg-card hover:bg-background transition-all">
                  {favorites.includes(selectedProp.id) ? "❤️ Saved" : "🤍 Save"}
                </button>
              </div>

              {/* AI Recommendations Section */}
              <div className="p-10 bg-white/[0.02] border-t border-border">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-emerald">
                  <span className="w-8 h-px bg-emerald/50" />
                  AI Suggestions: Similar Properties
                  <span className="w-8 h-px bg-emerald/50" />
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((rec) => {
                    const original = properties.find(x => x.id === rec.id);
                    if (!original) return null;
                    return (
                      <div key={rec.id} onClick={() => setSelectedProp(original)} className="bg-white/5 border border-border rounded-3xl p-4 flex gap-4 hover:bg-white/10 transition-all cursor-pointer group text-left">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0">
                          <img src={original.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-black uppercase tracking-widest text-emerald mb-1">{original.property_type}</div>
                          <div className="text-sm font-bold truncate mb-1 text-pearl">{original.title}</div>
                          <div className="text-xs font-black text-emerald">{formatPrice(original.price)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Listing Modal */}
      {showListingModal && (
        <div className="fixed inset-0 bg-obsidian/75 z-[1000] flex items-center justify-center p-5 fade-in" onClick={() => setShowListingModal(false)}>
          <div className="bg-card rounded-2xl max-w-[640px] w-full max-h-[90vh] overflow-y-auto fade-up" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-sapphire to-sapphire/70 px-7 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-pearl text-xl mb-1">{PERMISSIONS.canListProperty(userRole) ? "🏡 List Property" : "👤 Register as Provider"}</h2>
                <p className="text-pearl/75 text-sm">Payment via LankaPay</p>
              </div>
              <button onClick={() => setShowListingModal(false)} className="bg-white/15 border-none text-pearl w-9 h-9 rounded-full cursor-pointer text-lg">✕</button>
            </div>
            <div className="p-7">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className="block text-xs font-semibold mb-1">Listing Type</label>
                  <select className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card"><option>For Sale</option><option>For Rent</option><option>For Lease</option></select>
                </div>
                <div><label className="block text-xs font-semibold mb-1">Category</label>
                  <select className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card"><option>House</option><option>Apartment</option><option>Villa</option><option>Land</option><option>Commercial</option></select>
                </div>
              </div>
              <div className="mb-3"><label className="block text-xs font-semibold mb-1">Property Title *</label>
                <input placeholder="e.g. Luxury Villa in Colombo 7" className="w-full rounded-md border border-input px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs font-semibold mb-1">Price (Rs.) *</label><input type="number" placeholder="e.g. 15000000" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Location *</label><input placeholder="e.g. Colombo 07" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div><label className="block text-xs font-semibold mb-1">Bedrooms</label><input type="number" defaultValue={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Bathrooms</label><input type="number" defaultValue={2} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Area (sq.ft)</label><input type="number" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              </div>
              <div className="mb-4"><label className="block text-xs font-semibold mb-1">Description</label>
                <textarea rows={3} placeholder="Describe the property…" className="w-full rounded-md border border-input px-3 py-2 text-sm resize-y" />
              </div>
              <ImageUpload bucket="listings" maxFiles={5} onUpload={setListingImages} label="Property Photos" className="mb-4" />
              <button onClick={() => {
                initiatePayment(
                  userRole === "owner" ? 1000 : 23000,
                  userRole === "owner" ? "Owner Property Listing Fee" : "Broker Monthly Membership",
                  () => { addNotification("Success", "Property listed successfully!"); setShowListingModal(false); }
                );
              }}
                className="w-full bg-emerald hover:bg-emerald-light text-accent-foreground py-3 rounded-lg font-bold transition-all">
                🚀 Submit & Pay via LankaPay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wanted Ad Modal */}
      {showWantedModal && (
        <div className="fixed inset-0 bg-obsidian/75 z-[1000] flex items-center justify-center p-5 fade-in" onClick={() => setShowWantedModal(false)}>
          <div className="bg-card rounded-2xl max-w-[580px] w-full max-h-[90vh] overflow-y-auto fade-up" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-primary to-gold-dark px-7 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-primary-foreground text-xl mb-1">🔍 Post Wanted Ad</h2>
                <p className="text-primary-foreground/75 text-sm">Flat listing fee: Rs. 8,500</p>
              </div>
              <button onClick={() => setShowWantedModal(false)} className="bg-white/15 border-none text-primary-foreground w-9 h-9 rounded-full cursor-pointer text-lg">✕</button>
            </div>
            <div className="p-7">
              <div className="mb-3"><label className="block text-xs font-semibold mb-1">What are you looking for? *</label>
                <input placeholder="e.g. 3BR House in Colombo 7" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs font-semibold mb-1">Preferred Location *</label><input placeholder="e.g. Colombo 05/07" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Budget Range *</label><input placeholder="e.g. Rs. 50M – 70M" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs font-semibold mb-1">Min Bedrooms</label><input type="number" defaultValue={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Min Area (sq.ft)</label><input type="number" placeholder="e.g. 2500" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              </div>
              <div className="mb-3"><label className="block text-xs font-semibold mb-1">Description</label>
                <textarea rows={3} placeholder="Describe what you're looking for…" className="w-full rounded-md border border-input px-3 py-2 text-sm resize-y" /></div>
              <ImageUpload bucket="listings" maxFiles={1} onUpload={setWantedImages} label="Reference Photo (optional)" className="mb-3" />
              <div className="mb-4"><label className="block text-xs font-semibold mb-1">Contact Number *</label>
                <input placeholder="+94 7X XXX XXXX" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 text-xs text-muted-foreground">
                💡 Your wanted ad will be visible for 30 days. Owners and brokers can contact you directly.
              </div>
              <button onClick={() => {
                initiatePayment(8500, "Wanted Property Listing Fee", () => {
                  addNotification("Success", "Wanted ad posted successfully!");
                  setShowWantedModal(false);
                });
              }}
                className="w-full bg-primary hover:bg-gold-light text-primary-foreground py-3 rounded-lg font-bold transition-all">
                💳 Post Ad & Pay Rs. 8,500 via LankaPay
              </button>
            </div>
          </div>
        </div>
      )}

      <CheckoutModal 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        item={{
          title: paymentContext.description,
          price: paymentContext.amount,
          currency: "LKR",
          type: "Property Service"
        }}
        onSuccess={paymentContext.onSuccess}
      />

      {selectedProp && (
        <InquiryModal
          open={showInquiry}
          onClose={() => setShowInquiry(false)}
          listingId={selectedProp.id}
          listingType="property"
          listingTitle={selectedProp.title}
        />
      )}

      <ComparisonTool />
    </div>
  );
};

export default PropertyPage;
