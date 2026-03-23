import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

const ToastNotification = () => {
  const { toast, clearToast } = useStore();

  useEffect(() => {
    if (toast) {
      const t = setTimeout(clearToast, 4000);
      return () => clearTimeout(t);
    }
  }, [toast, clearToast]);

  const typeConfig: Record<string, { icon: string; classes: string; border: string }> = {
    success: { 
      icon: "✨", 
      classes: "bg-emerald/10 text-emerald", 
      border: "border-emerald/20" 
    },
    error: { 
      icon: "🚨", 
      classes: "bg-ruby/10 text-ruby", 
      border: "border-ruby/20" 
    },
    warning: { 
      icon: "⚠️", 
      classes: "bg-amber/10 text-amber", 
      border: "border-amber/20" 
    },
    info: { 
      icon: "📘", 
      classes: "bg-primary/10 text-primary", 
      border: "border-primary/20" 
    },
  };

  const config = toast ? (typeConfig[toast.type] || typeConfig.info) : typeConfig.info;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className={`fixed bottom-8 right-8 z-[3000] flex items-center gap-4 p-5 rounded-[1.5rem] border backdrop-blur-3xl shadow-2xl min-w-[320px] max-w-[420px] ${config.classes} ${config.border}`}
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
            {config.icon}
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Notification</div>
            <div className="text-sm font-bold leading-tight">{toast.message}</div>
          </div>
          <button 
            onClick={clearToast} 
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;
