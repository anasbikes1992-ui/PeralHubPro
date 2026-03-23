import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, MessageSquare, Target, Zap, 
  ArrowRight, Mail, Phone, Calendar, 
  Search, Filter, CheckCircle2, Clock,
  MoreHorizontal, ChevronRight, BarChart3,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, timeAgo } from "@/lib/utils";

export default function ProviderCRM() {
  const [activeSegment, setActiveSegment] = useState<'leads' | 'intent' | 'automations'>('leads');

  const leads = [
    { id: "LD-501", customer: "Nikolai Volkov", interest: "Luxury Villa – Colombo 7", status: "Hot", time: "2 hours ago", value: "85M LKR" },
    { id: "LD-502", customer: "Sarah Jenkins", interest: "Shangri-La Stay", status: "Warm", time: "5 hours ago", value: "450K LKR" },
    { id: "LD-503", customer: "Amara Perera", interest: "Vehicle Fleet", status: "Cold", time: "Yesterday", value: "1.2M LKR" },
  ];

  const intentData = [
    { page: "/property/P001", visitors: 45, avgTime: "4m 20s", bounceRate: "12%", intent: "High" },
    { page: "/stays/S003", visitors: 128, avgTime: "2m 15s", bounceRate: "34%", intent: "Medium" },
  ];

  return (
    <div className="space-y-8">
      {/* CRM Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight uppercase">Advanced Provider CRM</h2>
           <p className="text-xs text-mist/60 font-black uppercase tracking-widest mt-1">Lead Intelligence & Conversion Automation</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
           {['leads', 'intent', 'automations'].map((s: any) => (
             <button
               key={s}
               onClick={() => setActiveSegment(s)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeSegment === s ? 'bg-primary text-white shadow-lg' : 'text-mist hover:text-white'
               }`}
             >
               {s}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content Area */}
         <div className="lg:col-span-2 space-y-6">
            {activeSegment === 'leads' && (
               <div className="bg-zinc-950 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                     <h3 className="text-[11px] font-black uppercase tracking-widest text-mist">Active Sales Pipeline</h3>
                     <Button variant="ghost" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary gap-2">
                        <Zap size={14} /> Auto-Filter Hot Leads
                     </Button>
                  </div>
                  <div className="divide-y divide-white/5">
                     {leads.map(lead => (
                        <div key={lead.id} className="p-8 hover:bg-white/[0.03] transition-all group cursor-pointer">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl">👤</div>
                                 <div>
                                    <h4 className="font-black text-pearl text-base uppercase tracking-tight">{lead.customer}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                       <Badge className={`text-[8px] font-black uppercase tracking-widest ${
                                          lead.status === 'Hot' ? 'bg-ruby/20 text-ruby' : lead.status === 'Warm' ? 'bg-amber/20 text-amber' : 'bg-mist/20 text-mist'
                                       }`}>
                                          {lead.status} Lead
                                       </Badge>
                                       <span className="text-[10px] text-mist/40 font-bold">• {lead.time}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <div className="text-sm font-black text-primary">{lead.value}</div>
                                 <div className="text-[9px] font-bold text-mist/40 uppercase tracking-widest mt-1">Projected Value</div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-2 text-mist text-xs font-medium">
                                    <Target size={14} className="text-primary" />
                                    <span>Interest: <span className="text-pearl font-bold uppercase text-[10px]">{lead.interest}</span></span>
                                 </div>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                 <Button size="sm" variant="ghost" className="w-10 h-10 p-0 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                                    <Mail size={16} />
                                 </Button>
                                 <Button size="sm" variant="ghost" className="w-10 h-10 p-0 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                                    <Phone size={16} />
                                 </Button>
                                 <Button size="sm" className="h-10 px-6 rounded-xl bg-white/5 hover:bg-primary text-white text-[10px] font-black uppercase tracking-widest transition-all">
                                    Take Action
                                 </Button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {activeSegment === 'intent' && (
               <div className="bg-zinc-950 border border-white/10 rounded-[3rem] p-10 space-y-8">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-xl font-black text-white tracking-tight uppercase">Visitor Intent Analysis</h3>
                     <Badge className="bg-emerald-500/10 text-emerald-500 font-black px-4 py-1.5 rounded-full uppercase text-[9px]">Live Traffic Data</Badge>
                  </div>
                  <div className="space-y-6">
                     {intentData.map((data, i) => (
                        <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-primary/30 transition-all">
                           <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <BarChart3 size={20} />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-mist/40 uppercase tracking-widest">{data.page}</p>
                                    <h4 className="text-sm font-black text-pearl uppercase">Luxury Stay Discovery</h4>
                                 </div>
                              </div>
                              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                                 data.intent === 'High' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                              }`}>
                                 {data.intent} Intent
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-8">
                              <div>
                                 <div className="text-2xl font-black text-pearl">{data.visitors}</div>
                                 <div className="text-[9px] font-black text-mist/40 uppercase tracking-widest mt-1">Unique Visitors</div>
                              </div>
                              <div>
                                 <div className="text-2xl font-black text-pearl">{data.avgTime}</div>
                                 <div className="text-[9px] font-black text-mist/40 uppercase tracking-widest mt-1">Avg. Time on Page</div>
                              </div>
                              <div>
                                 <div className="text-2xl font-black text-pearl">{data.bounceRate}</div>
                                 <div className="text-[9px] font-black text-mist/40 uppercase tracking-widest mt-1">Interaction Rate</div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {activeSegment === 'automations' && (
               <div className="bg-zinc-950 border border-white/10 rounded-[3rem] p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                        <Bot size={28} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase">AI Conversion Automations</h3>
                        <p className="text-[10px] font-black text-mist/40 uppercase tracking-widest">Active Smart Responders</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {[
                        { title: "Instant Greeting", desc: "Welcome new leads automatically via chat when they view your listing for > 30s.", status: true },
                        { title: "Price Drop Alert", desc: "Auto-notify 'Warm' leads if you reduce the price of a saved asset.", status: false },
                        { title: "Smart Scheduling", desc: "Allow leads to book viewing sessions directly through the AI concierge.", status: true },
                        { title: "Multi-Lingual Followup", desc: "Auto-translate follow-up messages based on user's browser language.", status: true },
                     ].map((auto, i) => (
                        <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                           <div className="flex justify-between items-start mb-4">
                              <h4 className="text-sm font-black text-pearl uppercase tracking-tight">{auto.title}</h4>
                              <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${auto.status ? 'bg-primary' : 'bg-white/10'}`}>
                                 <div className={`w-4 h-4 rounded-full bg-white transition-transform ${auto.status ? 'translate-x-6' : ''}`} />
                              </div>
                           </div>
                           <p className="text-xs text-mist/60 leading-relaxed font-medium">{auto.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* Sidebar / Quick Stats */}
         <div className="space-y-6">
            <div className="p-8 bg-primary rounded-[2.5rem] text-primary-foreground shadow-2xl shadow-primary/20">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Conversion Pulse</p>
               <h3 className="text-4xl font-black tracking-tighter mb-6">42%</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                     <span className="opacity-70">Weekly Leads</span>
                     <span>+12</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                     <div className="h-full bg-white w-2/3" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                     <span>Growth Stride</span>
                     <span>Excelling</span>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-zinc-950 border border-white/10 rounded-[2.5rem]">
               <h4 className="text-[10px] font-black text-mist uppercase tracking-[0.2em] mb-6">Quick Insights</h4>
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary"><Target size={18} /></div>
                     <div>
                        <p className="text-xs font-black text-pearl uppercase tracking-tight">Peak Traffic</p>
                        <p className="text-[10px] text-mist/60 font-bold">Friday, 19:00 - 21:00 SLT</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sapphire"><ArrowRight size={18} /></div>
                     <div>
                        <p className="text-xs font-black text-pearl uppercase tracking-tight">Top Source</p>
                        <p className="text-[10px] text-mist/60 font-bold">Instagram Discovery Ads</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
