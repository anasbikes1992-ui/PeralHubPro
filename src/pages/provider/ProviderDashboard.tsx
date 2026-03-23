import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProviderStays, useProviderVehicles, useProviderEvents, useProviderProperties } from '@/hooks/useListings';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { PERMISSIONS, formatPrice, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ListingStatus } from '@/types';
import StayListingModal from '@/components/StayListingModal';
import VehicleListingModal from '@/components/VehicleListingModal';
import EventListingModal from '@/components/EventListingModal';
import PropertyListingModal from '@/components/PropertyListingModal';
import SocialListingModal from '@/components/SocialListingModal';
import { ProviderAnalytics } from '@/components/ProviderAnalytics';
import ProviderCRM from '@/components/ProviderCRM';
import RealTimeTracker from '@/components/RealTimeTracker';
import { Sparkles, LayoutDashboard, List, Users, BarChart3, Settings, Truck, TrendingUp, Info } from 'lucide-react';
import PricingAdvisor from '@/components/PricingAdvisor';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { PearlPointsWidget } from '@/components/PearlPoints';


const PredictiveRevenueChart = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <TrendingUp size={14} /> AI Revenue Forecast (30D)
        </h3>
        <span className="text-[9px] font-bold text-mist/60 bg-white/5 px-2 py-1 rounded">Update: Live</span>
      </div>
      
      <div className="relative h-40 w-full bg-zinc-950/50 rounded-2xl border border-white/5 overflow-hidden flex items-end px-4 gap-1">
        {/* Mock Chart Columns */}
        {[30, 45, 38, 52, 60, 58, 70, 85, 92, 88].map((h, i) => (
          <div key={i} className="flex-1 group relative">
            <motion.div 
              initial={{ height: 0 }} 
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className={`w-full rounded-t-sm transition-all ${i > 6 ? 'bg-primary/40' : 'bg-emerald-500/40'} border-t border-white/10`}
            />
            {i === 9 && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded animate-bounce">
                Projected
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Growth Forecast</p>
          <p className="text-xl font-black text-pearl">+24.5%</p>
        </div>
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Likely Yield</p>
          <p className="text-xl font-black text-pearl">Rs. 840K</p>
        </div>
      </div>
      
      <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
        <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-mist leading-relaxed italic">
          "Based on historical Kandy Perahera demand, we project a 35% surge in last-minute bookings. Ensure your 'Standard Room' inventory is active."
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: ListingStatus }) => {
  const variants: Record<ListingStatus, string> = {
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    paused: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    off: 'bg-ruby-500/10 text-ruby-500 border-ruby-500/20',
    pending: 'bg-sapphire-500/10 text-sapphire-500 border-sapphire-500/20',
    rejected: 'bg-mist-500/10 text-mist-500 border-mist-500/20',
  };
  return <Badge variant="outline" className={`uppercase text-[10px] font-black tracking-widest ${variants[status]}`}>{status}</Badge>;
};

export default function ProviderDashboard() {
  const { 
    currentUser, userRole, 
    stays, vehicles, events, properties, smeBusinesses,
    toggleSMEProduct 
  } = useStore();
  
  const [modal, setModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'crm' | 'fleet' | 'settings'>('overview');
  const [activeFleetVehicle, setActiveFleetVehicle] = useState<any>(null);

  const { user: authUser, profile } = useAuth();

  // Real provider data from Supabase via React Query
  const { data: myStays     = [] } = useProviderStays(authUser?.id);
  const { data: myVehicles  = [] } = useProviderVehicles(authUser?.id);
  const { data: myEvents    = [] } = useProviderEvents(authUser?.id);
  const { data: myProperties= [] } = useProviderProperties(authUser?.id);

  // Guard: require real Supabase session
  if (!authUser) return <Navigate to="/login" replace />;
  if (userRole === 'admin') return <Navigate to="/admin" replace />;
  if (userRole === 'customer') return <Navigate to="/" replace />;







  const canListStay = PERMISSIONS.canListStay(userRole);
  const canListVehicle = PERMISSIONS.canListVehicle(userRole);
  const canListEvent = PERMISSIONS.canListEvent(userRole);
  const canListProperty = PERMISSIONS.canListProperty(userRole);
  const canRegisterSME = PERMISSIONS.canRegisterSME(userRole);

  const totalListings = myStays.length + myVehicles.length + myEvents.length + myProperties.length;
  const activeListings = [
    ...myStays, ...myVehicles, ...myEvents, ...myProperties,
  ].filter((l: any) => l.status === 'active').length;
  const pendingListings = [
    ...myStays, ...myVehicles, ...myEvents, ...myProperties,
  ].filter((l: any) => l.status === 'pending').length;

  const mockAnalytics = {
    earnings: [
      { date: 'Mar 1', amount: 45000 },
      { date: 'Mar 5', amount: 52000 },
      { date: 'Mar 10', amount: 48000 },
      { date: 'Mar 15', amount: 61000 },
      { date: 'Mar 20', amount: 59000 },
    ],
    occupancy: [
      { date: 'Mar 1', rate: 65 },
      { date: 'Mar 5', rate: 72 },
      { date: 'Mar 10', rate: 68 },
      { date: 'Mar 15', rate: 85 },
      { date: 'Mar 20', rate: 82 },
    ],
    languages: [
      { lang: 'English', count: 450 },
      { lang: 'Sinhala', count: 320 },
      { lang: 'German', count: 120 },
    ]
  };

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Header */}
      <div className="bg-primary/10 border-b border-primary/20 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-primary/20 border border-white/10 ring-4 ring-primary/10">
                {currentUser?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <h1 className="text-2xl font-black text-pearl tracking-tight">Provider Hub</h1>
                <p className="text-mist text-xs font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {currentUser?.name} · {userRole.replace(/_/g,' ')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
              {(currentUser as any)?.sltda_verified && <span className="bg-sapphire/20 text-sapphire border border-sapphire/20 px-4 py-2 rounded-full shadow-lg shadow-sapphire/5">🏛️ SLTDA Verified</span>}
              {(currentUser as any)?.eco_friendly && <span className="bg-emerald/20 text-emerald border border-emerald/20 px-4 py-2 rounded-full shadow-lg shadow-emerald/5">🌿 Eco Friendly</span>}
              {(currentUser as any)?.top_rated && <span className="bg-amber-500/20 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-full shadow-lg shadow-amber-500/5">⭐ Top Rated</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={14} /> },
            { id: 'listings', label: 'My Listings', icon: <List size={14} /> },
            { id: 'crm', label: 'Advanced CRM', icon: <Users size={14} /> },
            (canListVehicle || userRole === 'owner') && { id: 'fleet', label: 'Fleet Ops', icon: <Truck size={14} /> },
            { id: 'settings', label: 'Acc. Settings', icon: <Settings size={14} /> },
          ].filter(Boolean).map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-mist hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Inventory', value: totalListings, icon: '📋', color: 'bg-white/5 border-white/10' },
                { label: 'Live Now', value: activeListings, icon: '✅', color: 'bg-emerald-500/5 border-emerald-500/10' },
                { label: 'Pending', value: pendingListings, icon: '⏳', color: 'bg-amber-500/5 border-amber-500/10' },
                { label: 'Hidden', value: totalListings - activeListings - pendingListings, icon: '⏸️', color: 'bg-ruby-500/5 border-ruby-500/10' },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.color} rounded-[2rem] p-6 border transition-all hover:scale-[1.02] cursor-default`}>
                  <div className="text-3xl mb-4">{stat.icon}</div>
                  <div className="text-3xl font-black text-pearl">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-mist mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white/5 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="font-black text-pearl text-lg uppercase tracking-widest flex items-center gap-3">
                       <span className="w-1.5 h-6 bg-primary rounded-full" /> Yield & Growth Intelligence
                    </h2>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest">Global Index: +12%</Badge>
                 </div>
                  <ProviderAnalytics data={mockAnalytics} />
                  
                  <div className="mt-12 pt-12 border-t border-white/5">
                    <PredictiveRevenueChart />
              <div className="mt-6 border-t border-white/5 pt-6">
                <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <TrendingUp size={12} /> Market Pricing Intelligence
                </p>
                <PricingAdvisor
                  listingId="provider-listing"
                  listingType="stay"
                  currentPrice={32000}
                  location="Colombo"
                />
              </div>
              <div className="mt-6 border-t border-white/5 pt-6">
                <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.3em] mb-4">Pearl Points Balance</p>
                <PearlPointsWidget />
              </div>
                  </div>
              </div>

              {/* AI Insights Engine */}
              <div className="bg-gradient-to-br from-primary/20 via-zinc-900 to-zinc-950 rounded-[2.5rem] border border-primary/20 p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={120} className="text-primary" />
                 </div>
                 <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Sparkles size={16} className="animate-pulse" /> AI Growth Optimizer
                 </h3>
                 <div className="space-y-5 relative z-10">
                    {[
                      { text: "Your Sigiriya Stay pricing is 12% above market avg. Adjusting to Rs. 42,500 could drive 2.4x more bookings.", impact: "High Impact" },
                      { text: "3 customers favorited your 'Luxury Van' in the last 24h. Send an automated 5% 'Early Bird' offer?", impact: "Conversion Opportunity" },
                      { text: "Vehicle demand in Kandy is surging for the Perahera festival. Consider a 15% seasonal rate adjustment.", impact: "Yield Max" }
                    ].map((insight, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <p className="text-[11px] text-pearl/90 leading-relaxed font-medium mb-2 italic">"{insight.text}"</p>
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">{insight.impact}</Badge>
                      </div>
                    ))}
                 </div>
                 <Button className="w-full mt-6 h-12 bg-primary hover:bg-gold-light text-primary-foreground font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-primary/20">
                   Apply All Optimizations
                 </Button>
              </div>
            </div>

            {/* Real-time Activity Hub */}
            <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-8">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="font-black text-pearl text-lg uppercase tracking-widest flex items-center gap-3">
                     <span className="w-1.5 h-6 bg-emerald-500 rounded-full" /> Live Engagement Feed
                  </h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { type: 'View', user: 'UK', item: 'Shangri-La Colombo', time: '2m ago', icon: '👁️' },
                    { type: 'Favorite', user: 'Sri Lanka', item: 'Toyota Prius', time: '15m ago', icon: '❤️' },
                    { type: 'Inquiry', user: 'Germany', item: 'Bentayga Luxury', time: '1h ago', icon: '📩' },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:border-white/20 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">{act.icon}</div>
                      <div>
                        <p className="text-[11px] font-bold text-white"><span className="text-primary">{act.user}</span> {act.type === 'View' ? 'viewed' : act.type === 'Favorite' ? 'favorited' : 'enquired about'} <span className="text-primary">{act.item}</span></p>
                        <p className="text-[9px] text-mist/40 font-black uppercase tracking-widest mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Add Listing Buttons */}
            <div className="bg-white/5 rounded-3xl border border-white/10 p-8">
              <h2 className="font-black text-pearl text-lg mb-8 uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full" /> Expand Your Business
              </h2>
              <div className="flex flex-wrap gap-4">
                {canListStay && (
                  <Button onClick={() => setModal('stay')} variant="outline" className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-2 group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🏨</span> List Luxury Stay
                  </Button>
                )}
                {canListVehicle && (
                  <Button onClick={() => setModal('vehicle')} variant="outline" className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-2 group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🚗</span> Add Vehicle
                  </Button>
                )}
                {canListEvent && (
                  <Button onClick={() => setModal('event')} variant="outline" className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-2 group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🎟️</span> Host Event
                  </Button>
                )}
                {canListProperty && (
                  <Button onClick={() => setModal('property')} variant="outline" className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-2 group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🏘️</span> Post Property
                  </Button>
                )}
                {canRegisterSME && (
                  <Button onClick={() => setModal('sme')} variant="outline" className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-2 group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🛍️</span> Register SME
                  </Button>
                )}
              </div>
            </div>

            {/* Pending Notice */}
            {pendingListings > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex gap-4 items-center animate-pulse">
                <div className="text-2xl">⏳</div>
                <div>
                  <p className="text-amber-500 font-black text-sm uppercase tracking-wider">{pendingListings} Listing{pendingListings > 1 ? 's' : ''} in Review</p>
                  <p className="text-amber-500/60 text-xs font-bold mt-1">Our team is verifying your quality standards. Typically approved within 12-24 hours.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'listings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {myStays.length > 0 && (
              <ListingsSection
                title="Hospitality Inventory"
                icon="🏨"
                listings={myStays.map((s) => ({
                  id: s.id, title: s.name, location: s.location,
                  price: formatPrice(s.price_per_night, s.currency) + '/nt',
                  status: s.status, adminNote: s.admin_note,
                  created_at: s.created_at,
                  link: `/stays/${s.id}`,
                }))}
              />
            )}

            {myVehicles.length > 0 && (
              <ListingsSection
                title="Transport & Fleet"
                icon="🚗"
                listings={myVehicles.map((v) => ({
                  id: v.id, title: v.title, location: v.location,
                  price: formatPrice(v.price_per_day, v.currency) + '/day',
                  status: v.status, adminNote: v.admin_note,
                  created_at: v.created_at,
                  link: `/vehicles/${v.id}`,
                }))}
              />
            )}

            {myEvents.length > 0 && (
              <ListingsSection
                title="Events & Experiences"
                icon="🎟️"
                listings={myEvents.map((e) => ({
                  id: e.id, title: e.title, location: e.venue,
                  price: formatPrice((Object.values(e.prices)[0] as number) || 0, 'LKR'),
                  status: e.status, adminNote: e.admin_note,
                  created_at: e.created_at,
                  extra: `${e.totalSeats - e.tickets_sold} remaining`,
                  link: `/events/${e.id}`,
                }))}
              />
            )}

            {myProperties.length > 0 && (
              <ListingsSection
                title="Real Estate Listings"
                icon="🏘️"
                listings={myProperties.map((p) => ({
                  id: p.id, title: p.title, location: p.location,
                  price: formatPrice(p.price, p.currency),
                  status: p.status, adminNote: p.admin_note,
                  created_at: p.listed,
                  extra: p.listing_type.toUpperCase(),
                  link: `/property`,
                }))}
              />
            )}

            {myBusinesses.length > 0 && (
              <div className="bg-white/5 rounded-3xl border border-white/10 shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <h2 className="font-black text-pearl text-base uppercase tracking-widest flex items-center gap-3">🛍️ My Registered SMEs</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {myBusinesses.map((biz) => (
                    <div key={biz.id} className="p-8 hover:bg-white/[0.01] transition-all">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="font-black text-lg text-pearl group-hover:text-primary transition-colors">{biz.business_name}</h3>
                          <div className="flex items-center gap-3 mt-1.5 font-bold uppercase tracking-widest text-[10px] text-mist">
                             <span>{biz.category}</span>
                             <span className="w-1 h-1 rounded-full bg-white/20" />
                             <span>📍 {biz.location}</span>
                          </div>
                        </div>
                        <StatusBadge status={biz.status} />
                      </div>
                      
                      {biz.products && biz.products.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {biz.products.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 group hover:border-pearl/20 transition-all">
                              <div>
                                <p className="text-sm font-black text-pearl group-hover:text-primary mb-1">{product.name}</p>
                                <p className="text-[11px] font-bold text-mist uppercase tracking-tighter">
                                  {formatPrice(product.price, product.currency)} · Stock: {product.quantity_available}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 bg-obsidian p-2 pr-4 rounded-xl border border-white/5">
                                <Switch
                                  checked={product.is_active}
                                  onCheckedChange={() => toggleSMEProduct(biz.id, product.id)}
                                />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${product.is_active ? 'text-emerald-500' : 'text-ruby'}`}>
                                  {product.is_active ? 'Active' : 'Paused'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'crm' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
             <ProviderCRM />
          </motion.div>
        )}

        {activeTab === 'fleet' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
             <div className="bg-white/5 rounded-3xl border border-white/10 p-8">
                <h2 className="font-black text-pearl text-lg uppercase tracking-widest mb-6 flex items-center gap-3">
                   <Truck className="text-primary" /> Active Fleet Intelligence
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {myVehicles.length === 0 ? (
                     <div className="col-span-full py-20 text-center border border-white/5 rounded-2xl bg-white/[0.02]">
                        <p className="text-mist/40 font-bold uppercase tracking-widest text-xs">No vehicle assets registered in system.</p>
                     </div>
                   ) : myVehicles.map(v => (
                     <div key={v.id} className="bg-zinc-900 border border-white/5 rounded-[2rem] p-6 hover:border-primary/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h4 className="font-black text-white group-hover:text-primary transition-colors">{v.title}</h4>
                              <p className="text-[10px] text-mist/40 font-bold uppercase tracking-widest mt-0.5">{v.location}</p>
                           </div>
                           <StatusBadge status={v.status} />
                        </div>
                        <div className="flex items-center gap-2 mb-6">
                           <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase tracking-widest">GPS Online</Badge>
                           <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest">Active Shift</Badge>
                        </div>
                        <Button 
                          onClick={() => setActiveFleetVehicle(v)}
                          className="w-full h-12 bg-white/5 hover:bg-primary hover:text-white border border-white/10 group-hover:border-primary font-black uppercase tracking-widest text-[10px] rounded-xl transition-all"
                        >
                           Initialize Live Tracker
                        </Button>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
             <div className="bg-zinc-950 border border-white/10 rounded-[3rem] p-12">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-primary/10">
                      <Settings size={32} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Account & Payout Protocols</h3>
                      <p className="text-sm text-mist/60">Configure your professional identity and financial settlement parameters.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   {/* Profile Settings */}
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Enterprise Identity</h4>
                      <div className="space-y-4">
                         {[
                           { label: 'Provider Name', value: currentUser.name },
                           { label: 'Authorized Email', value: currentUser.email },
                           { label: 'Verification Level', value: (currentUser as any).sltda_verified ? '🏛️ SLTDA ELITE' : 'Basic' }
                         ].map(f => (
                           <div key={f.label} className="p-5 bg-white/5 rounded-2xl border border-white/5">
                              <label className="text-[9px] font-black text-mist/40 uppercase tracking-widest block mb-1">{f.label}</label>
                              <p className="text-sm font-bold text-pearl">{f.value}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Payout Settings */}
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Financial Settlements</h4>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                         <div className="flex items-center justify-between p-4 bg-obsidian rounded-2xl border border-white/5">
                            <div>
                               <p className="text-xs font-black text-white uppercase">Automated Payouts</p>
                               <p className="text-[10px] text-mist/60 mt-0.5">Earnings settled every 24h</p>
                            </div>
                            <Switch checked={true} onCheckedChange={() => {}} />
                         </div>
                         
                         <div>
                            <label className="text-[9px] font-black text-mist/40 uppercase tracking-widest block mb-1">Settlement Method</label>
                            <select className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-primary/40">
                               <option>Bank Transfer (BOC/Sampath/HNB)</option>
                               <option>Digital Wallet (mCash/EzCash)</option>
                               <option>Crypto (USDT/USDC)</option>
                            </select>
                         </div>

                         <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                            <h5 className="text-[9px] font-black text-primary uppercase tracking-widest mb-3">Active Platform Rates</h5>
                            <div className="space-y-2">
                               <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-mist">Service Commission</span>
                                  <span className="text-white">5%</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-mist">Statutory Taxes</span>
                                  <span className="text-white">10%</span>
                                </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex justify-end gap-4">
                   <Button variant="ghost" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] text-mist">Reset Standards</Button>
                   <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-gold-light text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">Commit Configuration</Button>
                </div>
             </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <StayListingModal open={modal === 'stay'} onClose={() => setModal(null)} onSuccess={() => {}} />
      <VehicleListingModal open={modal === 'vehicle'} onClose={() => setModal(null)} onSuccess={() => {}} />
      <EventListingModal open={modal === 'event'} onClose={() => setModal(null)} onSuccess={() => {}} />
      <PropertyListingModal open={modal === 'property'} onClose={() => setModal(null)} onSuccess={() => {}} />
      <SocialListingModal open={modal === 'sme'} onClose={() => setModal(null)} onSuccess={() => {}} />

      {activeFleetVehicle && (
        <RealTimeTracker 
          vehicleName={activeFleetVehicle.title}
          startLocation={{ lat: 6.9271, lng: 79.8612, name: activeFleetVehicle.location }}
          onClose={() => setActiveFleetVehicle(null)}
        />
      )}
    </div>
  );
}

// ── Reusable listings section ─────────────────
function ListingsSection({ title, icon, listings }: {
  title: string;
  icon: string;
  listings: {
    id: string; title: string; location?: string; price?: string;
    status: ListingStatus; adminNote?: string;
    created_at: string; extra?: string; link: string;
  }[]
}) {
  return (
    <div className="bg-white/5 rounded-3xl border border-white/10 shadow-xl overflow-hidden">
      <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
        <h2 className="font-black text-pearl text-base uppercase tracking-widest flex items-center gap-3">
          <span className="text-xl">{icon}</span> {title}
        </h2>
      </div>
      <div className="divide-y divide-white/5">
        {listings.map((listing) => (
          <div key={listing.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 gap-6 hover:bg-white/[0.01] transition-all group">
            <div className="flex-1">
              <Link to={listing.link} className="font-black text-lg text-pearl hover:text-primary transition-colors line-clamp-1 flex items-center gap-3">
                {listing.title}
                <span className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </Link>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {listing.location && <span className="text-xs font-bold text-mist uppercase tracking-tighter/wider flex items-center gap-1.5"><span className="text-lg">📍</span> {listing.location}</span>}
                {listing.price && <span className="text-sm font-black text-primary">{listing.price}</span>}
                {listing.status === 'active' && (
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                    <TrendingUp size={10} /> High Demand
                  </Badge>
                )}
                {listing.extra && <span className="text-[10px] font-black bg-white/10 text-pearl px-3 py-1 rounded-full uppercase tracking-widest">{listing.extra}</span>}
                <span className="text-[11px] font-medium text-mist/60">{timeAgo(listing.created_at)}</span>
              </div>
              {listing.adminNote && (
                <div className="mt-4 text-[11px] font-bold text-amber-500 bg-amber-500/5 px-4 py-3 rounded-xl border border-amber-500/20 flex gap-3 items-center">
                  <span className="text-lg">📋</span>
                  <span>ADMIN FEEDBACK: {listing.adminNote}</span>
                </div>
              )}
            </div>
            <StatusBadge status={listing.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
