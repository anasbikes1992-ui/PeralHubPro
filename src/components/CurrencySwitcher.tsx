import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, ChevronDown } from "lucide-react";

const currencies = [
  { code: 'LKR', label: 'Sri Lankan Rupee', symbol: 'Rs.', flag: '🇱🇰' },
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'RUB', label: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
];

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useStore();

  return (
    <div className="relative group">
      <button className="bg-white/[0.08] border border-white/15 text-pearl rounded-md px-2.5 py-1.5 text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer">
        <span className="text-[10px] text-primary font-black">{currencies.find(c => c.code === currency)?.symbol}</span>
        <span className="uppercase">{currency}</span>
        <ChevronDown size={12} className="text-mist group-hover:rotate-180 transition-transform" />
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[600]">
        <div className="px-4 py-2 border-b border-white/5 mb-2">
           <p className="text-[9px] font-black text-mist/40 uppercase tracking-widest">Select Currency</p>
        </div>
        {currencies.map(c => (
          <button 
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className={`w-full px-4 py-2 text-left text-[11px] font-bold flex items-center justify-between hover:bg-primary/10 transition-colors ${currency === c.code ? 'text-primary bg-primary/5' : 'text-mist'}`}
          >
            <div className="flex items-center gap-3">
               <span className="text-base">{c.flag}</span>
               <div className="flex flex-col">
                  <span>{c.code}</span>
                  <span className="text-[8px] font-medium opacity-50">{c.label}</span>
               </div>
            </div>
            {currency === c.code && <Check size={14} />}
          </button>
        ))}
      </div>
    </div>
  );
}
