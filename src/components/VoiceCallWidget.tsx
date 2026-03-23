import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, 
  User, UserPlus, Shield, Sparkles, X, 
  ArrowRight, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallState {
  status: 'idle' | 'calling' | 'connected' | 'ended';
  duration: number;
}

export default function VoiceCallWidget({ 
  partnerName = "Pearl Hub Concierge", 
  partnerRole = "Travel Expert", 
  isOpen, 
  onClose 
}: { 
  partnerName?: string, 
  partnerRole?: string, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [call, setCall] = useState<CallState>({ status: 'idle', duration: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [requestCallback, setRequestCallback] = useState(false);

  useEffect(() => {
    let interval: any;
    if (call.status === 'connected') {
      interval = setInterval(() => {
        setCall(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [call.status]);

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setCall({ status: 'calling', duration: 0 });
    setTimeout(() => {
      setCall({ status: 'connected', duration: 0 });
    }, 2500);
  };

  const endCall = () => {
    setCall(prev => ({ ...prev, status: 'ended' }));
    setTimeout(() => {
      setCall({ status: 'idle', duration: 0 });
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none p-6">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="pointer-events-auto w-full max-w-md bg-zinc-950 border border-white/10 rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative"
        >
          {/* Backdrop Aura */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
          
          {/* Header */}
          <div className="p-8 pb-4 flex justify-between items-start relative z-10">
            <div>
               <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black uppercase tracking-widest px-3 py-1 mb-3">Secure Encryption Active</Badge>
               <h3 className="text-pearl text-2xl font-black tracking-tight leading-none uppercase">{call.status === 'idle' ? 'Premium Voice' : 'Live Communication'}</h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-mist hover:text-white transition-all">
               <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative z-10">
             <div className="relative mb-8">
                <motion.div 
                   animate={call.status === 'calling' || call.status === 'connected' ? { scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] } : {}}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute inset-0 bg-primary rounded-full blur-2xl"
                />
                <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-5xl border-4 border-zinc-950 relative z-20 shadow-2xl">
                   {partnerName.charAt(0)}
                </div>
                {call.status === 'connected' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-zinc-950 flex items-center justify-center shadow-lg">
                     <CheckCircle2 size={16} className="text-white" />
                  </motion.div>
                )}
             </div>

             <h2 className="text-pearl text-xl font-bold mb-1 tracking-tight">{partnerName}</h2>
             <p className="text-mist/60 text-xs font-black uppercase tracking-widest mb-6">{partnerRole}</p>

             {call.status === 'calling' && <p className="text-primary text-sm font-black animate-pulse">Establishing Secure Line...</p>}
             {call.status === 'connected' && (
                <div className="space-y-2">
                   <p className="text-emerald-500 text-3xl font-mono font-bold tracking-tighter">{formatDuration(call.duration)}</p>
                   <p className="text-[10px] text-mist/30 font-black uppercase tracking-[0.3em]">H-Def Stream Active</p>
                </div>
             )}
             {call.status === 'ended' && <p className="text-ruby text-sm font-black">Line Disconnected</p>}
          </div>

          {/* Controls */}
          <div className="p-10 bg-white/[0.02] border-t border-white/5 flex flex-col gap-8 relative z-10">
             {call.status === 'idle' ? (
               <div className="flex flex-col gap-4">
                  <Button 
                    onClick={startCall}
                    className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
                  >
                    <Phone size={24} /> Start Voice Session
                  </Button>
                  <Button 
                    onClick={() => setRequestCallback(true)}
                    variant="ghost"
                    className="h-14 rounded-2xl border border-white/10 text-mist hover:text-pearl font-black uppercase tracking-widest text-xs"
                  >
                    Request Callback in 5m
                  </Button>
               </div>
             ) : (
               <div className="flex items-center justify-center gap-12">
                  <div className="flex flex-col items-center gap-2">
                     <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${isMuted ? 'bg-ruby text-white border-ruby shadow-lg shadow-ruby/20' : 'bg-white/5 border-white/10 text-mist hover:text-white'}`}>
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                     </button>
                     <span className="text-[9px] font-black uppercase tracking-widest text-mist/40">{isMuted ? 'Unmute' : 'Mute'}</span>
                  </div>

                  <button 
                    onClick={endCall}
                    className="w-20 h-20 rounded-[2.5rem] bg-ruby hover:bg-ruby-light text-white flex items-center justify-center shadow-2xl shadow-ruby/30 transition-transform active:scale-95"
                  >
                    <PhoneOff size={32} />
                  </button>

                  <div className="flex flex-col items-center gap-2">
                     <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-mist hover:text-white transition-all">
                        <UserPlus size={24} />
                     </button>
                     <span className="text-[9px] font-black uppercase tracking-widest text-mist/40">Add Guest</span>
                  </div>
               </div>
             )}
          </div>

          <AnimatePresence>
            {requestCallback && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-zinc-950 z-50 flex flex-col items-center justify-center p-10 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
                   <Shield size={40} />
                </div>
                <h3 className="text-pearl text-xl font-bold mb-2">Expert Scheduled</h3>
                <p className="text-mist/60 text-sm mb-8">A Sri Lankan travel specialist will contact your registered phone number within 5 minutes.</p>
                <Button onClick={() => { setRequestCallback(false); onClose(); }} className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs">
                   Got it, thanks
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border ${className}`}>
      {children}
    </span>
  );
}
