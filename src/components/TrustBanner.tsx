import { motion } from "framer-motion";

interface TrustBannerProps {
  stats: { value: string; label: string; icon: string }[];
}

const TrustBanner = ({ stats }: TrustBannerProps) => (
  <div className="bg-card border-b border-border py-3">
    <div className="container">
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 text-sm">
            <span>{s.icon}</span>
            <span className="font-bold text-primary">{s.value}</span>
            <span className="text-muted-foreground">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default TrustBanner;
