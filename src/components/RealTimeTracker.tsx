import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeafletMap from "@/components/LeafletMap";
import { 
  ShieldCheck, AlertTriangle, Zap, Fuel, Compass, 
  Clock, MapPin, Phone, User, X, Play, Pause, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TrackerProps {
  vehicleName: string;
  driverName?: string;
  driverPhone?: string;
  startLocation: { lat: number; lng: number; name: string };
  onClose: () => void;
}

const ROUTE_POINTS = [
  { lat: 6.9271, lng: 79.8612 },
  { lat: 6.9350, lng: 79.8580 },
  { lat: 6.9420, lng: 79.8530 },
  { lat: 6.9510, lng: 79.8470 },
  { lat: 7.0000, lng: 79.8150 },
  { lat: 7.0200, lng: 79.8000 },
];

const RealTimeTracker = ({ vehicleName, driverName = "Arjuna Silva", driverPhone = "+94 77 123 4567", startLocation, onClose }: TrackerProps) => {
  const [position, setPosition] = useState(startLocation);
  const [telemetry, setTelemetry] = useState({
    speed: 0,
    heading: 0,
    totalKm: 0,
    tripTime: 0,
    fuel: 85,
    battery: 94,
    temp: 82
  });
  
  const [safetyStatus, setSafetyStatus] = useState<"safe" | "warning" | "danger">("safe");
  const [isMoving, setIsMoving] = useState(true);
  const routeIdx = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMoving) return;
      
      routeIdx.current = (routeIdx.current + 1) % ROUTE_POINTS.length;
      const next = ROUTE_POINTS[routeIdx.current];
      const jitterLat = (Math.random() - 0.5) * 0.001;
      const jitterLng = (Math.random() - 0.5) * 0.001;

      setPosition({ lat: next.lat + jitterLat, lng: next.lng + jitterLng, name: startLocation.name });

      const newSpeed = Math.floor(40 + Math.random() * 45);
      setTelemetry(prev => ({
        ...prev,
        speed: newSpeed,
        heading: Math.floor(Math.random() * 360),
        totalKm: +(prev.totalKm + newSpeed * (2 / 3600)).toFixed(2),
        tripTime: prev.tripTime + 2,
        fuel: Math.max(0, prev.fuel - 0.01),
        temp: 80 + Math.random() * 5
      }));

      if (newSpeed > 75) setSafetyStatus("warning");
      else if (newSpeed > 85) setSafetyStatus("danger");
      else setSafetyStatus("safe");
    }, 2000);

    return () => clearInterval(interval);
  }, [isMoving, startLocation.name]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="fixed inset-0 bg-obsidian/90 backdrop-blur-xl z-[1200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-950 rounded-[3rem] max-w-5xl w-full border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[90vh]"
      >
        {/* Top Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                 <Activity size={28} className="animate-pulse" />
              </div>
              <div>
                 <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    {vehicleName} <span className="text-mist/40 font-medium">|</span> <span className="text-primary tracking-widest text-xs">A-7742</span>
                 </h2>
                 <p className="text-[10px] font-black text-mist/60 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Operational & Live Telemetry
                 </p>
              </div>
           </div>
           <Button variant="ghost" onClick={onClose} className="w-12 h-12 rounded-full hover:bg-ruby hover:text-white transition-all">
              <X size={24} />
           </Button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
           {/* Telemetry Panel */}
           <div className="lg:col-span-4 border-r border-white/5 p-8 overflow-y-auto no-scrollbar space-y-8 bg-zinc-900/30">
              {/* Security Status */}
              <div className={`p-4 rounded-2xl border ${safetyStatus === 'safe' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-ruby/10 border-ruby/20'} transition-all`}>
                 <div className="flex items-center gap-3 mb-2">
                    {safetyStatus === 'safe' ? <ShieldCheck size={18} className="text-emerald-500" /> : <AlertTriangle size={18} className="text-ruby" />}
                    <span className={`text-[11px] font-black uppercase tracking-widest ${safetyStatus === 'safe' ? 'text-emerald-500' : 'text-ruby'}`}>
                       {safetyStatus === 'safe' ? 'System Normative' : 'Security Alert'}
                    </span>
                 </div>
                 <p className="text-[11px] text-mist/70 leading-relaxed italic">
                    {safetyStatus === 'safe' ? 'Vehicle is maintaining optimal velocity within designated geofence parameters.' : 'Extreme velocity detected. Operational supervisor notified.'}
                 </p>
              </div>

              {/* Driver Identity */}
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-mist uppercase tracking-widest flex items-center gap-2">
                    <User size={12} className="text-primary" /> Active Personnel
                 </h3>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                       <p className="text-xs font-black text-pearl">{driverName}</p>
                       <p className="text-[9px] text-mist/40 font-bold uppercase mt-0.5 tracking-tighter">Verified Partner • 4.9⭐</p>
                    </div>
                    <Button size="icon" className="w-10 h-10 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/20">
                       <Phone size={16} />
                    </Button>
                 </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 gap-4">
                 {[
                    { label: 'Velocity', value: `${telemetry.speed} km/h`, icon: <Compass size={14} />, color: 'text-primary' },
                    { label: 'Odometer', value: `${telemetry.totalKm} km`, icon: <MapPin size={14} />, color: 'text-emerald-500' },
                    { label: 'Fuel Reserved', value: `${telemetry.fuel.toFixed(0)}%`, icon: <Fuel size={14} />, color: 'text-amber-500' },
                    { label: 'Health Index', value: `${telemetry.battery}%`, icon: <Zap size={14} />, color: 'text-sapphire' },
                 ].map(m => (
                    <div key={m.label} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div className="flex items-center gap-2 mb-2 text-mist/40">
                          {m.icon} <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                       </div>
                       <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
                    </div>
                 ))}
              </div>

              {/* Trip Time */}
              <div className="p-5 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/10">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Clock size={20} className="text-primary" />
                      <div>
                        <p className="text-[10px] font-black text-mist uppercase tracking-widest">Active Triptime</p>
                        <p className="text-2xl font-black text-white">{formatTime(telemetry.tripTime)}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-mist uppercase tracking-widest">Est. ETA</p>
                      <p className="text-lg font-black text-primary">14:45</p>
                   </div>
                 </div>
              </div>
           </div>

           {/* Spatial Display (Map) */}
           <div className="lg:col-span-8 relative">
              <LeafletMap 
                height="100%"
                center={[position.lat, position.lng]}
                zoom={14}
                markers={[{
                  lat: position.lat,
                  lng: position.lng,
                  title: vehicleName,
                  location: "Live Position",
                  type: 'vehicle',
                  emoji: '🚗'
                }]}
              />
              
              {/* Controls Overlay */}
              <div className="absolute top-8 left-8 z-[400] flex gap-3">
                 <Badge className="bg-zinc-950/80 backdrop-blur-md border-white/10 px-4 py-2 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    Live GPS Stream Active
                 </Badge>
              </div>

              <div className="absolute bottom-8 right-8 z-[400] flex gap-3">
                 <Button 
                   onClick={() => setIsMoving(!isMoving)}
                   className={`h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl ${isMoving ? 'bg-ruby hover:bg-ruby/80' : 'bg-emerald shadow-emerald/20 hover:bg-emerald-600'}`}
                 >
                    {isMoving ? <><Pause size={16} className="mr-2" /> Halt Protocols</> : <><Play size={16} className="mr-2" /> Resume Mission</>}
                 </Button>
              </div>

              <div className="absolute bottom-8 left-8 z-[400] bg-zinc-950/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 group">
                 <p className="text-[9px] font-black text-mist/60 uppercase tracking-widest mb-2">Spatial Coordinates</p>
                 <div className="flex gap-4 font-mono text-[10px] text-primary">
                    <span>{position.lat.toFixed(6)} N</span>
                    <span>{position.lng.toFixed(6)} E</span>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeTracker;
