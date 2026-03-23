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
import { Loader2, Home, MapPin, Ruler, Bed, Bath, Banknote, Sparkles, Image as ImageIcon } from "lucide-react";

export interface PropertyListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  subtype: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  location: string;
  lat: number;
  lng: number;
  images: string[];
  moderation_status: string;
  active: boolean;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: PropertyListing | null;
}

const PROPERTY_TYPES = [
  { value: "sale", label: "For Sale", icon: "💰" },
  { value: "rent", label: "For Rent", icon: "🔑" },
  { value: "lease", label: "For Lease", icon: "📄" },
];

const SUBTYPES = [
  { value: "house", label: "Luxury House", icon: "🏡" },
  { value: "apartment", label: "Modern Apartment", icon: "🏢" },
  { value: "land", label: "Prime Land", icon: "🌱" },
  { value: "commercial", label: "Commercial Space", icon: "🏪" },
];

const PropertyListingModal = ({ open, onClose, onSuccess, editData }: Props) => {
  const { currentUser, showToast } = useStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "sale",
    subtype: "house",
    price: 0,
    beds: 0,
    baths: 0,
    area: 0,
    location: "",
    lat: 7.8731,
    lng: 80.7718,
    images: [] as string[],
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title,
        description: editData.description || "",
        type: editData.type,
        subtype: editData.subtype || "house",
        price: Number(editData.price),
        beds: editData.beds || 0,
        baths: editData.baths || 0,
        area: editData.area || 0,
        location: editData.location || "",
        lat: editData.lat || 7.8731,
        lng: editData.lng || 80.7718,
        images: editData.images || [],
      });
    } else {
      setForm({
        title: "",
        description: "",
        type: "sale",
        subtype: "house",
        price: 0,
        beds: 0,
        baths: 0,
        area: 0,
        location: "",
        lat: 7.8731,
        lng: 80.7718,
        images: [],
      });
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    if (!currentUser) {
      showToast("Authentication session expired.", "error");
      return;
    }
    if (!form.title || !form.location || form.price <= 0) {
      showToast("Mandatory property details missing.", "error");
      return;
    }
    
    setSaving(true);
    const payload = {
      user_id: currentUser.id,
      title: form.title,
      description: form.description,
      type: form.type,
      subtype: form.subtype,
      price: form.price,
      beds: form.beds,
      baths: form.baths,
      area: form.area,
      location: form.location,
      lat: form.lat,
      lng: form.lng,
      images: form.images,
      moderation_status: editData ? editData.moderation_status : "pending",
      active: editData ? editData.active : true,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editData) {
      ({ error } = await (supabase.from("properties_listings" as any).update(payload) as any).eq("id", editData.id));
    } else {
      ({ error } = await supabase.from("properties_listings" as any).insert(payload));
    }

    setSaving(false);
    if (error) {
      showToast("Property registry failure.", "error");
      console.error(error);
      return;
    }

    showToast(editData ? "Property profile refined." : "Property archived for review.", "success");
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl bg-zinc-950 border-white/10 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="bg-gradient-to-br from-primary/20 to-transparent p-10 border-b border-white/5">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                <Home size={24} />
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                Premium Real Estate
              </Badge>
            </div>
            <DialogTitle className="text-3xl font-black text-pearl tracking-tight">
              {editData ? "Refine Property Profile" : "Register New Estate"}
            </DialogTitle>
            <p className="text-mist text-xs font-medium mt-1">Configure asset specifications for market integration.</p>
          </DialogHeader>
        </div>

        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Property Identity</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Official Asset Title</Label>
                <Input 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  placeholder="e.g. Skyline Presidential Penthouse"
                  className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Marketing Narrative</Label>
                <Textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  placeholder="Elaborate on the architectural significance and luxury amenities..."
                  className="bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 min-h-[100px] resize-none py-4"
                />
              </div>
            </div>
          </section>

          {/* Classification */}
          <section className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Listing Category</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                  {PROPERTY_TYPES.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="focus:bg-primary/20 focus:text-primary py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{p.icon}</span>
                        <span className="font-bold text-xs uppercase tracking-tight">{p.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Asset Subtype</Label>
              <Select value={form.subtype} onValueChange={(v) => setForm({ ...form, subtype: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                  {SUBTYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="focus:bg-primary/20 focus:text-primary py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{s.icon}</span>
                        <span className="font-bold text-xs uppercase tracking-tight">{s.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Valuation & Dimensions */}
          <section className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <Banknote size={12} /> Market Valuation (LKR)
              </Label>
              <Input 
                type="number" 
                min={0} 
                value={form.price || ""} 
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20 font-black text-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <Ruler size={12} /> Total Area (sq ft)
              </Label>
              <Input 
                type="number" 
                min={0} 
                value={form.area || ""} 
                onChange={(e) => setForm({ ...form, area: parseFloat(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20 font-black"
              />
            </div>
          </section>

          {/* Configuration */}
          <section className="grid grid-cols-3 gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <Bed size={12} /> Bedrooms
              </Label>
              <Input 
                type="number" 
                min={0} 
                value={form.beds || ""} 
                onChange={(e) => setForm({ ...form, beds: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20 font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <Bath size={12} /> Bathrooms
              </Label>
              <Input 
                type="number" 
                min={0} 
                value={form.baths || ""} 
                onChange={(e) => setForm({ ...form, baths: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20 font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <MapPin size={12} /> HUB Location
              </Label>
              <Input 
                value={form.location} 
                onChange={(e) => setForm({ ...form, location: e.target.value })} 
                placeholder="Colombo 07"
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
              />
            </div>
          </section>

          {/* Visual Portfolio */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Visual Portfolio</h3>
            </div>
            <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 border-dashed hover:border-white/20 transition-all">
              <ImageUpload 
                bucket="listings" 
                maxFiles={10} 
                onUpload={(urls) => setForm({ ...form, images: urls })} 
                existingUrls={form.images} 
                label="Asset Documentation Portfolio" 
              />
            </div>
          </section>
        </div>

        <div className="p-10 border-t border-white/5 bg-white/[0.02]">
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !form.title || !form.location || form.price <= 0} 
            className="w-full h-16 rounded-2xl bg-primary hover:bg-gold-light text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 transition-all active:scale-95"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-3" size={18} />
                Synchronizing Registry...
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

export default PropertyListingModal;
