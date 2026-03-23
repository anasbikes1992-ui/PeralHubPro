import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatPrice, timeAgo, obfuscateEmail } from '@/lib/utils';
import { ListingStatus } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

type AdminTab = 'overview' | 'stays' | 'vehicles' | 'events' | 'properties' | 'social' | 'sme' | 'users' | 'alerts' | 'ops' | 'settings';

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

// ── Status control modal ──────────────────────
function StatusControlModal({
  open, onClose, itemName, currentStatus, onSave,
}: {
  open: boolean; onClose: () => void; itemName: string;
  currentStatus: ListingStatus; onSave: (status: ListingStatus, note: string) => void;
}) {
  const [status, setStatus] = useState<ListingStatus>(currentStatus);
  const [note, setNote] = useState('');

  const statusColors: Record<ListingStatus, string> = {
    active: 'border-emerald-500 bg-emerald-500/5',
    paused: 'border-amber-500 bg-amber-500/5',
    off: 'border-ruby-500 bg-ruby-500/5', // using off as rejected/ruby
    pending: 'border-sapphire-500 bg-sapphire-500/5',
    rejected: 'border-mist-500 bg-mist-500/5',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white rounded-[2.5rem] p-10">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-lg shadow-primary/10">
            <ShieldCheck size={24} />
          </div>
          <DialogTitle className="text-2xl font-black text-white tracking-tight">Security & Moderation Protocol</DialogTitle>
          <DialogDescription className="text-mist text-xs font-medium">Override architectural asset status for system integrity.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
            <p className="text-sm font-black text-white tracking-tight truncate mb-1">{itemName}</p>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-mist/40 font-black uppercase tracking-widest italic">Current State:</span>
               <StatusBadge status={currentStatus} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(['active', 'paused', 'off'] as ListingStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left group ${
                  status === s ? statusColors[s] : 'border-white/5 hover:border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-4 h-4 rounded-full border-4 border-zinc-950 ${
                    s === 'active' ? 'bg-emerald' : s === 'paused' ? 'bg-amber-500' : 'bg-ruby'
                  }`} />
                  <div>
                    <p className="font-black text-[11px] uppercase tracking-widest text-white group-hover:text-primary transition-colors">{s}</p>
                    <p className="text-[10px] text-mist/60 font-medium mt-0.5 max-w-[200px]">
                      {s === 'active' ? 'Publicly visible and indexed for discovery.' :
                        s === 'paused' ? 'Temporarily hidden from search and maps.' :
                        'Deactivated and locked from all transactions.'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-mist uppercase tracking-[0.2em] ml-2">Administrative Justification</label>
            <Textarea
              placeholder="Provide narrative for state transition..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-white/5 border-white/10 focus:ring-primary/20 text-white min-h-[100px] rounded-2xl p-4 text-xs font-medium placeholder:text-mist/20"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-14 border border-white/5 text-mist/60 hover:text-white uppercase text-[10px] font-black tracking-widest">Abort</Button>
            <Button onClick={() => { onSave(status, note); onClose() }} className="flex-1 rounded-2xl h-14 bg-primary hover:bg-gold-light text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
              Apply Protocol
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Admin Table Row ───────────────────────────
function AdminTableRow({
  id, title, location, price, status, createdAt, providerLabel,
  onStatusChange, onDelete,
}: {
  id: string; title: string; location?: string; price?: string;
  status: ListingStatus; createdAt: string; providerLabel: string;
  onStatusChange: (id: string, status: ListingStatus, note: string) => void;
  onDelete: (id: string) => void;
}) {
  const [modal, setModal] = useState(false);

  return (
    <tr className="hover:bg-white/5 transition-colors border-b border-white/5 group">
      <td className="px-6 py-4">
        <p className="font-bold text-sm text-pearl max-w-[200px] truncate group-hover:text-primary transition-colors">{title}</p>
        {location && <p className="text-[11px] text-mist mt-0.5 font-medium">📍 {location}</p>}
      </td>
      <td className="px-6 py-4 text-[11px] text-mist font-bold uppercase tracking-tight">{providerLabel}</td>
      <td className="px-6 py-4">{price && <span className="text-sm font-black text-primary">{price}</span>}</td>
      <td className="px-6 py-4"><StatusBadge status={status} /></td>
      <td className="px-6 py-4 text-[11px] text-mist/60 font-medium">{timeAgo(createdAt)}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            onClick={() => setModal(true)}
            className="h-8 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary text-[11px] font-black uppercase tracking-wider hover:text-white"
          >
            Manage
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { if (confirm('Delete this listing?')) onDelete(id) }}
            className="h-8 rounded-lg text-ruby hover:bg-ruby/10 p-2"
          >
            🗑️
          </Button>
        </div>
        <StatusControlModal
          open={modal}
          onClose={() => setModal(false)}
          itemName={title}
          currentStatus={status}
          onSave={(s, n) => onStatusChange(id, s, n)}
        />
      </td>
    </tr>
  );
}




// ── Main Admin Dashboard ──────────────────────
export default function AdminDashboard() {
  const {
    currentUser, userRole,
    stays, vehicles, events, properties, socialPosts, smeBusinesses,
    updateStay, updateVehicle, updateEvent, updateProperty, updateSocialPost, updateSMEBusiness,
    deleteStay, deleteVehicle, deleteEvent, deleteProperty, deleteSocialPost,
    users, updateUserBadges,
    globalSettings, updateGlobalSettings
  } = useStore();

  const [reports, setReports] = useState<any[]>([]);
  const [tab, setTab] = useState<AdminTab>('overview');

  useEffect(() => {
    if (userRole === 'admin') {
      supabase.from('user_reports' as any).select('*').eq('status', 'pending').then(({ data }) => setReports(data || []));
    }
  }, [userRole]);

  const { profile } = useAuth();
  // Double-check: verify real Supabase profile role, not just Zustand state
  const isRealAdmin = profile?.role === 'admin';
  if (!isRealAdmin) return <Navigate to="/" replace />;

  const stats = {
    stays: stays.length,
    vehicles: vehicles.length,
    events: events.length,
    properties: properties.length,
    social: socialPosts.length,
    sme: smeBusinesses.length,
    pending: [
      ...stays, ...vehicles, ...events,
      ...properties, ...smeBusinesses,
    ].filter((x: any) => x.status === 'pending').length,
  };

  const TABS: { id: AdminTab; label: string; icon: string; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'stays', label: 'Stays', icon: '🏨', count: stats.stays },
    { id: 'vehicles', label: 'Vehicles', icon: '🚗', count: stats.vehicles },
    { id: 'events', label: 'Events', icon: '🎭', count: stats.events },
    { id: 'properties', label: 'Props', icon: '🏡', count: stats.properties },
    { id: 'social', label: 'Social', icon: '🌏', count: stats.social },
    { id: 'sme', label: 'SMEs', icon: '🛍️', count: stats.sme },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'alerts', label: 'Alerts', icon: '🚩', count: reports.length },
    { id: 'ops', label: 'Ops Audit', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Header */}
      <div className="bg-primary/10 border-b border-primary/20 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl shadow-lg border border-primary/20">🛡️</div>
            <div>
              <h1 className="text-2xl font-black text-pearl tracking-tight">Admin Control Panel</h1>
              <p className="text-mist text-xs font-bold uppercase tracking-[0.2em] mt-1">Total System Management · Sri Lanka</p>
            </div>
            {stats.pending > 0 && (
              <div className="ml-auto bg-ruby text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg shadow-ruby/20 flex items-center gap-2 animate-pulse uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white" /> {stats.pending} Needs Review
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 rounded-2xl p-1.5 border border-white/10 shadow-inner mb-10 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                tab === t.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-mist hover:text-pearl hover:bg-white/5'
              }`}
            >
              {t.icon} {t.label}
              {t.count !== undefined && (
                <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-white/20' : 'bg-white/5 text-mist/60'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: 'Stays', value: stats.stays, icon: '🏨', color: 'text-emerald-500 bg-emerald-500/10' },
                { label: 'Vehicles', value: stats.vehicles, icon: '🚗', color: 'text-sapphire-500 bg-sapphire-500/10' },
                { label: 'Events', value: stats.events, icon: '🎭', color: 'text-indigo-500 bg-indigo-500/10' },
                { label: 'Props', value: stats.properties, icon: '🏡', color: 'text-amber-500 bg-amber-500/10' },
                { label: 'Posts', value: stats.social, icon: '🌏', color: 'text-teal-500 bg-teal-500/10' },
                { label: 'SMEs', value: stats.sme, icon: '🛍️', color: 'text-orange-500 bg-orange-500/10' },
                { label: 'Pending', value: stats.pending, icon: '⏳', color: 'text-ruby-500 bg-ruby-500/10' },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-2xl p-5 border border-white/10 group hover:border-white/20 transition-all ${stat.color}`}>
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-2xl font-black text-pearl">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-mist mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 rounded-3xl border border-white/10 p-8">
              <h2 className="font-black text-pearl text-lg mb-6 uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full" /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Review Stays', icon: '🏨', action: () => setTab('stays') },
                  { label: 'Manage Fleet', icon: '🚗', action: () => setTab('vehicles') },
                  { label: 'Audit Events', icon: '🎭', action: () => setTab('events') },
                  { label: 'Property List', icon: '🏡', action: () => setTab('properties') },
                  { label: 'Social Mods', icon: '🌏', action: () => setTab('social') },
                  { label: 'SME Registry', icon: '🛍️', action: () => setTab('sme') },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-pearl">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stays Table */}
        {tab === 'stays' && (
          <AdminTable
            title="Hospitality Management"
            rows={stays.map((s) => ({
              id: s.id, title: s.name, location: s.location,
              price: formatPrice(s.price_per_night, s.currency) + '/nt',
              status: s.status, createdAt: s.created_at,
              providerLabel: 'Stay Provider',
            }))}
            onStatusChange={(id, status, note) => updateStay(id, { status, admin_note: note })}
            onDelete={deleteStay}
          />
        )}

        {/* Vehicles Table */}
        {tab === 'vehicles' && (
          <AdminTable
            title="Transport Fleet Control"
            rows={vehicles.map((v) => ({
              id: v.id, title: v.title, location: v.location,
              price: formatPrice(v.price_per_day, v.currency) + '/day',
              status: v.status, createdAt: v.created_at,
              providerLabel: v.is_fleet ? 'Fleet' : 'Individual',
            }))}
            onStatusChange={(id, status, note) => updateVehicle(id, { status, admin_note: note })}
            onDelete={deleteVehicle}
          />
        )}

        {/* Events Table */}
        {tab === 'events' && (
          <AdminTable
            title="Entertainment & Events"
            rows={events.map((e) => ({
              id: e.id, title: e.title, location: e.venue,
              price: formatPrice((Object.values(e.prices)[0] as number) || 0, 'LKR'),
              status: e.status, createdAt: e.created_at,
              providerLabel: 'Event Prov',
            }))}
            onStatusChange={(id, status, note) => updateEvent(id, { status, admin_note: note })}
            onDelete={deleteEvent}
          />
        )}

        {/* Properties Table */}
        {tab === 'properties' && (
          <AdminTable
            title="Real Estate Inventory"
            rows={properties.map((p) => ({
              id: p.id, title: p.title, location: p.location,
              price: formatPrice(p.price, p.currency),
              status: p.status, createdAt: p.listed,
              providerLabel: p.listing_type.toUpperCase(),
            }))}
            onStatusChange={(id, status, note) => updateProperty(id, { status, admin_note: note })}
            onDelete={deleteProperty}
          />
        )}

        {/* Social Table */}
        {tab === 'social' && (
          <AdminTable
            title="Community Moderation"
            rows={socialPosts.map((p) => ({
              id: p.id,
              title: p.content.slice(0, 60) + '...',
              location: p.location || 'Unknown',
              status: p.status, createdAt: p.created_at,
              providerLabel: 'Member',
            }))}
            onStatusChange={(id, status) => updateSocialPost(id, { status })}
            onDelete={deleteSocialPost}
          />
        )}

        {/* SME Table */}
        {tab === 'sme' && (
          <AdminTable
            title="Local Business Registry"
            rows={smeBusinesses.map((b) => ({
              id: b.id, title: b.business_name, location: b.location,
              status: b.status, createdAt: b.created_at,
              providerLabel: b.category,
            }))}
            onStatusChange={(id, status, note) => updateSMEBusiness(id, { status, admin_note: note })}
            onDelete={() => {}} 
          />
        )}

        {/* Users Table */}
        {tab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-3xl border border-white/10 p-8">
               <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">User Management & Verification</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(users).map((u) => (
                    <div key={u.id} className="bg-zinc-900 border border-white/5 rounded-3xl p-6 hover:border-primary/40 transition-all group">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
                             {u.name[0]}
                          </div>
                          <div>
                             <p className="font-black text-white text-sm uppercase tracking-tight">{u.name}</p>
                             <p className="text-[10px] text-mist/60 font-bold mb-1">{u.email}</p>
                             <Badge className="bg-white/10 text-mist text-[8px] font-black uppercase tracking-widest">{u.role}</Badge>
                          </div>
                       </div>
                       <div className="flex flex-wrap gap-2 mb-6">
                          {['SLTDA Verified', 'Eco-Friendly', 'Top-Rated'].map(b => (
                            <button
                              key={b}
                              onClick={() => {
                                const current = u.verification_badges || [];
                                const next = current.includes(b) ? current.filter(x => x !== b) : [...current, b];
                                updateUserBadges(u.id, next);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                u.verification_badges?.includes(b) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-mist/40 hover:bg-white/10'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* Alerts Table (formerly Reports) */}
        {tab === 'alerts' && (
          <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-10">
            <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase tracking-widest">Active System Reports</h3>
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex justify-between items-center group hover:bg-white/5 transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-ruby bg-ruby/10 px-2 py-0.5 rounded-full">{r.type}</span>
                      <span className="text-xs font-bold text-white italic">ID: {r.listing_id}</span>
                    </div>
                    <p className="text-sm text-mist/80 font-medium">{r.reason || r.description}</p>
                    <p className="text-[10px] text-mist/40 mt-1 font-black uppercase tracking-widest italic">{timeAgo(r.created_at)}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="rounded-xl text-emerald hover:bg-emerald/10 uppercase text-[9px] font-black tracking-widest group-hover:text-white">Resolve</Button>
                    <Button size="sm" variant="ghost" className="rounded-xl text-ruby hover:bg-ruby/10 uppercase text-[9px] font-black tracking-widest group-hover:text-white">Block Asset</Button>
                  </div>
                </div>
              ))}
              {reports.length === 0 && <div className="text-center py-20 text-mist/20 font-black uppercase tracking-[0.3em]">No security alerts</div>}
            </div>
          </div>
        )}

        {tab === 'ops' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
             <OperationalReportCenter />
          </motion.div>
        )}

        {tab === 'settings' && (
          <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-10">
            <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase tracking-widest">Mktplace Algorithm & Global Protocol</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Stays Settings */}
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 rounded-2xl bg-sapphire/20 flex items-center justify-center text-xl border border-sapphire/20">🏨</div>
                   <h4 className="font-black text-xs uppercase tracking-widest text-white">Stays Configuration</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-mist uppercase tracking-widest block mb-2 px-1">Service Charge (%)</label>
                    <input 
                      type="number" 
                      value={globalSettings.stays.serviceCharge * 100} 
                      onChange={(e) => updateGlobalSettings('stays', { serviceCharge: parseFloat(e.target.value) / 100 })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-mist uppercase tracking-widest block mb-2 px-1">Local Tax (%)</label>
                    <input 
                      type="number" 
                      value={globalSettings.stays.tax * 100} 
                      onChange={(e) => updateGlobalSettings('stays', { tax: parseFloat(e.target.value) / 100 })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Rentals Settings */}
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 rounded-2xl bg-ruby/20 flex items-center justify-center text-xl border border-ruby/20">🚗</div>
                   <h4 className="font-black text-xs uppercase tracking-widest text-white">Rental Algorithm</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-mist uppercase tracking-widest block mb-2 px-1">Daily KM Allowance</label>
                    <input 
                      type="number" 
                      value={globalSettings.rentals.baseKm} 
                      onChange={(e) => updateGlobalSettings('rentals', { baseKm: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-mist uppercase tracking-widest block mb-2 px-1">Excess KM Rate (Rs.)</label>
                    <input 
                      type="number" 
                      value={globalSettings.rentals.excessKmRate} 
                      onChange={(e) => updateGlobalSettings('rentals', { excessKmRate: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Events Settings */}
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-xl border border-indigo-500/20">🎭</div>
                   <h4 className="font-black text-xs uppercase tracking-widest text-white">Event Protocols</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-mist uppercase tracking-widest block mb-2 px-1">Entertainment Tax (%)</label>
                    <input 
                      type="number" 
                      value={globalSettings.events.tax * 100} 
                      onChange={(e) => updateGlobalSettings('events', { tax: parseFloat(e.target.value) / 100 })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-primary/10 border border-primary/20 rounded-3xl flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl border border-primary/20 animate-pulse">⚡</div>
               <p className="text-xs text-mist font-bold uppercase tracking-widest">Global Protocol Notice: Changes to these values propogate immediately through the marketplace pricing engine.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Generic Admin Table ───────────────────────
function AdminTable({ title, rows, onStatusChange, onDelete }: {
  title: string
  rows: {
    id: string; title: string; location?: string; price?: string;
    status: ListingStatus; createdAt: string; providerLabel: string;
  }[]
  onStatusChange: (id: string, status: ListingStatus, note: string) => void
  onDelete: (id: string) => void
}) {
  const [filter, setFilter] = useState<ListingStatus | ''>('');
  const filtered = filter ? rows.filter((r) => r.status === filter) : rows;

  return (
    <div className="bg-white/5 rounded-3xl border border-white/10 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
        <h2 className="font-black text-pearl text-base uppercase tracking-widest">{title}</h2>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ListingStatus | '')}
            className="bg-obsidian border border-white/10 text-mist text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl outline-none focus:border-primary/50"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="paused">Paused</option>
            <option value="off">Off</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.01] border-b border-white/5">
              <th className="px-8 py-4 text-[10px] font-black text-mist uppercase tracking-widest">Listing Details</th>
              <th className="px-8 py-4 text-[10px] font-black text-mist uppercase tracking-widest">Type</th>
              <th className="px-8 py-4 text-[10px] font-black text-mist uppercase tracking-widest">Price</th>
              <th className="px-8 py-4 text-[10px] font-black text-mist uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-mist uppercase tracking-widest">Listed</th>
              <th className="px-8 py-4 text-[10px] font-black text-mist uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-8 py-20 text-center text-mist text-xs italic">No listings match the current filters</td></tr>
            ) : filtered.map((row) => (
              <AdminTableRow
                key={row.id}
                {...row}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
