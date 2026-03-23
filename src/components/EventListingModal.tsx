import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/store/useStore";
import { Loader2, Ticket, MapPin, Calendar, Clock, Banknote, Users, LayoutGrid, Sparkles, Image as ImageIcon } from "lucide-react";

interface EventListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  location: string;
  lat: number;
  lng: number;
  event_date: string;
  event_time: string;
  price_standard: number;
  price_premium: number;
  price_vip: number;
  total_seats: number;
  seat_rows: number;
  seat_cols: number;
  images: string[];
  moderation_status?: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: EventListing | null;
}

const CATEGORIES = [
  { value: "concert", label: "Musical Concert", icon: "🎵" },
  { value: "cinema", label: "Cinema Premiere", icon: "🎬" },
  { value: "sports", label: "Sporting Event", icon: "🏏" },
  { value: "theatre", label: "Theatre Performance", icon: "🎭" },
];

const EventListingModal = ({ open, onClose, onSuccess, editData }: Props) => {
  const { currentUser, showToast } = useStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "concert", venue: "", location: "",
    event_date: "", event_time: "19:00",
    price_standard: 0, price_premium: 0, price_vip: 0,
    total_seats: 100, seat_rows: 10, seat_cols: 10,
    images: [] as string[],
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title, description: editData.description || "", category: editData.category,
        venue: editData.venue, location: editData.location,
        event_date: editData.event_date, event_time: editData.event_time,
        price_standard: Number(editData.price_standard), price_premium: Number(editData.price_premium), price_vip: Number(editData.price_vip),
        total_seats: editData.total_seats, seat_rows: editData.seat_rows, seat_cols: editData.seat_cols,
        images: editData.images || [],
      });
    } else {
      setForm({ title: "", description: "", category: "concert", venue: "", location: "", event_date: "", event_time: "19:00", price_standard: 0, price_premium: 0, price_vip: 0, total_seats: 100, seat_rows: 10, seat_cols: 10, images: [] });
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    if (!currentUser) {
      showToast("Authentication session expired.", "error");
      return;
    }
    if (!form.title || !form.venue || !form.event_date || form.price_standard <= 0) {
      showToast("Core event parameters missing.", "error");
      return;
    }

    setSaving(true);
    const payload = {
      user_id: currentUser.id, title: form.title, description: form.description, category: form.category,
      venue: form.venue, location: form.location || form.venue,
      event_date: form.event_date, event_time: form.event_time,
      price_standard: form.price_standard, price_premium: form.price_premium, price_vip: form.price_vip,
      total_seats: form.total_seats, seat_rows: form.seat_rows, seat_cols: form.seat_cols,
      images: form.images, updated_at: new Date().toISOString(),
      moderation_status: editData ? editData.moderation_status : 'pending',
    };

    let error;
    if (editData) {
      ({ error } = await supabase.from("events_listings").update(payload).eq("id", editData.id));
    } else {
      ({ error } = await supabase.from("events_listings").insert(payload));
    }
    
    setSaving(false);
    if (error) { 
      showToast("Event synchronization failure.", "error");
      console.error(error); 
      return; 
    }
    
    showToast(editData ? "Event profile updated." : "Event archived for review.", "success");
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl bg-zinc-950 border-white/10 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="bg-gradient-to-br from-primary/20 to-transparent p-10 border-b border-white/5">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                <Ticket size={24} />
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                Elite Experiences
              </Badge>
            </div>
            <DialogTitle className="text-3xl font-black text-pearl tracking-tight">
              {editData ? "Refine Event Profile" : "Register Grand Event"}
            </DialogTitle>
            <p className="text-mist text-xs font-medium mt-1">Configure logistics and seating for the event registry.</p>
          </DialogHeader>
        </div>

        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Event Identity</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Official Event Title</Label>
                <Input 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  placeholder="e.g. Symphony Under the Stars"
                  className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Narrative Summary</Label>
                <Textarea 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  placeholder="Provide a compelling overview for potential guests..."
                  className="bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 min-h-[100px] resize-none py-4"
                />
              </div>
            </div>
          </section>

          {/* Logistics */}
          <section className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Experience Archetype</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value} className="focus:bg-primary/20 focus:text-primary py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{c.icon.split(' ')[0]}</span>
                        <span className="font-bold text-xs uppercase tracking-tight">{c.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Official Venue</Label>
              <Input 
                value={form.venue} 
                onChange={e => setForm({ ...form, venue: e.target.value })} 
                placeholder="e.g. Grand Ballroom"
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
              />
            </div>
          </section>

          {/* Schedule */}
          <section className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <Calendar size={12} /> Registry Date
              </Label>
              <Input 
                type="date" 
                value={form.event_date} 
                onChange={e => setForm({ ...form, event_date: e.target.value })} 
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20 invert brightness-200"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <Clock size={12} /> Commencement
              </Label>
              <Input 
                type="time" 
                value={form.event_time} 
                onChange={e => setForm({ ...form, event_time: e.target.value })} 
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
              />
            </div>
          </section>

          {/* Tiers & Pricing */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Banknote size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Investment Structure (LKR)</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-mist/60 ml-px">Standard</Label>
                <Input type="number" value={form.price_standard || ""} onChange={e => setForm({ ...form, price_standard: parseFloat(e.target.value) || 0 })} className="bg-white/5 border-white/10 h-12 rounded-xl text-primary font-black" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-mist/60 ml-px">Premium</Label>
                <Input type="number" value={form.price_premium || ""} onChange={e => setForm({ ...form, price_premium: parseFloat(e.target.value) || 0 })} className="bg-white/5 border-white/10 h-12 rounded-xl text-primary font-black" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-mist/60 ml-px">Elite VIP</Label>
                <Input type="number" value={form.price_vip || ""} onChange={e => setForm({ ...form, price_vip: parseFloat(e.target.value) || 0 })} className="bg-white/5 border-white/10 h-12 rounded-xl text-primary font-black" />
              </div>
            </div>
          </section>

          {/* Audit & Capacity */}
          <section className="grid grid-cols-3 gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <Users size={12} /> Total Pass
              </Label>
              <Input type="number" value={form.total_seats || ""} onChange={e => setForm({ ...form, total_seats: parseInt(e.target.value) || 100 })} className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20 font-black" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <LayoutGrid size={12} /> Grid R
              </Label>
              <Input type="number" value={form.seat_rows || ""} onChange={e => setForm({ ...form, seat_rows: parseInt(e.target.value) || 10 })} className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <LayoutGrid size={12} /> Grid C
              </Label>
              <Input type="number" value={form.seat_cols || ""} onChange={e => setForm({ ...form, seat_cols: parseInt(e.target.value) || 10 })} className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20" />
            </div>
          </section>

          {/* Visuals */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Visual Portfolio</h3>
            </div>
            <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 border-dashed hover:border-white/20 transition-all">
              <ImageUpload 
                bucket="listings" 
                maxFiles={5} 
                onUpload={urls => setForm({ ...form, images: urls })} 
                existingUrls={form.images} 
                label="Promotion Documentation" 
              />
            </div>
          </section>
        </div>

        <div className="p-10 border-t border-white/5 bg-white/[0.02]">
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !form.title || !form.venue || !form.event_date || form.price_standard <= 0} 
            className="w-full h-16 rounded-2xl bg-primary hover:bg-gold-light text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 transition-all active:scale-95"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-3" size={18} />
                Synchronizing Ledger...
              </>
            ) : (
              editData ? "Finalize Profile Update" : "Archive Asset for Review"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventListingModal;
export type { EventListing };
