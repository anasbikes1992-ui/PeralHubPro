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
import { Loader2, Store, MapPin, Sparkles, Image as ImageIcon, Banknote, Map as MapIcon } from "lucide-react";
import LeafletMap from "./LeafletMap";

export interface SocialListing {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  featured: boolean;
  fee: string;
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
  editData?: SocialListing | null;
}

const CATEGORIES = [
  { value: "tourism", label: "Tourism & Travel", icon: "🏝️" },
  { value: "food", label: "Gastronomy & Dining", icon: "🍽️" },
  { value: "shopping", label: "Luxury Shopping", icon: "🛍️" },
  { value: "sports", label: "Sports & Wellness", icon: "⚽" },
  { value: "services", label: "Professional Services", icon: "🛠️" },
  { value: "entertainment", label: "Arts & Entertainment", icon: "🎭" },
  { value: "accommodation", label: "Boutique Stays", icon: "🏨" },
  { value: "transport", label: "Elite Transport", icon: "🚗" },
];

const SocialListingModal = ({ open, onClose, onSuccess, editData }: Props) => {
  const { currentUser, showToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    location: "",
    lat: 7.8731,
    lng: 80.7718,
    fee: "",
    images: [] as string[],
  });
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        category: editData.category,
        description: editData.description,
        location: editData.location,
        lat: editData.lat,
        lng: editData.lng,
        fee: editData.fee,
        images: editData.images || [],
      });
    } else {
      setFormData({
        name: "",
        category: "",
        description: "",
        location: "",
        lat: 7.8731,
        lng: 80.7718,
        fee: "",
        images: [],
      });
    }
  }, [editData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Authentication session expired.", "error");
      return;
    }

    if (!formData.name || !formData.category || !formData.location) {
      showToast("Mandatory business data missing.", "error");
      return;
    }

    setLoading(true);
    try {
      const data = {
        user_id: currentUser.id,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        lat: formData.lat,
        lng: formData.lng,
        fee: formData.fee,
        images: formData.images,
        moderation_status: editData ? editData.moderation_status : "pending",
        active: editData ? editData.active : true,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (editData) {
        ({ error } = await (supabase.from("social_listings" as any).update(data) as any).eq("id", editData.id));
      } else {
        ({ error } = await (supabase.from("social_listings" as any).insert(data) as any));
      }

      if (error) throw error;

      showToast(editData ? "Business profile refined." : "Business archived for review.", "success");
      onSuccess();
      onClose();
    } catch (error) {
      showToast("Database synchronization failure.", "error");
      console.error("Error saving social listing:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-zinc-950 border-white/10 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="bg-gradient-to-br from-primary/20 to-transparent p-10 border-b border-white/5">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                <Store size={24} />
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                Corporate Registry
              </Badge>
            </div>
            <DialogTitle className="text-3xl font-black text-pearl tracking-tight">
              {editData ? "Refine Business Registry" : "Register Enterprise"}
            </DialogTitle>
            <p className="text-mist text-xs font-medium mt-1">Provide comprehensive operational data for market integration.</p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Enterprise Identity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Official Business Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sapphire Horizon Luxury"
                  className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Market Segment</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl">
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="focus:bg-primary/20 focus:text-primary py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="font-bold text-xs uppercase tracking-tight">{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Narrative */}
          <section className="space-y-4">
            <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1">Operational Narrative</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Elaborate on your core value proposition and specialized services..."
              className="bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 min-h-[100px] resize-none py-4"
            />
          </section>

          {/* Logistics & Commercials */}
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                  <MapPin size={12} /> Operational HUB
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, District"
                    className="flex-1 bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMap(!showMap)}
                    className={`h-12 w-12 rounded-2xl border-white/10 ${showMap ? 'bg-primary text-white border-primary' : 'bg-white/5'}`}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-mist ml-1 flex items-center gap-1.5">
                  <Banknote size={12} /> Registry Structure
                </Label>
                <Input
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  placeholder="e.g. Premium Tier"
                  className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20 font-bold"
                />
              </div>
            </div>

            {showMap && (
              <div className="h-[250px] rounded-[2rem] overflow-hidden border border-white/10 relative group shadow-inner">
                <LeafletMap
                  height="100%"
                  zoom={13}
                  center={[formData.lat, formData.lng]}
                  onSelectLocation={(lat, lng) => setFormData({ ...formData, lat, lng })}
                  markers={[{ lat: formData.lat, lng: formData.lng, title: formData.name || "Business Location", location: formData.location || "Pinned", type: "property", emoji: "🏢" }]}
                />
                <div className="absolute top-4 right-4 z-[400] bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-black text-primary uppercase tracking-widest pointer-events-none">
                  Click to Pin Location
                </div>
              </div>
            )}
          </section>

          {/* Visuals */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={14} className="text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-mist">Visual Portfolio (Max 3)</h3>
            </div>
            <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 border-dashed hover:border-white/20 transition-all">
              <ImageUpload
                bucket="listings"
                maxFiles={3}
                onUpload={(urls) => setFormData({ ...formData, images: urls.slice(0, 3) })}
                existingUrls={formData.images}
                label="Enterprise Documentation"
              />
            </div>
          </section>
        </form>

        <div className="p-10 border-t border-white/5 bg-white/[0.02] flex gap-4">
          <Button variant="outline" onClick={onClose} className="flex-1 h-16 rounded-2xl border-white/10 hover:bg-white/5 text-mist font-black uppercase tracking-widest text-[11px]">
            Abort
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.name || !formData.category || !formData.location} 
            className="flex-[2] h-16 rounded-2xl bg-primary hover:bg-gold-light text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 transition-all active:scale-95"
          >
            {loading ? (
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

export default SocialListingModal;