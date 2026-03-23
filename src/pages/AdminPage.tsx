import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, AlertCircle, BarChart3, Clock, CheckCircle2, XCircle, UserX, Info } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  moderation_status: string;
  admin_notes?: string;
  active: boolean;
  admin_status_reason?: string;
  user_id: string;
  type?: string;
  created_at: string;
}

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  report_type: string;
  description: string;
  status: string;
  created_at: string;
}

const AdminPage = () => {
  const { currentUser, showToast } = useStore();
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) loadAdminData();
    else setLoading(false);
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [staysRes, vehiclesRes, eventsRes, reportsRes, analyticsRes] = await Promise.all([
        supabase.from('stays_listings').select('*').eq('moderation_status', 'pending'),
        supabase.from('vehicles_listings').select('*').eq('moderation_status', 'pending'),
        supabase.from('events_listings').select('*').eq('moderation_status', 'pending'),
        supabase.from('user_reports' as any).select('*').eq('status', 'pending'),
        supabase.from('bookings' as any).select('total_amount, currency, created_at').limit(1000)
      ]);

      const allPending = [
        ...staysRes.data?.map(l => ({ ...l, type: 'stay' })) || [],
        ...vehiclesRes.data?.map(l => ({ ...l, type: 'vehicle' })) || [],
        ...eventsRes.data?.map(l => ({ ...l, type: 'event' })) || []
      ];

      setPendingListings(allPending);
      setReports(reportsRes.data || []);

      const bookings = analyticsRes.data || [];
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      setAnalytics({
        totalRevenue,
        totalBookings: bookings.length,
        avgBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
        recentBookings: bookings.slice(0, 10)
      });
    } catch (err) {
      console.error(err);
      showToast("Data retrieval failure.", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (listingId: string, type: string, status: string, notes: string = '') => {
    const table = type === 'stay' ? 'stays_listings' : type === 'vehicle' ? 'vehicles_listings' : 'events_listings';
    const { error } = await supabase.from(table as any).update({ moderation_status: status, admin_notes: notes }).eq('id', listingId);

    if (error) {
      showToast("Status transition failure.", "error");
      return;
    }

    await supabase.from('admin_actions' as any).insert({
      admin_id: currentUser!.id,
      action_type: 'moderation_update',
      target_type: 'listing',
      target_id: listingId,
      details: { status, notes, listing_type: type }
    });

    showToast(`Listing ${status === 'approved' ? 'verified' : 'rejected'}.`, "success");
    loadAdminData();
  };

  const suspendUser = async (userId: string, reason: string) => {
    const { error } = await supabase.from('profiles').update({ verified: false }).eq('id', userId);
    if (error) {
      showToast("Suspension protocol failure.", "error");
      return;
    }

    await supabase.from('admin_actions' as any).insert({
      admin_id: currentUser!.id,
      action_type: 'user_suspension',
      target_type: 'user',
      target_id: userId,
      details: { reason }
    });

    showToast("User credentials de-verified.", "warning");
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-mist/40 italic">Decrypting Secure Ledger</span>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-zinc-900 border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="bg-destructive/10 p-12 flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-destructive/20 flex items-center justify-center text-destructive mb-2 shadow-2xl">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Security Breach Detected</h2>
            <p className="text-mist text-sm font-medium">Insufficient clearance level for Administrative Protocol.</p>
          </div>
          <Button variant="outline" className="border-white/10 rounded-2xl h-12 px-8 uppercase text-[10px] font-black tracking-widest hover:bg-white/5" onClick={() => window.history.back()}>
            Withdraw Immediately
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-primary/30">
      <div className="max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-20">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/20 text-primary">
                <ShieldCheck size={24} />
              </div>
              <Badge className="bg-primary/10 text-primary-foreground border-primary/20 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1">
                Omni-Level Authorization
              </Badge>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-pearl">Central Control Hub</h1>
            <p className="text-mist text-sm font-medium max-w-lg opacity-60">Architectural oversight and moderation portal for the PearlHub ecosystem.</p>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={loadAdminData} variant="outline" className="bg-white/5 border-white/5 rounded-2xl h-14 px-6 hover:bg-white/10 text-mist">
              <Clock className="mr-2 opacity-40" size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Refresh Ledger</span>
            </Button>
          </div>
        </header>

        <Tabs defaultValue="moderation" className="space-y-12">
          <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/5 h-14 backdrop-blur-3xl">
            <TabsTrigger value="moderation" className="rounded-xl px-10 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">Moderation Queue</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl px-10 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">Incidents</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl px-10 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">Network Intel</TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="grid grid-cols-1 gap-6">
                {pendingListings.length === 0 ? (
                  <Card className="bg-zinc-900/50 border-white/5 border-dashed border-2 py-20 rounded-[3rem] flex flex-col items-center justify-center text-center gap-6">
                     <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-mist/20">
                       <CheckCircle2 size={32} />
                     </div>
                     <div className="space-y-1">
                       <h3 className="text-xl font-black text-white">Queue Purified</h3>
                       <p className="text-mist text-xs">All architectural assets have been moderated.</p>
                     </div>
                  </Card>
                ) : (
                  pendingListings.map((listing) => (
                    <Card key={listing.id} className="bg-zinc-900 border-white/5 rounded-[2.5rem] p-8 hover:border-primary/20 transition-all group shadow-2xl">
                      <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div className="flex gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 group-hover:scale-110 transition-transform">
                             <Info size={24} />
                           </div>
                           <div className="space-y-2">
                             <div className="flex items-center gap-3">
                               <h3 className="text-xl font-black text-pearl">{listing.title}</h3>
                               <Badge className="bg-zinc-800 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-white/5">{listing.type}</Badge>
                             </div>
                             <p className="text-mist text-xs font-medium opacity-60 flex items-center gap-2 italic">
                               <Clock size={12} className="opacity-40" /> Archive Entry: {new Date(listing.created_at).toLocaleString()}
                             </p>
                             <div className="flex gap-4 mt-4">
                                <Button onClick={() => updateListingStatus(listing.id, listing.type!, 'approved')} className="h-10 rounded-xl bg-primary hover:bg-gold-light text-primary-foreground font-black text-[9px] uppercase tracking-widest px-6 shadow-lg shadow-primary/20">
                                  Authorize Asset
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="h-10 rounded-xl border-white/10 bg-white/5 hover:bg-destructive/10 hover:border-destructive/20 text-mist hover:text-destructive font-black text-[9px] uppercase tracking-widest px-6 transition-all">
                                      Flag Conflict
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-[2.5rem] p-10">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-2xl font-black text-white">Rejection Protocol</AlertDialogTitle>
                                      <AlertDialogDescription className="text-mist">Specify the conflict or policy violation for the registry record.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <Textarea id={`reject-${listing.id}`} className="bg-white/5 border-white/10 rounded-2xl py-4" placeholder="Narrative for rejection..." />
                                    <AlertDialogFooter className="mt-6">
                                      <AlertDialogCancel className="rounded-xl border-white/10">Abort</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => updateListingStatus(listing.id, listing.type!, 'rejected', (document.getElementById(`reject-${listing.id}`) as any).value)} className="rounded-xl bg-destructive text-white hover:bg-destructive/80 font-black uppercase text-[10px] tracking-widest">
                                        Execute Rejection
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                             </div>
                           </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3 justify-center">
                           <Badge variant="outline" className="border-primary/30 text-primary text-[8px] font-black uppercase tracking-widest bg-primary/5 py-1 px-3">Status: Pending Verification</Badge>
                           <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-mist/40 hover:text-destructive flex items-center gap-2" onClick={() => suspendUser(listing.user_id, 'Policy Violation Review')}>
                             <UserX size={12} /> Suspend Source
                           </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
             </div>
          </TabsContent>

          {/* Incidents (Simplified) */}
          <TabsContent value="reports" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <Card className="bg-zinc-900 border-white/5 rounded-[3rem] p-12 text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-2xl">
                  <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white">Incident Registry</h2>
                  <p className="text-mist text-sm max-w-sm mx-auto">Review and resolve user-reported discrepancies and behavioral anomalies.</p>
                </div>
                <div className="w-full max-w-2xl bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-mist/40 text-[10px] font-black uppercase tracking-widest italic">
                   System scan complete: {reports.length} unhandled incidents detected.
                </div>
             </Card>
          </TabsContent>

          {/* Intel (Analytics) */}
          <TabsContent value="analytics" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-gradient-to-br from-primary/20 to-zinc-900 border-white/5 p-10 rounded-[3rem] shadow-2xl overflow-hidden relative group">
                   <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors"><BarChart3 size={120} /></div>
                   <div className="relative z-10 space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Net Liquid Growth</p>
                     <p className="text-4xl font-black text-pearl tracking-tighter">LKR {analytics.totalRevenue?.toLocaleString()}</p>
                   </div>
                </Card>
                <Card className="bg-zinc-900 border-white/5 p-10 rounded-[3rem] shadow-2xl">
                   <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mist/40">Network Volume</p>
                     <p className="text-4xl font-black text-pearl tracking-tighter">{analytics.totalBookings} <span className="text-sm text-mist/40">Transactions</span></p>
                   </div>
                </Card>
                <Card className="bg-zinc-900 border-white/5 p-10 rounded-[3rem] shadow-2xl border-b-primary/30 border-b-4">
                   <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mist/40">Yield Efficiency</p>
                     <p className="text-4xl font-black text-pearl tracking-tighter">LKR {analytics.avgBookingValue?.toFixed(0)}</p>
                   </div>
                </Card>
             </div>
             
             <Card className="bg-zinc-900 border-white/5 rounded-[3rem] p-12">
                <div className="flex items-center justify-between mb-10">
                   <div className="space-y-1">
                     <h3 className="text-2xl font-black text-pearl">Real-time Data Stream</h3>
                     <p className="text-mist text-xs">Live ecosystem transaction monitoring.</p>
                   </div>
                </div>
                <div className="space-y-4">
                  {analytics.recentBookings?.map((booking: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">₱</div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-white">LKR {booking.total_amount?.toLocaleString()}</p>
                          <p className="text-[10px] text-mist/40 font-bold uppercase tracking-widest">{new Date(booking.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge className="bg-zinc-800 border-white/10 text-[9px] font-black px-3 py-1 uppercase">{booking.currency}</Badge>
                    </div>
                  ))}
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;