import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import InquiryModal from "@/components/InquiryModal";
import TrustBanner from "@/components/TrustBanner";
import ShareButtons from "@/components/ShareButtons";
import ReviewSection from "@/components/ReviewSection";
import EventListingModal from "@/components/EventListingModal";
import { PearlEvent } from "@/types";
import { PERMISSIONS, formatPrice } from "@/lib/utils";
import { localizeContent } from "@/lib/ai-localizer";
import { getRecommendations, Recommandable } from "@/lib/recommendations";
import { useEvents } from "@/hooks/useListings";
import CheckoutModal from "@/components/CheckoutModal";
import { useMemo } from "react";
import { PlusCircle, Pencil, Trash2, Sparkles } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const EventsPage = () => {
  const { 
    addNotification, addRecentlyViewed,
    globalSettings, language, currentUser, userRole,
  } = useStore();

  // ── Filter state (must be declared before hook) ─────────
  const [filter, setFilter] = useState("all");
  const [showListModal, setShowListModal] = useState(false);
  const [editListing, setEditListing] = useState<any | null>(null);

  // ── Real Supabase data via React Query ──────────────────
  const { data: events = [], isLoading: eventsLoading } = useEvents({
    category: filter !== "all" ? filter : undefined,
  });
  const [selected, setSelected] = useState<PearlEvent | null>(null);
  const [ticketType, setTicketType] = useState("standard");
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [step, setStep] = useState(1);
  const [seatConfig, setSeatConfig] = useState({ vipRows: 2, premiumRows: 4 });
  const [showPayment, setShowPayment] = useState(false);
  const [gateTime, setGateTime] = useState("18:00");
  const [showInquiry, setShowInquiry] = useState(false);

  const eventCategories = [{ id: "all", label: "All Events" }, { id: "cinema", label: "🎬 Cinema" }, { id: "concert", label: "🎵 Concerts" }, { id: "sports", label: "🏏 Sports" }];

  // Events are pre-filtered by the useEvents hook (server-side via Supabase query)
  const filtered = events;

  const recommendablePool = useMemo(() => {
    const all: Recommandable[] = [
      ...events.map(e => ({ id: e.id, type: "event", category: e.category, location: e.venue, price: Object.values(e.prices)[0] as number, lat: e.lat, lng: e.lng })),
    ];
    return all;
  }, [events]);

  const recommendations = useMemo(() => {
    if (!selected) return [];
    const current: Recommandable = { 
      id: selected.id, type: "event", category: selected.category, 
      location: selected.venue, price: Object.values(selected.prices)[0] as number, 
      lat: selected.lat, lng: selected.lng 
    };
    return getRecommendations(current, recommendablePool, 3);
  }, [selected, recommendablePool]);

  const toggleSeat = (idx: number) => {
    if (!selected || selected.seats.booked.includes(idx)) return;
    setSelectedSeats(prev => prev.includes(idx) ? prev.filter(s => s !== idx) : prev.length < quantity ? [...prev, idx] : prev);
  };

  const getSeatType = (row: number) => {
    if (row < seatConfig.vipRows) return "vip";
    if (row < seatConfig.vipRows + seatConfig.premiumRows) return "premium";
    return "standard";
  };

  const price = selected ? selected.prices[ticketType] || 0 : 0;
  const tax = price * globalSettings.events.tax;
  const grandTotal = (price + tax) * (selectedSeats.length || quantity);

  return (
    <div className="min-h-screen bg-background">
      <div className="py-10" style={{ background: "linear-gradient(135deg, hsl(256 57% 29%), hsl(256 57% 12%))" }}>
        <div className="container flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 text-pearl text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">🎭 Events & Entertainment</div>
            <h1 className="text-pearl text-3xl">Discover Events</h1>
            <p className="text-pearl/75 mt-1.5">Cinema • Concerts • Sports • QR-Coded Tickets</p>
          </div>
          {PERMISSIONS.canListEvent(userRole) && (
            <button onClick={() => { setEditListing(null); setShowListModal(true); }}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-pearl px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-white/25 transition-all">
              <PlusCircle className="w-4 h-4" /> Create Event
            </button>
          )}
        </div>
      </div>
      <TrustBanner stats={[
        { value: "540+", label: "Events", icon: "🎭" },
        { value: "QR Coded", label: "Secure Tickets", icon: "🎫" },
        { value: "4.8★", label: "Avg Rating", icon: "⭐" },
        { value: "50K+", label: "Tickets Sold", icon: "🎟️" },
      ]} />

      <div className="bg-card border-b border-border py-3">
        <div className="container flex gap-2 flex-wrap">
          {eventCategories.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${filter === c.id ? "text-pearl border-indigo" : "bg-transparent text-muted-foreground border-input"}`}
              style={filter === c.id ? { background: "hsl(256 57% 29%)" } : {}}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((evt, i) => (
            <motion.div key={evt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => { setSelected(evt); setStep(1); setSelectedSeats([]); setQuantity(1); setTicketType("standard"); setGateTime("18:00"); setSeatConfig({ vipRows: Math.max(1, Math.floor(evt.seats.rows * 0.1)), premiumRows: Math.max(1, Math.floor(evt.seats.rows * 0.2)) }); addRecentlyViewed({ id: evt.id, title: evt.title, type: "event", price: evt.prices.standard, image: evt.image, location: evt.venue }); }}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-border flex">
              <div className="w-28 flex-shrink-0 overflow-hidden">
                {evt.image.startsWith("http") ? (
                  <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg, hsl(256 57% 29% / 0.1), transparent)" }}>{evt.image}</div>
                )}
              </div>
              <div className="p-4 flex-1">
                <div className="flex gap-1.5 mb-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sapphire/10 text-sapphire capitalize">{evt.category}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-gold-dark">🎫 {evt.availableSeats} left</span>
                </div>
                <div className="font-display text-base font-bold mb-1 flex items-center gap-2">
                  {localizeContent(evt.title, language)}
                  {language !== 'en' && <Sparkles size={12} className="text-indigo animate-pulse" />}
                </div>
                <div className="text-[13px] text-muted-foreground mb-1">🏛 {evt.venue}</div>
                <div className="text-[13px] text-muted-foreground mb-2.5">📅 {evt.date} • ⏰ {evt.time}</div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-muted-foreground">from </span>
                    <span className="font-display text-lg font-bold text-indigo">Rs. {evt.prices.standard.toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-md text-pearl" style={{ background: "hsl(256 57% 29%)" }}>Book Now</span>
                  <button onClick={(e) => { e.stopPropagation(); setSelected(evt); setShowInquiry(true); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-md border border-indigo text-indigo hover:bg-indigo/5">📩</button>
                  {currentUser && evt.provider_id === currentUser.id && (
                    <>
                      <button onClick={e => { e.stopPropagation(); setEditListing(evt); setShowListModal(true); }}
                        className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); /* delete logic */ }} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-obsidian/75 z-[1000] flex items-center justify-center p-5" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl max-w-[850px] w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="relative h-40 overflow-hidden rounded-t-2xl">
                {selected.image.startsWith("http") ? (
                  <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl" style={{ background: "linear-gradient(135deg, hsl(256 57% 29%), hsl(256 57% 12%))" }}>{selected.image}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent" />
                <div className="absolute bottom-4 left-7 right-7 flex justify-between items-end">
                  <div>
                    <h2 className="text-pearl text-xl mb-1 flex items-center gap-2">
                      {localizeContent(selected.title, language)}
                      {language !== 'en' && <Sparkles size={16} className="text-indigo animate-pulse" />}
                    </h2>
                    <p className="text-pearl/70 text-sm">🏛 {selected.venue} • 📅 {selected.date} • ⏰ {selected.time}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="bg-white/15 border-none text-pearl w-9 h-9 rounded-full cursor-pointer">✕</button>
                </div>
              </div>
              <div className="p-7">
                <ShareButtons title={selected.title} description={`${selected.venue} – ${selected.date}`} />

                {/* Steps */}
                <div className="flex gap-2 mb-6 mt-4">
                  {["Select Tickets","Configure & Choose Seats","Confirm & Pay"].map((s, i) => (
                    <div key={s} className="flex-1 text-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-1 text-xs font-bold ${i + 1 <= step ? "text-pearl" : "bg-pearl-dark text-muted-foreground"}`}
                        style={i + 1 <= step ? { background: "hsl(256 57% 29%)" } : {}}>{i + 1}</div>
                      <div className={`text-[11px] ${i + 1 === step ? "text-indigo font-bold" : "text-muted-foreground"}`}>{s}</div>
                    </div>
                  ))}
                </div>

                {step === 1 && (
                  <div>
                    <h4 className="mb-4 text-sm">Select Ticket Type & Quantity</h4>
                    <div className="flex flex-col gap-2.5 mb-5">
                      {Object.entries(selected.prices).map(([type, p]) => (
                        <div key={type} onClick={() => setTicketType(type)}
                          className={`p-3.5 border-2 rounded-lg cursor-pointer flex justify-between items-center transition-all ${ticketType === type ? "border-indigo bg-indigo/5" : "border-border"}`}>
                          <div>
                            <div className="font-bold capitalize text-sm">{type === "vip" ? "👑 VIP" : type === "premium" ? "⭐ Premium" : "🎫 Standard"}</div>
                            <div className="text-xs text-muted-foreground">{type === "vip" ? `Front ${seatConfig.vipRows} rows, exclusive` : type === "premium" ? `Rows ${seatConfig.vipRows + 1}-${seatConfig.vipRows + seatConfig.premiumRows}` : "General seating"}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-lg font-bold text-indigo">Rs. {p.toLocaleString()}</div>
                            <div className="text-[11px] text-muted-foreground">+ Rs. {Math.round(p * 0.15).toLocaleString()} tax</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <label className="text-sm font-semibold">Tickets:</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full border border-input bg-card text-lg cursor-pointer">−</button>
                        <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-8 h-8 rounded-full border border-input bg-card text-lg cursor-pointer">+</button>
                      </div>
                    </div>
                    <div className="mb-5">
                      <label className="block text-xs font-semibold mb-1">Gate Opening Time</label>
                      <select value={gateTime} onChange={e => setGateTime(e.target.value)} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card">
                        {["16:00","17:00","18:00","19:00","20:00"].map(t => (
                          <option key={t} value={t}>{t.replace(/^(\d+):/, (_, h) => `${parseInt(h) > 12 ? parseInt(h) - 12 : h}:`)} {parseInt(t) >= 12 ? "PM" : "AM"}</option>
                        ))}
                      </select>
                      <p className="text-[11px] text-muted-foreground mt-1">Arrive at least 30 minutes before the event starts.</p>
                    </div>
                    <button onClick={() => setStep(2)} className="w-full text-pearl py-3 rounded-lg font-bold transition-all text-center" style={{ background: "hsl(256 57% 29%)" }}>Configure Seats →</button>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm">Select {quantity} Seat{quantity > 1 ? "s" : ""}</h4>
                      <span className="text-[13px] text-muted-foreground">{selectedSeats.length}/{quantity} selected</span>
                    </div>
                    <div className="bg-background rounded-lg p-3 mb-4 flex gap-4 items-center flex-wrap">
                      <span className="text-xs font-semibold">Seat Zones:</span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span>VIP Rows:</span>
                        <input type="number" min={1} max={selected.seats.rows - seatConfig.premiumRows - 1} value={seatConfig.vipRows}
                          onChange={e => setSeatConfig({...seatConfig, vipRows: parseInt(e.target.value) || 1})}
                          className="w-12 border border-input rounded px-1.5 py-0.5 text-center text-xs" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span>Premium Rows:</span>
                        <input type="number" min={1} max={selected.seats.rows - seatConfig.vipRows - 1} value={seatConfig.premiumRows}
                          onChange={e => setSeatConfig({...seatConfig, premiumRows: parseInt(e.target.value) || 1})}
                          className="w-12 border border-input rounded px-1.5 py-0.5 text-center text-xs" />
                      </div>
                      <span className="text-xs text-muted-foreground">Standard: {selected.seats.rows - seatConfig.vipRows - seatConfig.premiumRows} rows</span>
                    </div>
                    <div className="text-center mb-4">
                      <div className="h-2 rounded-full max-w-[300px] mx-auto mb-2" style={{ background: "linear-gradient(to bottom, hsl(256 57% 15%), transparent)" }} />
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider">SCREEN / STAGE</div>
                    </div>
                    <div className="flex flex-col gap-1 items-center max-h-[300px] overflow-y-auto py-2">
                      {Array.from({ length: selected.seats.rows }, (_, r) => {
                        const rowType = getSeatType(r);
                        return (
                          <div key={r} className="flex gap-[3px] items-center">
                            <div className="w-5 text-[10px] text-muted-foreground text-center flex-shrink-0">{String.fromCharCode(65 + r)}</div>
                            {Array.from({ length: selected.seats.cols }, (_, c) => {
                              const idx = r * selected.seats.cols + c;
                              const isBooked = selected.seats.booked.includes(idx);
                              const isSel = selectedSeats.includes(idx);
                              return (
                                <button key={c} onClick={() => toggleSeat(idx)} title={`${String.fromCharCode(65 + r)}${c + 1} (${rowType})`}
                                  className={`seat ${isBooked ? "seat-booked" : isSel ? "seat-selected" : rowType === "vip" ? "seat-vip" : rowType === "premium" ? "seat-premium" : "seat-available"}`}>{c + 1}</button>
                              );
                            })}
                            <div className="w-12 text-[9px] text-muted-foreground text-center flex-shrink-0 capitalize">{rowType}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 justify-center mt-4 flex-wrap">
                      {[["bg-emerald-light","Standard"],["bg-indigo","Premium"],["bg-sapphire","VIP"],["bg-primary","Selected"],["bg-pearl-dark","Booked"]].map(([color, label]) => (
                        <div key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><div className={`w-3.5 h-3 rounded-t ${color}`} />{label}</div>
                      ))}
                    </div>
                    <div className="flex gap-2.5 mt-5">
                      <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg font-semibold border border-input bg-card text-sm">← Back</button>
                      <button onClick={() => { if (selectedSeats.length < quantity) { addNotification("Error", `Select ${quantity} seat(s).`); return; } setStep(3); }}
                        className="flex-1 text-pearl py-2.5 rounded-lg font-bold text-sm" style={{ background: "hsl(256 57% 29%)" }}>Confirm Seats →</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h4 className="mb-4 text-sm">Booking Summary</h4>
                    <div className="bg-background rounded-lg p-5 mb-5">
                      <div className="flex gap-4 flex-wrap mb-4">
                        <div className="flex-1"><div className="text-xs text-muted-foreground">Event</div><div className="font-bold">{selected.title}</div></div>
                        <div><div className="text-xs text-muted-foreground">Date & Time</div><div className="font-bold">{selected.date} {selected.time}</div></div>
                      </div>
                      <div className="flex gap-4 flex-wrap mb-4">
                        <div><div className="text-xs text-muted-foreground">Gate Opens</div><div className="font-bold">{gateTime.replace(/^(\d+):/, (_, h) => `${parseInt(h) > 12 ? parseInt(h) - 12 : h}:`)} {parseInt(gateTime) >= 12 ? "PM" : "AM"}</div></div>
                        <div><div className="text-xs text-muted-foreground">Event Starts</div><div className="font-bold">{selected.time}</div></div>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-4">
                        {selectedSeats.map(s => {
                          const row = Math.floor(s / selected.seats.cols);
                          const col = (s % selected.seats.cols) + 1;
                          const type = getSeatType(row);
                          return <span key={s} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sapphire/10 text-sapphire">
                            {String.fromCharCode(65 + row)}{col} ({type})
                          </span>;
                        })}
                      </div>
                       <div className="flex justify-between text-[13px] mb-1.5"><span className="capitalize">{ticketType} × {selectedSeats.length}</span><span>Rs. {(price * selectedSeats.length).toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>Entertainment Tax ({globalSettings.events.tax * 100}%)</span><span>Rs. {Math.round(tax * selectedSeats.length).toLocaleString()}</span></div>
                      <div className="h-px bg-border my-2" />
                      <div className="flex justify-between font-bold text-lg"><span>Grand Total</span><span className="text-indigo">Rs. {grandTotal.toLocaleString()}</span></div>
                    </div>
                    <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 mb-5">
                      <div className="w-20 h-20 bg-pearl-dark rounded-lg flex items-center justify-center text-4xl flex-shrink-0">📱</div>
                      <div>
                        <div className="font-bold mb-1 text-sm">QR Ticket System</div>
                        <div className="text-[13px] text-muted-foreground leading-relaxed">Tamper-proof QR-coded tickets sent to your email & SMS.</div>
                        <div className="text-[11px] text-primary font-mono mt-1.5">Ticket ID: PH-TKT-{selected.id}-{Date.now()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-lg font-semibold border border-input bg-card text-sm">← Back</button>
                      <button onClick={() => setShowPayment(true)}
                        className="flex-1 text-pearl py-3 rounded-lg font-bold text-sm" style={{ background: "hsl(256 57% 29%)" }}>💳 Pay Rs. {grandTotal.toLocaleString()} via LankaPay</button>
                    </div>

                    <ReviewSection listingId={selected.id} listingType="event" />
                  </div>
                )}
              </div>

              {/* AI Recommendations Section */}
              <div className="p-10 bg-white/[0.02] border-t border-border">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-indigo">
                  <span className="w-8 h-px bg-indigo/50" />
                  AI Suggestions: Similar Events
                  <span className="w-8 h-px bg-indigo/50" />
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((rec) => {
                    const original = events.find(x => x.id === rec.id);
                    if (!original) return null;
                    return (
                      <div key={rec.id} onClick={() => setSelected(original)} className="bg-white/5 border border-border rounded-3xl p-4 flex gap-4 hover:bg-white/10 transition-all cursor-pointer group text-left">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0">
                          <img src={original.image} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-black uppercase tracking-widest text-indigo mb-1">{original.category}</div>
                          <div className="text-sm font-bold truncate mb-1 text-pearl">{original.title}</div>
                          <div className="text-xs font-black text-indigo">{formatPrice(Object.values(original.prices)[0] as number)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CheckoutModal 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        item={{
          title: selected?.title || "",
          price: grandTotal,
          currency: "LKR",
          type: "Event Ticket"
        }}
        onSuccess={(_ref) => { 
          addNotification("Success", "🎫 Tickets booked! QR codes sent to your email."); 
          setSelected(null); 
          setShowPayment(false); 
        }}
      />

      {selected && (
        <InquiryModal
          open={showInquiry}
          onClose={() => setShowInquiry(false)}
          listingId={selected.id}
          listingType="event"
          listingTitle={selected.title}
        />
      )}

      <EventListingModal
        open={showListModal}
        onClose={() => { setShowListModal(false); setEditListing(null); }}
        onSuccess={() => { addNotification("Success", editListing ? "Event updated!" : "Event published!"); setShowListModal(false); setEditListing(null); }}
        editData={editListing}
      />
    </div>
  );
};

export default EventsPage;
