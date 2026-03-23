import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Download, TrendingUp, DollarSign, 
  ArrowUpRight, ArrowDownRight, Calendar, 
  Filter, Search, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { formatPrice } from "@/lib/utils";

export default function OperationalReportCenter() {
  const { globalSettings } = useStore();
  const [isExporting, setIsExporting] = useState(false);

  const stats = [
    { label: "Total Service Charges", value: 1245000, grow: "+12.5%", icon: <DollarSign size={20} />, color: "text-emerald-500" },
    { label: "Total Tax Collected", value: 485600, grow: "+8.2%", icon: <TrendingUp size={20} />, color: "text-primary" },
    { label: "Provider Payouts", value: 8940000, grow: "+15.3%", icon: <CheckCircle2 size={20} />, color: "text-sapphire" },
  ];

  const recentTransactions = [
    { id: "TX-9041", type: "Stay", provider: "Shangri-La", amount: 45000, fee: 2250, tax: 4500, status: "Settled", date: "2024-03-22" },
    { id: "TX-9042", type: "Vehicle", provider: "Prius Rental", amount: 6500, fee: 325, tax: 650, status: "Pending", date: "2024-03-22" },
    { id: "TX-9043", type: "Event", provider: "IMAX Colombo", amount: 2400, fee: 120, tax: 360, status: "Settled", date: "2024-03-21" },
  ];

  const handleExport = (type: 'pdf' | 'csv') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`${type.toUpperCase()} Report generated successfully and sent to your secure email.`);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-pearl tracking-tight uppercase">Operational Report Center</h2>
           <p className="text-xs text-mist/60 font-black uppercase tracking-widest mt-1">Financial Audit & Settlement Intelligence</p>
        </div>
        <div className="flex gap-4">
           <Button onClick={() => handleExport('csv')} variant="outline" className="h-12 px-6 rounded-2xl border-white/10 text-mist hover:text-white font-black uppercase tracking-widest text-[10px] gap-2">
              <Download size={16} /> Export CSV
           </Button>
           <Button onClick={() => handleExport('pdf')} className="h-12 px-8 rounded-2xl bg-primary hover:bg-gold-light text-primary-foreground font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20">
              <FileText size={16} /> Generate PDF Audit
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-zinc-950 border border-white/10 rounded-[2.5rem] relative overflow-hidden group hover:border-primary/50 transition-all"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               {stat.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mist/40 mb-3">{stat.label}</p>
            <div className="flex items-end justify-between">
               <h3 className="text-3xl font-black text-pearl tracking-tighter">
                  {formatPrice(stat.value, "LKR")}
               </h3>
               <span className={`text-[10px] font-black ${stat.color} flex items-center gap-1 mb-1`}>
                  <ArrowUpRight size={12} /> {stat.grow}
               </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Table Area */}
      <div className="bg-zinc-950 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-mist">
                  <Filter size={20} />
               </div>
               <h3 className="text-[11px] font-black uppercase tracking-widest text-mist">Revenue & Tax Ledger</h3>
            </div>
            <div className="flex gap-4">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mist/30" size={16} />
                  <input placeholder="Search tx-id or provider..." className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-xs text-pearl focus:border-primary/50 outline-none w-64 transition-all" />
               </div>
               <button className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-mist hover:text-white transition-all">Today</button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="bg-white/[0.02]">
                     <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-mist/40">Transaction ID</th>
                     <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-mist/40">Provider</th>
                     <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-mist/40">Base Amount</th>
                     <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-mist/40">Srv. Fee (5%)</th>
                     <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-mist/40">Tax (10%)</th>
                     <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-mist/40">Net Settlement</th>
                     <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-mist/40">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {recentTransactions.map(tx => (
                     <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-8 py-6">
                           <div className="text-sm font-bold text-pearl mb-0.5 group-hover:text-primary transition-colors">{tx.id}</div>
                           <div className="text-[9px] font-black text-mist/30 uppercase tracking-widest">{tx.date}</div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                 {tx.provider.charAt(0)}
                              </div>
                              <div>
                                 <div className="text-xs font-bold text-pearl">{tx.provider}</div>
                                 <div className="text-[9px] font-black text-mist/40 uppercase tracking-widest">{tx.type}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right font-mono text-sm text-mist">{formatPrice(tx.amount, "LKR")}</td>
                        <td className="px-8 py-6 text-right font-mono text-sm text-emerald-500">+{formatPrice(tx.fee, "LKR")}</td>
                        <td className="px-8 py-6 text-right font-mono text-sm text-primary">+{formatPrice(tx.tax, "LKR")}</td>
                        <td className="px-8 py-6 text-right font-black text-sm text-pearl">{formatPrice(tx.amount - tx.fee - tx.tax, "LKR")}</td>
                        <td className="px-8 py-6 text-right">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                              tx.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                           }`}>
                              {tx.status}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Compliance Note */}
      <div className="p-8 bg-zinc-900/50 border border-white/10 rounded-[2.5rem] flex items-start gap-4">
         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <AlertCircle size={20} />
         </div>
         <div>
            <h4 className="text-sm font-bold text-pearl mb-1 uppercase tracking-tight">Audit Compliance Notice</h4>
            <p className="text-xs text-mist/60 leading-relaxed max-w-2xl">
               These reports are generated based on real-time transaction data from the Pearl Hub gateway. Automated settlements are initiated every Sunday at 00:00 GMT+5:30. Tax rates follow the latest Sri Lankan IRD guidelines (10% VAT / 15% SSCL where applicable).
            </p>
         </div>
      </div>
    </div>
  );
}
