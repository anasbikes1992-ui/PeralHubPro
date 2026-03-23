import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import faviconImg from "@/assets/hero-property.jpg";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 120);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, hsl(215 35% 7%) 0%, hsl(210 29% 17%) 40%, hsl(210 53% 23%) 100%)" }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center animate-gold-glow"
            style={{ background: "linear-gradient(135deg, hsl(42 52% 54%), hsl(33 46% 41%))" }}
          >
            <img src="/favicon.png" alt="Pearl Hub" className="w-16 h-16 object-contain" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-display text-4xl font-bold mb-2"
            style={{ color: "hsl(30 33% 96%)" }}
          >
            Pearl Hub
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs uppercase tracking-[4px] mb-8"
            style={{ color: "hsl(42 52% 54%)" }}
          >
            Sri Lanka Premium
          </motion.p>

          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 240 }}
            transition={{ delay: 0.6 }}
            className="mx-auto"
          >
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsla(30 33% 96% / 0.1)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(42 52% 54%), hsl(33 46% 41%))", width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-[11px] mt-3" style={{ color: "hsl(207 14% 71%)" }}>
              {progress < 30 ? "Loading assets..." : progress < 60 ? "Preparing marketplace..." : progress < 90 ? "Almost ready..." : "Welcome!"}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
