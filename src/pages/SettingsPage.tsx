import { useState } from "react";
import { useStore } from "@/store/useStore";
import WalletModal from "@/components/WalletModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/lib/utils";

const SettingsPage = () => {
  const { showToast, currentUser, walletTransactions } = useStore();
  const [activeTab, setActiveTab] = useState("general");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletModalType, setWalletModalType] = useState<"deposit" | "withdrawal">("deposit");

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy & Security", icon: "🔒" },
    { id: "billing", label: "Billing", icon: "💳" },
    { id: "wallet", label: "Wallet", icon: "💰" },
    { id: "terms", label: "Terms & Conditions", icon: "📄" },
  ];

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-obsidian text-pearl font-sans selection:bg-primary/30">
      <div className="bg-gradient-to-br from-obsidian via-zinc-900 to-primary/10 py-20 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="container px-6 mx-auto relative z-10">
          <h1 className="text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-pearl via-pearl to-mist bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-mist text-sm font-medium uppercase tracking-widest opacity-60">Manage your Pearl Hub experience</p>
        </div>
      </div>

      <div className="container px-6 mx-auto py-12 pb-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Tabs Sidebar */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 sticky top-24 shadow-2xl overflow-hidden">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab.id 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                        : "text-mist hover:text-pearl hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-xl transition-transform ${activeTab === tab.id ? "scale-110" : "grayscale opacity-50"}`}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-8">
            {activeTab === "general" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-black text-pearl mb-8 tracking-tight flex items-center gap-4">
                  <span className="text-3xl">⚙️</span> General Preferences
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Display Name</label>
                      <input 
                        defaultValue={currentUser.name} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all focus:ring-4 focus:ring-primary/5" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Language</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer">
                        <option className="bg-zinc-900">English (Intl)</option>
                        <option className="bg-zinc-900">සිංහල (SL)</option>
                        <option className="bg-zinc-900">தமிழ் (SL)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-mist px-1">Active Currency</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer">
                        <option className="bg-zinc-900">Sri Lankan Rupee (LKR)</option>
                        <option className="bg-zinc-900">United States Dollar (USD)</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <Button onClick={() => showToast("Profile preferences updated", "success")} className="bg-primary hover:bg-gold-light text-primary-foreground h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20">
                      Sync Account Details
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-black text-pearl mb-8 tracking-tight flex items-center gap-4">
                  <span className="text-3xl">🔔</span> Communication Channels
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6">
                  {[
                    { label: "Critical Alerts", desc: "Security and direct ecosystem notifications.", default: true },
                    { label: "E-mail Updates", desc: "Summary of bookings and monthly reports.", default: true },
                    { label: "SMS Direct", desc: "Real-time verification and emergency codes.", default: true },
                    { label: "Asset Discovery", desc: "New high-value listings matching your profile.", default: false },
                  ].map((item, i) => (
                    <div key={item.label} className={`flex items-center justify-between py-6 ${i > 0 ? "border-t border-white/5" : ""}`}>
                      <div className="space-y-1">
                        <div className="text-sm font-black text-pearl uppercase tracking-wide">{item.label}</div>
                        <div className="text-[11px] font-medium text-mist max-w-sm">{item.desc}</div>
                      </div>
                      <Switch defaultChecked={item.default} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <h2 className="text-2xl font-black text-pearl mb-8 tracking-tight flex items-center gap-4">
                  <span className="text-3xl">💰</span> Digital Assets & Balance
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                  <div className="bg-gradient-to-br from-primary/20 via-zinc-900 to-primary/5 border border-primary/20 rounded-3xl p-10 text-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-primary opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
                     <div className="text-[11px] font-black uppercase tracking-widest text-mist mb-4 relative z-10">Verified Balance</div>
                     <div className="text-6xl font-black text-primary mb-8 relative z-10">{formatPrice(currentUser.balance || 0, "LKR")}</div>
                     <div className="flex gap-4 relative z-10">
                        <Button onClick={() => { setWalletModalType("deposit"); setShowWalletModal(true); }} className="flex-1 bg-primary text-primary-foreground h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20">
                           Initialize Deposit
                        </Button>
                        <Button onClick={() => { setWalletModalType("withdrawal"); setShowWalletModal(true); }} variant="outline" className="flex-1 border-white/10 hover:bg-white/10 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px]">
                           External Payout
                        </Button>
                     </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-mist mb-8">Transaction Registry</h3>
                   <div className="space-y-4">
                      {walletTransactions.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-6 bg-white/[0.03] hover:bg-white/[0.06] rounded-3xl border border-white/5 transition-all">
                           <div className="flex items-center gap-6">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                                t.amount > 0 ? "bg-emerald/10 text-emerald" : "bg-ruby/10 text-ruby"
                              }`}>
                                 {t.amount > 0 ? "↓" : "↑"}
                              </div>
                              <div>
                                 <div className="text-sm font-black text-pearl uppercase tracking-wide">{t.description}</div>
                                 <div className="text-[10px] font-black text-mist uppercase tracking-widest opacity-60">{t.date} • {t.id}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className={`text-lg font-black ${t.amount > 0 ? "text-emerald" : "text-ruby"}`}>
                                 {t.amount > 0 ? "+" : ""}{formatPrice(Math.abs(t.amount), "LKR")}
                              </div>
                              <Badge className="bg-white/5 text-mist font-black text-[8px] uppercase tracking-tighter border-white/5">
                                 {t.status}
                              </Badge>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-black text-pearl mb-8 tracking-tight flex items-center gap-4">
                  <span className="text-3xl">📄</span> Legal Framework
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 prose prose-invert max-w-none">
                  <div className="space-y-8 text-mist text-sm font-medium leading-relaxed">
                    <section>
                      <h3 className="text-pearl font-black text-lg uppercase tracking-widest mb-4">1. Data Ownership</h3>
                      <p>Full proprietary rights to user-generated listings and media assets are retained by the platform under Sri Lankan IP laws.</p>
                    </section>
                    <section>
                      <h3 className="text-pearl font-black text-lg uppercase tracking-widest mb-4">2. Financial Integrity</h3>
                      <p>All settlements are processed via LankaPay (v3.0). Finality of transactions is governed by the Central Bank of Sri Lanka electronic payment protocols.</p>
                    </section>
                    <section>
                      <h3 className="text-pearl font-black text-lg uppercase tracking-widest mb-4">3. Verification Governance</h3>
                      <p>Multi-stage KYC/KYB is mandatory for high-value transactions. Compliance is monitored via real-time AML algorithms.</p>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <WalletModal 
        open={showWalletModal} 
        onClose={() => setShowWalletModal(false)}
        type={walletModalType}
        onSuccess={(amount, description) => {
          showToast(`Transaction of ${formatPrice(amount, "LKR")} initiated: ${description}`, "success");
          setShowWalletModal(false);
        }}
      />
    </div>
  );
};

export default SettingsPage;
