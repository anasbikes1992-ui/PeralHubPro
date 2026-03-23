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
import { Loader2, Hotel, MapPin, Sparkles, Image as ImageIcon } from "lucide-react";

interface StayListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  stars: number;
  price_per_night: number;
  location: string;
  lat: number;
  lng: number;
  rooms: number;
  amenities: string[];
  images: string[];
  approved: boolean;
  active: boolean;
  moderation_status?: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: StayListing | null;
}

const STAY_TYPES = [
  { value: "star_hotel", label: "Star Hotel", icon: "🏛️" },
  { value: "villa", label: "Luxury Villa", icon: "🏡" },
  { value: "guest_house", label: "Guest House", icon: "🛌" },
  { value: "hostel", label: "Backpacker Hostel", icon: "🎒" },
  { value: "lodge", label: "Nature Lodge", icon: "🌲" },
];

const AMENITY_OPTIONS = ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Parking", "AC", "Room Service", "Bar", "Beach Access", "Garden", "Laundry"];

const StayListingModal = ({ open, onClose, onSuccess, editData }: Props) => {
  const { currentUser, showToast } = useStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "guest_house",
    stars: 0,
    price_per_night: 0,
    location: "",
    rooms: 1,
    amenities: [] as string[],
    images: [] as string[],
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title,
        description: editData.description || "",
        type: editData.type,
        stars: editData.stars || 0,
        price_per_night: Number(editData.price_per_night),
        location: editData.location,
        rooms: editData.rooms || 1,
        amenities: editData.amenities || [],
        images: editData.images || [],
      });
    } else {
      setForm({ title: "", description: "", type: "guest_house", stars: 0, price_per_night: 0, location: "", rooms: 1, amenities: [], images: [] });
    }
  }, [editData, open]);

  const toggleAmenity = (a: string) => {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      showToast("Authentication session expired.", "error");
      return;
    }
    if (!form.title || !form.location || form.price_per_night <= 0) {
      showToast("Please fulfill all mandatory parameters.", "error");
      return;
    }
    
    setSaving(true);
    const payload = {
      user_id: currentUser.id,
      title: form.title,
      description: form.description,
      type: form.type,
      stars: form.stars,
      price_per_night: form.price_per_night,
      location: form.location,
      rooms: form.rooms,
      amenities: form.amenities,
      images: form.images,
      updated_at: new Date().toISOString(),
      moderation_status: editData ? editData.moderation_status : 'pending',
    };

    let error;
    if (editData) {
      ({ error } = await supabase.from("stays_listings").update(payload).eq("id", editData.id));
    } else {
      ({ error } = await supabase.from("stays_listings").insert(payload));
    }
    
    setSaving(false);
    if (error) { 
      showToast("Database synchronization failure.", "error");
      console.error(error); 
      return; 
    }
    
    showToast(editData ? "Stay profile updated." : "Stay archived for review.", "success");
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
                <Hotel size={24} />
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                Luxury Hospitality
              </Badge>
            </div>
            <DialogTitle className="text-3xl font-black text-pearl tracking-tight">
              {editData ? "Refine Stay Profile" : "Register New Estate"}
            </DialogTitle>
            <p className="text-mist text-xs font-medium mt-1">Provide comprehensive details for market listing.</p>
          </DialogHeader>
        </div>

        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* General */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Essential Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Asset Title</Label>
                <Input 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  placeholder="e.g. Royal Presidential Suite"
                  className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Description Narrative</Label>
                <Textarea 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  placeholder="Elaborate on the unique features and experiences..."
                  className="bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 min-h-[100px] resize-none py-4"
                />
              </div>
            </div>
          </section>

          {/* Configuration */}
          <section className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Asset Category</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                  {STAY_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="focus:bg-primary/20 focus:text-primary py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{t.icon}</span>
                        <span className="font-bold text-xs uppercase tracking-tight">{t.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Star Rating</Label>
              <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl h-12 items-center px-4">
                 {[1,2,3,4,5].map(s => (
                   <button 
                     key={s}
                     onClick={() => setForm({...form, stars: s})}
                     className={`w-6 h-6 flex items-center justify-center transition-all ${s <= form.stars ? "text-gold-dark scale-110" : "text-white/10 hover:text-white/30"}`}
                   >
                     ★
                   </button>
                 ))}
              </div>
            </div>
          </section>

          {/* Pricing & Capacity */}
          <section className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Valuation (LKR / Night)</Label>
              <Input 
                type="number" 
                value={form.price_per_night || ""} 
                onChange={e => setForm({ ...form, price_per_night: parseFloat(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20 font-black text-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Inventory (Rooms)</Label>
              <Input 
                type="number" 
                value={form.rooms || ""} 
                onChange={e => setForm({ ...form, rooms: parseInt(e.target.value) || 1 })}
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20 font-black"
              />
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Geographical Registry</h3>
            </div>
            <Input 
              value={form.location} 
              onChange={e => setForm({ ...form, location: e.target.value })} 
              placeholder="Full address or region..."
              className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
            />
          </section>

          {/* Amenities */}
          <section className="space-y-4">
             <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Included Attributes</Label>
             <div className="flex flex-wrap gap-2">
               {AMENITY_OPTIONS.map(a => (
                 <button 
                   key={a} 
                   type="button" 
                   onClick={() => toggleAmenity(a)}
                   className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                     form.amenities.includes(a) 
                       ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                       : "bg-white/5 text-mist border-white/10 hover:border-white/20"
                   }`}
                 >
                   {a}
                 </button>
               ))}
             </div>
          </section>

          {/* Images */}
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
                label="Portfolio Documentation" 
              />
            </div>
          </section>
        </div>

        <div className="p-10 border-t border-white/5 bg-white/[0.02]">
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !form.title || !form.location || form.price_per_night <= 0} 
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

export default StayListingModal;
export type { StayListing };
