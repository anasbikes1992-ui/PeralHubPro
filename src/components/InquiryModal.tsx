import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InquiryModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingType: "property" | "stay" | "vehicle" | "event";
  listingTitle: string;
  ownerId?: string;
}

const InquiryModal = ({ open, onClose, listingId, listingType, listingTitle, ownerId }: InquiryModalProps) => {
  const { showToast } = useStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      showToast("Identity parameters required.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showToast("Invalid communication address.", "error");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("inquiries").insert({
      listing_id: listingId,
      listing_type: listingType,
      sender_name: form.name.trim(),
      sender_email: form.email.trim(),
      sender_phone: form.phone.trim(),
      message: form.message.trim(),
      owner_id: ownerId || null,
    });
    setLoading(false);
    if (error) {
      showToast("Transmission failure. Retry protocol.", "error");
      return;
    }
    showToast("Dispatch successful. Concierge notified.", "success");
    setForm({ name: "", email: "", phone: "", message: "" });
    onClose();
  };

  const typeConfig: Record<string, { icon: string; classes: string }> = {
    property: { icon: "🏘️", classes: "from-emerald to-emerald-dark" },
    stay: { icon: "🏨", classes: "from-sapphire to-sapphire-dark" },
    vehicle: { icon: "🚗", classes: "from-ruby to-ruby-dark" },
    event: { icon: "🎟️", classes: "from-indigo to-indigo-dark" },
  };

  const config = typeConfig[listingType] || typeConfig.property;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-[2500] flex items-center justify-center p-5" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-zinc-900 border border-white/10 rounded-[2.5rem] max-w-[520px] w-full overflow-hidden shadow-2xl shadow-black/50" 
            onClick={e => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-br ${config.classes} p-10 relative overflow-hidden`}>
              <div className="absolute -right-4 -top-4 text-9xl opacity-10 rotate-12">{config.icon}</div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <Badge className="bg-white/20 text-pearl border-white/30 text-[9px] font-black uppercase tracking-widest mb-4">
                    Inquiry Protocol
                  </Badge>
                  <h3 className="text-3xl font-black text-pearl tracking-tight leading-tight">Secure <span className="opacity-70">Manifest</span></h3>
                  <p className="text-pearl/60 text-xs font-medium uppercase tracking-widest mt-2">{listingTitle}</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-pearl transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Legal Name</label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    placeholder="Concierge client"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Email Address</label>
                  <input 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    placeholder="client@registry.com" 
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Contact Phone (Optional)</label>
                <input 
                  value={form.phone} 
                  onChange={e => setForm({ ...form, phone: e.target.value })} 
                  placeholder="+94 7X XX XX XXX"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Inquiry Details</label>
                <textarea 
                  value={form.message} 
                  onChange={e => setForm({ ...form, message: e.target.value })} 
                  rows={4}
                  placeholder="Express your interest or request specific parameters..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all resize-none" 
                />
              </div>

              <div className="pt-4">
                 <Button 
                   onClick={handleSubmit} 
                   disabled={loading}
                   className="w-full bg-primary hover:bg-gold-light text-primary-foreground h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20"
                 >
                   {loading ? "Transmitting..." : "Dispatch Secure Inquiry"}
                 </Button>
                 <p className="text-[9px] font-black text-mist text-center mt-6 uppercase tracking-widest opacity-40">
                   Privacy Secured • Concierge Verified • SSL Encrypted
                 </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InquiryModal;
