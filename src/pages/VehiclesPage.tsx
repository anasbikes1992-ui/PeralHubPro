import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import LeafletMap from "@/components/LeafletMap";
import CheckoutModal from "@/components/CheckoutModal";
import InquiryModal from "@/components/InquiryModal";
import TrustBanner from "@/components/TrustBanner";
import ShareButtons from "@/components/ShareButtons";
import ReviewSection from "@/components/ReviewSection";
import RealTimeTracker from "@/components/RealTimeTracker";
import VehicleListingModal from "@/components/VehicleListingModal";
import { Vehicle } from "@/types";
import { PERMISSIONS, formatPrice } from "@/lib/utils";
import { localizeContent } from "@/lib/ai-localizer";
import { PlusCircle, Pencil, Trash2, Sparkles } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getRecommendations, Recommandable } from "@/lib/recommendations";
import { useVehicles } from "@/hooks/useListings";

const VehiclesPage = () => {
  const { 
    currentUser, userRole, 
    addNotification, addRecentlyViewed,
    globalSettings, language
  } = useStore();

  // ── Filter state (must be declared before hook) ─────────
  const [filter, setFilter] = useState({ type: "all", driver: "all", location: "" });
  const navigate = useNavigate();
  const [showListModal, setShowListModal] = useState(false);
  const [editListing, setEditListing] = useState<any | null>(null);

  // ── Real Supabase data via React Query ──────────────────
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles({
    location: filter.location || undefined,
    vehicle_type: filter.type !== "all" ? filter.type : undefined,
    with_driver: filter.driver === "included" ? true : filter.driver === "optional" ? false : undefined,
  });
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ startDate: "", endDate: "", pickupTime: "09:00", returnTime: "09:00", driver: "no", agreedToTerms: false });
  const [showTerms, setShowTerms] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [trackerVehicle, setTrackerVehicle] = useState<Vehicle | null>(null);

  const vehicleTypes = [{ id: "all", label: "All" }, { id: "car", label: "Cars" }, { id: "van", label: "Vans" }, { id: "suv", label: "SUVs" }, { id: "bus", label: "Buses" }, { id: "luxury_coach", label: "Luxury Coach" }];

  // Vehicles are pre-filtered by the useVehicles hook (server-side via Supabase query)
  const filtered = vehicles;

  const recommendablePool = useMemo(() => {
    const all: Recommandable[] = [
      ...vehicles.map(v => ({ id: v.id, type: "vehicle", category: v.vehicle_type, location: v.location, price: v.price_per_day, lat: v.lat, lng: v.lng })),
    ];
    return all;
  }, [vehicles]);

  const recommendations = useMemo(() => {
    if (!selected) return [];
    const current: Recommandable = { 
      id: selected.id, type: "vehicle", category: selected.vehicle_type, 
      location: selected.location, price: selected.price_per_day, 
      lat: selected.lat, lng: selected.lng 
    };
    return getRecommendations(current, recommendablePool, 3);
  }, [selected, recommendablePool]);

  const mapMarkers = filtered.map(v => ({ lat: v.lat, lng: v.lng, title: v.title, location: v.location, price: v.price_per_day, emoji: "🚗", type: "vehicle" as const }));

  const days = form.startDate && form.endDate ? Math.max(1, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000)) : 0;
  const dailyKmLimit = globalSettings.rentals.baseKm;
  const totalKmIncluded = dailyKmLimit * days;
  const driverRate = 3500;
  const excessKmRate = globalSettings.rentals.excessKmRate;
  const baseTotal = selected ? selected.price_per_day * days : 0;
  const driverTotal = form.driver === "yes" && !selected?.with_driver ? driverRate * days : 0;
  const grandTotal = baseTotal + driverTotal;

  const handleBookingSuccess = () => {
    addNotification("Success", "🚗 Vehicle booked successfully! Confirmation sent to your email.");
    const bookedVehicle = selected;
    setSelected(null);
    setShowPayment(false);
    if (bookedVehicle) {
      setTrackerVehicle(bookedVehicle);
      setShowTracker(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-ruby to-ruby/70 py-10">
        <div className="container flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 text-pearl text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">🚗 Vehicle Rental</div>
            <h1 className="text-pearl text-3xl">Rent a Vehicle</h1>
            <p className="text-pearl/75 mt-1.5">Cars • Vans • Jeeps • Buses • Luxury Coaches</p>
          </div>
          <div className="flex gap-2">
            {PERMISSIONS.canListVehicle(userRole) && (
              <button onClick={() => { setEditListing(null); setShowListModal(true); }}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-pearl px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/25 transition-all">
                <PlusCircle className="w-4 h-4" /> List a Vehicle
              </button>
            )}
            <button onClick={() => navigate("/terms")} className="bg-white/10 backdrop-blur-sm border border-white/20 text-pearl px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/20 transition-all">📄 Supplier T&C</button>
          </div>
        </div>
      </div>
      <TrustBanner stats={[
        { value: "1,820+", label: "Vehicles", icon: "🚗" },
        { value: "100km", label: "Daily Included", icon: "📏" },
        { value: "4.9★", label: "Avg Rating", icon: "⭐" },
        { value: "24/7", label: "Roadside Help", icon: "🛡️" },
      ]} />

      <div className="bg-card border-b border-border py-3">
        <div className="container flex gap-2 items-center flex-wrap">
          {vehicleTypes.map(t => (
            <button key={t.id} onClick={() => setFilter({...filter, type: t.id})}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${filter.type === t.id ? "bg-ruby text-pearl border-ruby" : "bg-transparent text-muted-foreground border-input"}`}>{t.label}</button>
          ))}
          <div className="ml-auto flex gap-2">
            <select value={filter.driver} onChange={e => setFilter({...filter, driver: e.target.value})} className="rounded-md border border-input px-3 py-1.5 text-sm bg-card w-auto">
              <option value="all">With / Without Driver</option><option value="included">Driver Included</option><option value="optional">Self Drive</option>
            </select>
            <button onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${viewMode === "map" ? "bg-ruby text-pearl border-ruby" : "bg-transparent text-muted-foreground border-input"}`}>
              {viewMode === "map" ? "⊞ Grid" : "🗺️ Map"}
            </button>
          </div>
        </div>
      </div>

      <div className="container py-10">
        {viewMode === "map" ? (
          <LeafletMap markers={mapMarkers} center={[7.8731, 80.7718]} zoom={8} height="500px" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => { setSelected(v); setForm({ startDate: "", endDate: "", pickupTime: "09:00", returnTime: "09:00", driver: v.with_driver ? "yes" : "no", agreedToTerms: false }); addRecentlyViewed({ id: v.id, title: v.title, type: "vehicle", price: v.price_per_day, image: v.images[0], location: v.location }); }}
                className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border border-border">
                <div className="h-36 relative overflow-hidden">
                  {v.images[0].startsWith("http") ? (
                    <img src={v.images[0]} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ruby/10 to-ruby/[0.03] flex items-center justify-center text-5xl">{v.images[0]}</div>
                  )}
                  <span className="absolute top-2.5 left-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-ruby/10 text-ruby capitalize backdrop-blur-sm">{v.vehicle_type.replace("_", " ")}</span>
                  {currentUser && v.provider_id === currentUser.id && (
                    <div className="absolute bottom-2.5 left-2.5 flex gap-1">
                      <button onClick={e => { e.stopPropagation(); setEditListing(v); setShowListModal(true); }}
                        className="w-7 h-7 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); /* delete logic */ }} className="w-7 h-7 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <span className={`absolute top-2.5 right-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-sm ${v.with_driver ? "bg-emerald/10 text-emerald" : "bg-pearl-dark text-muted-foreground"}`}>
                    {v.with_driver ? "👨‍✈️ Driver Included" : "🔑 Self Drive"}
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-display text-lg font-bold mb-1 flex items-center gap-2">
                    {localizeContent(v.title, language)}
                    {language !== 'en' && <Sparkles size={14} className="text-ruby animate-pulse" />}
                  </div>
                  <div className="flex gap-3 text-[13px] text-muted-foreground mb-2">
                    <span>🗓 {v.year}</span><span>👥 {v.seats} seats</span><span>⛽ {v.fuel}</span>{/* v.ac check? maybe in features */}
                  </div>
                  <div className="flex gap-2 text-[11px] text-muted-foreground mb-3">
                    <span className="bg-background px-2 py-0.5 rounded">📏 {dailyKmLimit}km/day included</span>
                    <span className="bg-background px-2 py-0.5 rounded">🚀 {v.trips} trips</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div><span className="font-display text-xl font-bold text-ruby">Rs. {v.price_per_day.toLocaleString()}</span><span className="text-xs text-muted-foreground">/day</span></div>
                    <div className="flex gap-2.5 text-xs text-muted-foreground"><span>★ {v.rating}</span><span>📍 {v.location}</span></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-obsidian/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-5" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card/95 backdrop-blur-md rounded-2xl max-w-[700px] w-full max-h-[90vh] overflow-y-auto border border-border/50 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="relative h-40 overflow-hidden rounded-t-2xl">
                {selected.images[0].startsWith("http") ? (
                  <img src={selected.images[0]} alt={selected.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-ruby to-ruby/70 flex items-center justify-center text-5xl">{selected.images[0]}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent" />
                <div className="absolute bottom-4 left-7 right-7 flex justify-between items-end">
                  <div>
                    <h2 className="text-pearl text-xl mb-1 flex items-center gap-2">
                      {localizeContent(selected.title, language)}
                      {language !== 'en' && <Sparkles size={18} className="text-ruby animate-pulse" />}
                    </h2>
                    <p className="text-pearl/70 text-sm">📍 {selected.location} • {selected.year} • {selected.seats} seats • ★ {selected.rating}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="bg-white/15 backdrop-blur-sm border-none text-pearl w-9 h-9 rounded-full cursor-pointer hover:bg-white/25 transition-all">✕</button>
                </div>
              </div>
              <div className="p-7">
                <ShareButtons title={selected.title} description={`Rs. ${selected.price_per_day.toLocaleString()}/day – ${selected.location}`} />
                
                <div className="mb-4 mt-4">
                  <label className="block text-xs font-semibold mb-2">Driver Option</label>
                  <div className="flex gap-2">
                    {selected.with_driver ? (
                      <div className="flex-1 p-3 border-2 border-emerald bg-emerald/5 backdrop-blur-sm rounded-lg text-center">
                        <div className="font-bold text-sm text-emerald">👨‍✈️ Driver Included</div>
                        <div className="text-xs text-muted-foreground">Professional driver provided at no extra cost</div>
                      </div>
                    ) : (
                      <>
                        <div onClick={() => setForm({...form, driver: "no"})}
                          className={`flex-1 p-3 border-2 rounded-lg text-center cursor-pointer transition-all ${form.driver === "no" ? "border-ruby bg-ruby/5" : "border-border"}`}>
                          <div className="font-bold text-sm">🔑 Without Driver</div>
                          <div className="text-xs text-muted-foreground">Self-drive, valid license required</div>
                        </div>
                        <div onClick={() => setForm({...form, driver: "yes"})}
                          className={`flex-1 p-3 border-2 rounded-lg text-center cursor-pointer transition-all ${form.driver === "yes" ? "border-ruby bg-ruby/5" : "border-border"}`}>
                          <div className="font-bold text-sm">👨‍✈️ With Driver</div>
                          <div className="text-xs text-muted-foreground">Rs. {driverRate.toLocaleString()}/day extra</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="block text-xs font-semibold mb-1">Pickup Date</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} min={new Date().toISOString().split("T")[0]} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                  <div><label className="block text-xs font-semibold mb-1">Return Date</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} min={form.startDate} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Pickup Time</label>
                    <select value={form.pickupTime} onChange={e => setForm({...form, pickupTime: e.target.value})} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card">
                      {["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map(t => (
                        <option key={t} value={t}>{t.replace(/^(\d+):/, (_, h) => `${parseInt(h) > 12 ? parseInt(h) - 12 : h}:`)}  {parseInt(t) >= 12 ? "PM" : "AM"}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Return Time</label>
                    <select value={form.returnTime} onChange={e => setForm({...form, returnTime: e.target.value})} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card">
                      {["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map(t => (
                        <option key={t} value={t}>{t.replace(/^(\d+):/, (_, h) => `${parseInt(h) > 12 ? parseInt(h) - 12 : h}:`)} {parseInt(t) >= 12 ? "PM" : "AM"}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {days > 0 && (
                  <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 mb-4 border border-border/50">
                    <h4 className="text-sm font-bold mb-3">📊 Trip Summary</h4>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-card rounded-lg">
                        <div className="text-lg font-bold text-ruby">{days}</div>
                        <div className="text-[11px] text-muted-foreground">Days</div>
                      </div>
                      <div className="text-center p-2 bg-card rounded-lg">
                        <div className="text-lg font-bold text-emerald">{totalKmIncluded.toLocaleString()}</div>
                        <div className="text-[11px] text-muted-foreground">KM Included</div>
                      </div>
                      <div className="text-center p-2 bg-card rounded-lg">
                        <div className="text-lg font-bold text-primary">Rs. {excessKmRate}</div>
                        <div className="text-[11px] text-muted-foreground">Per Extra KM</div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[13px]"><span>Pickup: {form.pickupTime} | Return: {form.returnTime}</span></div>
                      <div className="flex justify-between text-[13px]"><span>Base Rate: Rs. {selected.price_per_day.toLocaleString()} × {days} days</span><span>Rs. {baseTotal.toLocaleString()}</span></div>
                      {driverTotal > 0 && <div className="flex justify-between text-[13px]"><span>Driver: Rs. {driverRate.toLocaleString()} × {days} days</span><span>Rs. {driverTotal.toLocaleString()}</span></div>}
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Daily KM allowance: {dailyKmLimit} km/day ({totalKmIncluded} km total)</span></div>
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Excess KM rate</span><span>Rs. {excessKmRate}/km</span></div>
                      <div className="h-px bg-border my-2" />
                      <div className="flex justify-between font-bold text-base"><span>Estimated Total</span><span className="text-ruby">Rs. {grandTotal.toLocaleString()}</span></div>
                      <div className="text-[11px] text-muted-foreground">* Final amount may vary based on actual KM driven</div>
                    </div>
                  </div>
                )}

                {/* Location Map */}
                <div className="mb-4">
                  <h4 className="text-sm font-bold mb-2">📍 Pickup Location</h4>
                  <LeafletMap
                    markers={[{ lat: selected.lat, lng: selected.lng, title: `${selected.make} ${selected.model}`, location: selected.location, emoji: "🚗", type: "vehicle" }]}
                    center={[selected.lat, selected.lng]}
                    zoom={14}
                    height="200px"
                  />
                </div>

                <label className="flex items-start gap-2 text-xs text-muted-foreground mb-4 cursor-pointer">
                  <input type="checkbox" checked={form.agreedToTerms} onChange={e => setForm({...form, agreedToTerms: e.target.checked})} className="mt-0.5 rounded" />
                  <span>I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-primary font-semibold underline">Vehicle Rental Terms & Conditions</button> including the KM limits, excess charges, and cancellation policy.</span>
                </label>

                <button onClick={() => {
                  if (!form.startDate || !form.endDate) { addNotification("Error", "Please select dates."); return; }
                  if (!form.agreedToTerms) { addNotification("Error", "Please agree to the Terms & Conditions."); return; }
                  setShowPayment(true);
                }} className="w-full bg-ruby hover:bg-ruby-light text-pearl py-3 rounded-lg font-bold transition-all mb-2">💳 Book & Pay Rs. {grandTotal.toLocaleString()} via LankaPay</button>
                <button onClick={() => setShowInquiry(true)}
                  className="w-full border border-ruby text-ruby py-2.5 rounded-lg font-bold transition-all hover:bg-ruby/5">📩 Enquire First</button>

                <ReviewSection listingId={selected.id} listingType="vehicle" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showTerms && (
        <div className="fixed inset-0 bg-obsidian/75 backdrop-blur-sm z-[1100] flex items-center justify-center p-5" onClick={() => setShowTerms(false)}>
          <div className="bg-card/95 backdrop-blur-md rounded-2xl max-w-[600px] w-full max-h-[80vh] overflow-y-auto border border-border/50" onClick={e => e.stopPropagation()}>
            <div className="bg-ruby px-7 py-5 flex justify-between items-center">
              <h3 className="text-pearl text-lg font-bold">🚗 Vehicle Rental T&C</h3>
              <button onClick={() => setShowTerms(false)} className="bg-white/15 text-pearl w-8 h-8 rounded-full">✕</button>
            </div>
            <div className="p-7 text-sm text-muted-foreground space-y-3 leading-relaxed">
              <p><strong className="text-foreground">1. Daily KM Limit:</strong> Each rental includes {dailyKmLimit} km per day. Total trip allowance = days × {dailyKmLimit} km.</p>
              <p><strong className="text-foreground">2. Excess KM Charges:</strong> Any km driven beyond the included allowance will be charged at the vehicle's excess km rate (displayed at booking).</p>
              <p><strong className="text-foreground">3. Driver Services:</strong> "With driver" bookings include a licensed, experienced driver. Driver meals and accommodation on multi-day trips are the customer's responsibility.</p>
              <p><strong className="text-foreground">4. Fuel Policy:</strong> Vehicles are provided with a full tank. Return with a full tank or be charged at market rate + Rs. 500 service fee.</p>
              <p><strong className="text-foreground">5. Insurance:</strong> Basic insurance is included. Additional coverage available at booking.</p>
              <p><strong className="text-foreground">6. Cancellation:</strong> Full refund 48hrs+ before pickup. 50% within 24-48hrs. No refund under 24hrs.</p>
              <p><strong className="text-foreground">7. Late Return:</strong> Charged at 150% of the daily rate for each additional day.</p>
              <p><strong className="text-foreground">8. Damage:</strong> Customer liable for damage beyond normal wear. Security deposit covers minor incidents.</p>
              <p><strong className="text-foreground">9. Pickup/Return Times:</strong> Late pickups do not extend the rental period. Early returns are not refunded.</p>
              <button onClick={() => { setShowTerms(false); setForm({...form, agreedToTerms: true}); }}
                className="w-full bg-ruby text-pearl py-2.5 rounded-lg font-bold mt-3">I Agree to These Terms</button>
            </div>
          </div>
        </div>
      )}

      <CheckoutModal 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        item={{
          title: selected?.title || "",
          price: grandTotal,
          currency: selected?.currency || "LKR",
          type: "Vehicle Rental"
        }}
        onSuccess={handleBookingSuccess}
      />

      {selected && (
        <InquiryModal
          open={showInquiry}
          onClose={() => setShowInquiry(false)}
          listingId={selected.id}
          listingType="vehicle"
          listingTitle={`${selected.make} ${selected.model}`}
        />
      )}

      {showTracker && trackerVehicle && (
        <RealTimeTracker
          vehicleName={`${trackerVehicle.make} ${trackerVehicle.model}`}
          startLocation={{ lat: trackerVehicle.lat, lng: trackerVehicle.lng, name: trackerVehicle.location }}
          onClose={() => { setShowTracker(false); setTrackerVehicle(null); }}
        />
      )}

      <VehicleListingModal
        open={showListModal}
        onClose={() => { setShowListModal(false); setEditListing(null); }}
        onSuccess={(_ref) => { addNotification("Success", editListing ? "Vehicle updated!" : "Vehicle published!"); setShowListModal(false); setEditListing(null); }}
        editData={editListing}
      />
    </div>
  );
};

export default VehiclesPage;
