import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ContactPage = () => {
  const { showToast } = useStore();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  return (
    <div className="min-h-screen bg-obsidian text-pearl font-sans selection:bg-primary/30">
      <div className="bg-gradient-to-br from-obsidian via-zinc-900 to-primary/10 py-24 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="container px-6 mx-auto relative z-10 text-center">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            Registry & Support
          </Badge>
          <h1 className="text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-pearl via-pearl to-mist bg-clip-text text-transparent mb-4">
            Connect with <span className="text-primary italic">Pearl Hub</span>
          </h1>
          <p className="text-mist text-lg font-medium max-w-2xl mx-auto opacity-70">
            Our global concierge team is available 24/7 for high-value asset consultations and platform support.
          </p>
        </div>
      </div>

      <div className="container px-6 mx-auto py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h2 className="text-3xl font-black text-pearl mb-8 tracking-tight uppercase">Direct Inquiry</h2>
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Full Name</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="Alexander Perera"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Email Address</label>
                  <input 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    type="email" 
                    placeholder="alex@example.lk"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Subject</label>
                  <input 
                    value={form.subject} 
                    onChange={e => setForm({...form, subject: e.target.value})} 
                    placeholder="Asset Acquisition"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Message Details</label>
                <textarea 
                  rows={5} 
                  value={form.message} 
                  onChange={e => setForm({...form, message: e.target.value})} 
                  placeholder="Tell us about your requirements..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all resize-none" 
                />
              </div>
              <Button 
                onClick={() => { 
                  showToast("Inquiry dispatched. Our concierge will contact you shortly.", "success"); 
                  setForm({ name: "", email: "", subject: "", message: "" }); 
                }}
                className="w-full bg-primary hover:bg-gold-light text-primary-foreground h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20"
              >
                Dispatch Inquiry
              </Button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right duration-700 space-y-12">
            <div>
              <h2 className="text-3xl font-black text-pearl mb-8 tracking-tight uppercase">Headquarters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: "📍", label: "Global HQ", value: "42 Galle Face Centre Road, Colombo 03" },
                  { icon: "📞", label: "Concierge", value: "+94 11 234 5678" },
                  { icon: "📧", label: "Diplomatic", value: "support@pearlhub.lk" },
                  { icon: "🕐", label: "Availability", value: "Mon–Sat: 08:00 – 18:00" },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.08] transition-all group overflow-hidden relative">
                    <div className="absolute -right-2 -top-2 text-5xl opacity-5 group-hover:scale-125 transition-transform duration-700">{item.icon}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-mist mb-2">{item.label}</div>
                    <div className="text-sm font-bold text-pearl leading-relaxed">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-white/5 rounded-[2.5rem] p-10">
               <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl">🛡️</div>
                  <div>
                    <h3 className="text-xl font-black text-pearl uppercase">Enterprise Support</h3>
                    <p className="text-xs font-medium text-mist">For Brokers & Large Scale Providers</p>
                  </div>
               </div>
               <p className="text-mist text-sm font-medium leading-relaxed mb-8">
                  Are you a high-volume broker or an enterprise asset provider? Join our premium listing network to access exclusive growth tools.
               </p>
               <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest">
                  Enterprise Onboarding
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
