import { useState } from "react";
import { useStore } from "@/store/useStore";
import LankaPayModal from "@/components/LankaPayModal";
import { formatPrice } from "@/lib/utils";

interface RateItem {
  id: string;
  service_type: string;
  rate_name: string;
  rate_value: number;
  description: string;
}

const DEFAULT_RATES: Record<string, { rate_name: string; rate_value: number; description: string; service_type: string }[]> = {
  vehicle: [
    { rate_name: "daily_rate", rate_value: 6500, description: "Base daily rental rate", service_type: "vehicle" },
    { rate_name: "excess_km_rate", rate_value: 45, description: "Excess KM charge per km", service_type: "vehicle" },
    { rate_name: "driver_rate", rate_value: 3500, description: "Driver charge per day", service_type: "vehicle" },
    { rate_name: "km_limit", rate_value: 100, description: "Daily KM limit included", service_type: "vehicle" },
    { rate_name: "late_return_multiplier", rate_value: 1.5, description: "Late return rate multiplier", service_type: "vehicle" },
  ],
  stay: [
    { rate_name: "base_rate", rate_value: 15000, description: "Standard room rate per night", service_type: "stay" },
    { rate_name: "deluxe_multiplier", rate_value: 1.4, description: "Deluxe room price multiplier", service_type: "stay" },
    { rate_name: "suite_multiplier", rate_value: 2.2, description: "Suite room price multiplier", service_type: "stay" },
    { rate_name: "service_charge_pct", rate_value: 5, description: "Service charge percentage", service_type: "stay" },
    { rate_name: "tax_pct", rate_value: 10, description: "Tax percentage", service_type: "stay" },
  ],
  property: [
    { rate_name: "listing_fee", rate_value: 1000, description: "Owner listing fee", service_type: "property" },
    { rate_name: "sale_commission_pct", rate_value: 2, description: "Sale commission percentage", service_type: "property" },
    { rate_name: "wanted_ad_fee", rate_value: 8500, description: "Wanted ad listing fee", service_type: "property" },
  ],
  event: [
    { rate_name: "commission_pct", rate_value: 8.5, description: "Event ticket commission (%)", service_type: "event" },
    { rate_name: "entertainment_tax_pct", rate_value: 15, description: "Entertainment tax (%)", service_type: "event" },
  ],
};

const RateManagement = () => {
  const { currentUser } = useStore();
  const [activeService, setActiveService] = useState("vehicle");
  const [rates, setRates] = useState<Record<string, typeof DEFAULT_RATES.vehicle>>(DEFAULT_RATES);
  const [saving, setSaving] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const serviceLabels: Record<string, { label: string; icon: string }> = {
    vehicle: { label: "Vehicles", icon: "🚗" },
    stay: { label: "Stays", icon: "🏨" },
    property: { label: "Properties", icon: "🏠" },
    event: { label: "Events", icon: "🎫" },
  };

  const updateRate = (rateIndex: number, newValue: number) => {
    const updated = { ...rates };
    updated[activeService] = [...updated[activeService]];
    updated[activeService][rateIndex] = { ...updated[activeService][rateIndex], rate_value: newValue };
    setRates(updated);
  };

  const saveRates = async () => {
    if (!currentUser) return;
    setSaving(true);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    
    localStorage.setItem(`rates_${activeService}`, JSON.stringify(rates[activeService]));
    setSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-black text-pearl tracking-tight">Rate Management</h2>
        <p className="text-mist text-sm font-medium mt-1">Configure service charges and business multipliers for your fleet.</p>
      </div>

      <div className="flex gap-3 flex-wrap bg-white/5 p-1.5 rounded-[2rem] border border-white/10 w-fit">
        {Object.entries(serviceLabels).map(([key, { label, icon }]) => (
          <button 
            key={key} 
            onClick={() => setActiveService(key)}
            className={`px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
              activeService === key 
                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                : "text-mist hover:text-pearl hover:bg-white/5"
            }`}
          >
            <span className="text-lg grayscale-0">{icon}</span> {label}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-mist flex items-center gap-3">
            <span className="text-xl">{serviceLabels[activeService].icon}</span>
            {serviceLabels[activeService].label} Configuration
          </h3>
          <span className="px-4 py-1.5 rounded-full bg-emerald/10 text-emerald text-[9px] font-black uppercase tracking-widest border border-emerald/20">
            Live Updates Enabled
          </span>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {rates[activeService].map((rate, i) => (
              <div key={rate.rate_name} className="group flex items-center gap-6 p-6 bg-white/[0.03] hover:bg-white/[0.06] rounded-3xl border border-white/5 transition-all">
                <div className="flex-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-mist mb-1">{rate.rate_name}</div>
                  <div className="font-bold text-pearl leading-tight group-hover:text-primary transition-colors">{rate.description}</div>
                </div>
                
                <div className="relative group/input">
                  {rate.rate_name.includes("pct") || rate.rate_name.includes("multiplier") ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step={rate.rate_name.includes("multiplier") ? "0.1" : "0.5"}
                        value={rate.rate_value}
                        onChange={e => updateRate(i, parseFloat(e.target.value) || 0)}
                        className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-right font-black text-primary focus:border-primary/50 outline-none transition-all"
                      />
                      <span className="text-xs font-black text-mist">{rate.rate_name.includes("multiplier") ? "×" : "%"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-mist">LKR</span>
                      <input
                        type="number"
                        value={rate.rate_value}
                        onChange={e => updateRate(i, parseFloat(e.target.value) || 0)}
                        className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-right font-black text-primary focus:border-primary/50 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
            <button 
              onClick={saveRates} 
              disabled={saving}
              className="flex-1 bg-primary hover:bg-gold-light text-primary-foreground h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {saving ? "Processing..." : "Deploy Rate Changes"}
            </button>
            <button 
              onClick={() => setRates({ ...rates, [activeService]: DEFAULT_RATES[activeService] })}
              className="px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-white/10 bg-white/5 text-pearl hover:bg-white/10 transition-all"
            >
              Reset to Cloud Backup
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-sapphire/20 to-transparent border border-sapphire/30 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 text-9xl opacity-5 group-hover:scale-110 transition-transform duration-700">💳</div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-sapphire/40 flex items-center justify-center text-pearl">i</div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-pearl">Enterprise Billing Note</h4>
        </div>
        <p className="text-sm font-medium text-mist max-w-2xl leading-relaxed">
          All financial transactions and rate distributions are processed securely via <span className="text-pearl font-bold underline decoration-sapphire decoration-2">LankaPay Gateway</span>. 
          Service fees of 2.5% apply to digital settlements. Rate changes propagate to new bookings within 60 seconds.
        </p>
      </div>

      <LankaPayModal open={showPayment} onClose={() => setShowPayment(false)} amount={0} description="" onSuccess={() => setShowPayment(false)} />
    </div>
  );
};

export default RateManagement;
