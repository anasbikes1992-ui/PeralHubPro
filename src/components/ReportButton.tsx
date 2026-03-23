import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Flag, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";

interface ReportButtonProps {
  listingId: string;
  listingType: string;
  reportedUserId?: string;
}

const ReportButton = ({ listingId, listingType, reportedUserId }: ReportButtonProps) => {
  const { currentUser, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser) {
       showToast("Authentication required for reporting.", "error");
       return;
    }
    if (!reportType || !description.trim()) {
      showToast("Please provide a category and description.", "warning");
      return;
    }

    setSubmitting(true);
    const { error } = await (supabase.from('user_reports' as any).insert({
      reporter_id: currentUser.id,
      reported_user_id: reportedUserId,
      listing_id: listingId,
      listing_type: listingType,
      report_type: reportType,
      description: description.trim(),
      status: 'pending'
    }) as any);

    setSubmitting(false);

    if (error) {
      showToast("Incident report transmission failure.", "error");
      console.error(error);
      return;
    }

    showToast("Discrepancy reported for administrative review.", "success");
    setIsOpen(false);
    setReportType("");
    setDescription("");
  };

  if (!currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-mist/40 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all h-9 px-4 gap-2"
        >
          <Flag className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Flag Incident</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-white/10 rounded-[2.5rem] p-10 max-w-md shadow-2xl">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4 border border-destructive/20 shadow-lg shadow-destructive/10">
            <ShieldAlert size={24} />
          </div>
          <DialogTitle className="text-2xl font-black text-white tracking-tight">Security & Integrity Report</DialogTitle>
          <DialogDescription className="text-mist text-xs font-medium">Identify policy violations or fraudulent behavior for manual audit.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-mist uppercase tracking-widest ml-1">Violation Archetype</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl focus:ring-primary/20">
                <SelectValue placeholder="Select classification..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                <SelectItem value="spam" className="focus:bg-primary/20 py-3">Spam / Excessive Traffic</SelectItem>
                <SelectItem value="fraud" className="focus:bg-primary/20 py-3">Fraud / Scam Suspicion</SelectItem>
                <SelectItem value="inappropriate" className="focus:bg-primary/20 py-3">Inappropriate Narrative</SelectItem>
                <SelectItem value="fake_listing" className="focus:bg-primary/20 py-3">Synthetic / Mirror Asset</SelectItem>
                <SelectItem value="other" className="focus:bg-primary/20 py-3">Unclassified Anomaly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-mist uppercase tracking-widest ml-1">Narrative Evidence</label>
            <Textarea
              placeholder="Elaborate on the detected discrepancy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 rounded-2xl py-4 min-h-[120px] focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 rounded-2xl h-14 border border-white/5 text-mist/60 hover:text-white uppercase text-[10px] font-black tracking-widest">
              Abort Protocol
            </Button>
            <Button 
               onClick={handleSubmit} 
               disabled={submitting}
               className="flex-1 bg-destructive hover:bg-destructive/80 text-white rounded-2xl h-14 shadow-xl shadow-destructive/20 uppercase text-[10px] font-black tracking-widest"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Transmitting...
                </>
              ) : "Execute Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportButton;