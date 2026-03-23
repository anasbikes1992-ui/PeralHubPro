import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/context/AuthContext";
import { useUserBookings } from "@/hooks/useListings";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import WalletModal from "@/components/WalletModal";
import AIConcierge from "@/components/AIConcierge";
import { PearlPointsWidget } from "@/components/PearlPoints";
import ValuationTool from "@/components/ValuationTool";

const DashboardPage = () => {
  const { currentUser, userRole, markNotificationRead, notifications } = useStore();
  const { user } = useAuth();
  const { data: realBookings = [], isLoading: bookingsLoading } = useUserBookings(user?.id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showWallet, setShowWallet] = useState(false);

  // Redirect specialized roles to their respective dashboards
  useEffect(() => {
    if (userRole === "admin") {
      navigate("/admin");
    } else if (["owner", "broker", "stay_provider", "vehicle_provider", "event_organizer", "sme"].includes(userRole)) {
      navigate("/provider");
    }
  }, [userRole, navigate]);

  if (!currentUser) return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "bookings", label: "My Bookings", icon: "📅" },
    { id: "wallet", label: "Wallet & Payments", icon: "💳" },
    { id: "ai", label: "AI Concierge", icon: "✨" },
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "compliance", label: "Compliance", icon: "📋" },
  ];

  // ── Real bookings from Supabase via React Query ──────────
  const BOOKING_ICONS: Record<string, string> = {
    stay: "🏨", vehicle: "🚗", event: "🎫", property: "🏠",
  };
  const displayBookings = realBookings.map((b: any) => ({
    id: `PH-${b.id?.slice(0, 8)?.toUpperCase() ?? "---"}`,
    service: `${b.listing_type?.charAt(0)?.toUpperCase() + b.listing_type?.slice(1) ?? "Booking"} #${b.id?.slice(0, 6)?.toUpperCase()}`,
    date: b.booking_date ? new Date(b.booking_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
    amount: b.total_amount ?? 0,
    status: b.status?.charAt(0)?.toUpperCase() + b.status?.slice(1) ?? "Pending",
    icon: BOOKING_ICONS[b.listing_type] ?? "📋",
    currency: b.currency ?? "LKR",
  }));

  return (
    <div className="min-h-screen bg-obsidian text-pearl font-sans selection:bg-primary/30">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-obsidian via-zinc-900 to-primary/10 py-20 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="container px-6 mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {userRole} Member
              </Badge>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-pearl via-pearl to-mist bg-clip-text text-transparent">
                Welcome back, <br />
                <span className="text-primary italic">{currentUser.name}</span>
              </h1>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] min-w-[200px] hover:border-primary/50 transition-all group">
                <div className="text-[10px] font-black uppercase tracking-widest text-mist mb-2">Wallet Balance</div>
                <div className="text-3xl font-black text-primary group-hover:scale-105 transition-transform origin-left">
                  {formatPrice(currentUser.balance || 0, "LKR")}
                </div>
                <Button 
                  onClick={() => setShowWallet(true)}
                  variant="ghost" 
                  className="mt-4 w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-primary hover:text-white transition-all"
                >
                  Top Up Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-6 mx-auto -mt-8 relative z-20 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 sticky top-24 shadow-2xl overflow-hidden">
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

              <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="text-[10px] font-black uppercase tracking-widest text-mist mb-4">Verification Status</div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${currentUser.verified ? 'bg-emerald shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-ruby'}`} />
                  <span className="text-xs font-bold">{currentUser.verified ? 'Fully Verified' : 'Action Required'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Bookings Made", value: currentUser.bookings || 0, icon: "🎫", color: "text-sapphire" },
                      { label: "Pearl Points", value: (currentUser as any).pearlPoints || 0, icon: "⭐", color: "text-primary" },
                      { label: "Total Investments", value: formatPrice(currentUser.spent || 0, "LKR"), icon: "💰", color: "text-emerald" },
                      { label: "Reward Points", value: "2,450", icon: "💎", color: "text-primary" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.08] transition-all group overflow-hidden relative">
                        <div className="absolute -right-2 -top-2 text-6xl opacity-5 group-hover:scale-125 transition-transform duration-700">{stat.icon}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-mist mb-2">{stat.label}</div>
                        <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recent Notifications */}
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-mist">Recent Activity</h3>
                      <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-pearl transition-colors">Mark all read</button>
                    </div>
                    <div className="space-y-4">
                      {notifications.slice(0, 3).map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                            notif.read ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black text-pearl">{notif.title}</span>
                            <span className="text-[9px] font-black text-mist uppercase tracking-widest">{notif.time}</span>
                          </div>
                          <p className="text-sm font-medium text-mist leading-relaxed">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "bookings" && (
                <motion.div 
                   key="bookings"
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                   className="space-y-6"
                >
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-mist">Active Bookings</h3>
                      <div className="flex gap-2">
                        <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-tighter text-[9px] px-3 py-1">Recent</Badge>
                      </div>
                    </div>
                    
                    {bookingsLoading && (
                      <div className="flex items-center justify-center py-12 gap-3">
                        <Loader2 className="animate-spin text-primary/40" size={24} />
                        <span className="text-xs text-mist/40 font-black uppercase tracking-widest">Loading bookings…</span>
                      </div>
                    )}
                    {!bookingsLoading && (<div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-white/[0.02]">
                            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-mist">Service</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-mist">Date</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-mist">Amount</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-mist">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {displayBookings.map((bk) => (
                            <tr key={bk.id} className="group hover:bg-white/[0.03] transition-colors">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <span className="text-2xl">{bk.icon}</span>
                                  <div>
                                    <div className="font-bold text-pearl group-hover:text-primary transition-colors">{bk.service}</div>
                                    <div className="text-[10px] font-black text-mist uppercase tracking-widest">{bk.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-[11px] font-black text-mist uppercase tracking-widest">{bk.date}</td>
                              <td className="px-8 py-6 text-right font-black text-pearl">{formatPrice(bk.amount, bk.currency ?? "LKR")}</td>
                              <td className="px-8 py-6 text-right">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                                  bk.status === "Confirmed" ? "bg-emerald/10 text-emerald border-emerald/20" :
                                  bk.status === "Pending" ? "bg-amber/10 text-amber border-amber/20" :
                                  "bg-white/10 text-mist border-white/10"
                                }`}>
                                  {bk.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    )}

                    {displayBookings.length === 0 && !bookingsLoading && (
                      <div className="p-16 text-center">
                        <div className="text-7xl mb-6 grayscale opacity-20">📅</div>
                        <h3 className="text-xl font-black text-pearl mb-2">No active bookings found</h3>
                        <p className="text-mist text-sm font-medium max-w-sm mx-auto mb-8">Expand your lifestyle by exploring our premium properties, stays, and vehicles.</p>
                        <Button 
                          onClick={() => navigate('/')}
                          className="bg-primary hover:bg-gold-light text-primary-foreground h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                        >
                          Browse Marketplace
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "ai" && (
                <motion.div 
                   key="ai"
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                   className="space-y-8"
                >
                   <AIConcierge />
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div 
                   key="profile"
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                   className="space-y-8"
                >
                   <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                      <div className="flex flex-col md:flex-row gap-10 items-center">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-sapphire p-1 shadow-2xl">
                          <div className="w-full h-full rounded-full bg-obsidian flex items-center justify-center text-4xl font-black text-pearl uppercase">
                            {currentUser.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-3xl font-black text-pearl mb-2">{currentUser.name}</h3>
                          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                             <div className="flex items-center gap-2 text-mist text-sm font-medium">
                               <span>📧</span> {currentUser.email}
                             </div>
                             <div className="flex items-center gap-2 text-mist text-sm font-medium">
                               <span>📞</span> {currentUser.phone || "No phone added"}
                             </div>
                          </div>
                          <Button variant="outline" className="mt-6 border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl h-10 px-6">
                            Edit Profile Details
                          </Button>
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-mist mb-6">Security Settings</h4>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-pearl text-sm">Two-Factor Auth</div>
                              <div className="text-[10px] text-mist font-medium">Extra secure account login</div>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-pearl text-sm">App Notifications</div>
                              <div className="text-[10px] text-mist font-medium">Receive real-time alerts</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Button variant="ghost" className="w-full justify-start text-ruby hover:text-white hover:bg-ruby/20 transition-all font-black uppercase tracking-widest text-[10px] h-12 rounded-xl mt-4 px-4">
                            Reset Password
                          </Button>
                        </div>
                     </div>
                     <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">🛡️</div>
                          <h4 className="text-lg font-black text-pearl mb-2">Member Verification</h4>
                          <p className="text-xs text-mist font-medium mb-6">Verify your identity to unlock premium listings and higher credit limits.</p>
                          <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-pearl font-black uppercase tracking-widest text-[10px] h-12 rounded-xl">
                            {currentUser.verified ? "View Documents" : "Start Verification"}
                          </Button>
                        </div>
                     </div>
                   </div>
                </motion.div>
              )}

              {activeTab === "compliance" && (
                <motion.div 
                   key="compliance"
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                   className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-emerald/10 rounded-2xl flex items-center justify-center text-3xl">⚖️</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-pearl">Legal & Compliance</h3>
                      <p className="text-mist text-xs font-medium uppercase tracking-widest">Master Service Agreement v4.2</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5">
                      <h4 className="text-sm font-black text-pearl mb-3">Master Service Agreement</h4>
                      <p className="text-sm text-mist leading-relaxed mb-6">
                        By using Pearl Hub, you agree to our comprehensive legal framework governing asset trade, 
                        leasing protocols, and data privacy in line with Sri Lankan financial regulations.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Button variant="outline" className="h-12 rounded-xl border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest px-8">
                          Download MSA (PDF)
                        </Button>
                        <Button variant="outline" className="h-12 rounded-xl border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest px-8">
                          Privacy Policy
                        </Button>
                      </div>
                    </div>
                    <div className="bg-sapphire/10 p-8 rounded-3xl border border-sapphire/20">
                      <div className="flex items-center gap-3 mb-4 text-sapphire">
                        <span>🛡️</span>
                        <h4 className="text-[11px] font-black uppercase tracking-widest">Insurance Coverage</h4>
                      </div>
                      <p className="text-sm text-mist leading-relaxed">
                        All vehicle rentals and stays listed on Pearl Hub are covered by our secondary enterprise insurance 
                        up to LKR 10,000,000 per occurring incident.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <WalletModal 
        open={showWallet} 
        onClose={() => setShowWallet(false)} 
        type="deposit"
        onSuccess={() => useStore.getState().showToast("Balance updated successfully")}
      />
    </div>
  );
};

export default DashboardPage;
