import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/store/useStore";
import { Loader2, Car, MapPin, Gauge, Fuel, Users, Wind, Sparkles, Image as ImageIcon } from "lucide-react";

interface VehicleListing {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  price: number;
  price_unit: string;
  seats: number;
  ac: boolean;
  driver: string;
  fuel: string;
  location: string;
  lat: number;
  lng: number;
  images: string[];
  moderation_status?: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: VehicleListing | null;
}

const VEHICLE_TYPES = [
  { value: "car", label: "Sedan / Hatch", icon: "🚗" },
  { value: "van", label: "Passenger Van", icon: "🚐" },
  { value: "jeep", label: "4x4 / SUV", icon: "🚜" },
  { value: "bus", label: "Luxury Bus", icon: "🚌" },
  { value: "luxury_coach", label: "VIP Coach", icon: "✨" },
];

const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];

const VehicleListingModal = ({ open, onClose, onSuccess, editData }: Props) => {
  const { currentUser, showToast } = useStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    make: "", model: "", year: 2024, type: "car", price: 0, price_unit: "day",
    seats: 4, ac: true, driver: "optional", fuel: "Petrol", location: "", images: [] as string[],
  });

  useEffect(() => {
    if (editData) {
      setForm({
        make: editData.make, model: editData.model, year: editData.year, type: editData.type,
        price: Number(editData.price), price_unit: editData.price_unit, seats: editData.seats,
        ac: editData.ac, driver: editData.driver, fuel: editData.fuel, location: editData.location,
        images: editData.images || [],
      });
    } else {
      setForm({ make: "", model: "", year: 2024, type: "car", price: 0, price_unit: "day", seats: 4, ac: true, driver: "optional", fuel: "Petrol", location: "", images: [] });
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    if (!currentUser) {
      showToast("Authentication session expired.", "error");
      return;
    }
    if (!form.make || !form.model || !form.location || form.price <= 0) {
      showToast("Mandatory specifications missing.", "error");
      return;
    }

    setSaving(true);
    const payload = {
      user_id: currentUser.id, make: form.make, model: form.model, year: form.year, type: form.type,
      price: form.price, price_unit: form.price_unit, seats: form.seats, ac: form.ac,
      driver: form.driver, fuel: form.fuel, location: form.location, images: form.images,
      updated_at: new Date().toISOString(),
      moderation_status: editData ? editData.moderation_status : 'pending',
    };

    let error;
    if (editData) {
      ({ error } = await supabase.from("vehicles_listings").update(payload).eq("id", editData.id));
    } else {
      ({ error } = await supabase.from("vehicles_listings").insert(payload));
    }
    
    setSaving(false);
    if (error) { 
      showToast("Registry reconciliation failure.", "error");
      console.error(error); 
      return; 
    }
    
    showToast(editData ? "Vehicle profile refined." : "Vehicle archived for review.", "success");
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
                <Car size={24} />
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                Luxury Mobility
              </Badge>
            </div>
            <DialogTitle className="text-3xl font-black text-pearl tracking-tight">
              {editData ? "Refine Vehicle Profile" : "Register Fleet Asset"}
            </DialogTitle>
            <p className="text-mist text-xs font-medium mt-1">Specify technical parameters for the registry.</p>
          </DialogHeader>
        </div>

        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Asset Identity</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Manufacturer</Label>
                <Input 
                  value={form.make} 
                  onChange={e => setForm({ ...form, make: e.target.value })} 
                  placeholder="e.g. Mercedes-Benz" 
                  className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Model / Variant</Label>
                <Input 
                  value={form.model} 
                  onChange={e => setForm({ ...form, model: e.target.value })} 
                  placeholder="e.g. S-Class Maybach" 
                  className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20 font-bold"
                />
              </div>
            </div>
          </section>

          {/* Configuration */}
          <section className="grid grid-cols-3 gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <Gauge size={12} /> Vintage
              </Label>
              <Input 
                type="number" 
                min={2000} 
                max={2030} 
                value={form.year} 
                onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 2024 })} 
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Archetype</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                  {VEHICLE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="focus:bg-primary/20 focus:text-primary py-3">
                      <div className="flex items-center gap-3">
                        <span>{t.icon}</span>
                        <span className="font-bold text-xs uppercase tracking-tight">{t.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <Fuel size={12} /> Energy
              </Label>
              <Select value={form.fuel} onValueChange={v => setForm({ ...form, fuel: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                  {FUEL_TYPES.map(f => (
                    <SelectItem key={f} value={f} className="focus:bg-primary/20 focus:text-primary py-3">
                      <span className="font-bold text-xs uppercase tracking-tight">{f}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Performance & Capacity */}
          <section className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Valuation (LKR / Day)</Label>
              <Input 
                type="number" 
                min={0} 
                value={form.price || ""} 
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} 
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20 font-black text-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                <Users size={12} /> Capacity
              </Label>
              <Input 
                type="number" 
                min={1} 
                max={60} 
                value={form.seats || ""} 
                onChange={e => setForm({ ...form, seats: parseInt(e.target.value) || 4 })} 
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20 font-black"
              />
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Operating Region</h3>
            </div>
            <Input 
              value={form.location} 
              onChange={e => setForm({ ...form, location: e.target.value })} 
              placeholder="Primary hub or service area..."
              className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
            />
          </section>

          {/* Options */}
          <section className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Pilot Strategy</Label>
              <Select value={form.driver} onValueChange={v => setForm({ ...form, driver: v })}>
                <SelectTrigger className="bg-obsidian border-white/10 h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                  <SelectItem value="optional">Self Drive (Optional)</SelectItem>
                  <SelectItem value="included">Chauffeur Included</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 px-2">
              <div className="flex items-center gap-3">
                 <Switch 
                   id="ac-switch"
                   checked={form.ac} 
                   onCheckedChange={v => setForm({ ...form, ac: !!v })} 
                 />
                 <Label htmlFor="ac-switch" className="text-[11px] font-black uppercase tracking-widest text-mist flex items-center gap-2 cursor-pointer">
                   <Wind size={14} /> Climate Control
                 </Label>
              </div>
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
                label="Asset Documentation" 
              />
            </div>
          </section>
        </div>

        <div className="p-10 border-t border-white/5 bg-white/[0.02]">
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !form.make || !form.model || !form.location || form.price <= 0} 
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

export default VehicleListingModal;
export type { VehicleListing };
