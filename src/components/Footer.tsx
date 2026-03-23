import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const socialLinks = [
    { icon: "f",  label: "Facebook",  url: "https://facebook.com/pearlhub.lk" },
    { icon: "ig", label: "Instagram", url: "https://instagram.com/pearlhub.lk" },
    { icon: "x",  label: "X",         url: "https://twitter.com/pearlhub_lk" },
    { icon: "yt", label: "YouTube",   url: "https://youtube.com/@pearlhub" },
    { icon: "in", label: "LinkedIn",  url: "https://linkedin.com/company/grabber-mobility" },
  ];

  const cols = [
    {
      title: "Services",
      links: [
        { label: "Property Listings",  path: "/property" },
        { label: "Stays & Hotels",     path: "/stays" },
        { label: "Vehicle Rental",     path: "/vehicles" },
        { label: "Event Booking",      path: "/events" },
        { label: "SME Marketplace",    path: "/sme" },
      ],
    },
    {
      title: "For Business",
      links: [
        { label: "Property Owners",   path: "/for-business?tab=owner" },
        { label: "Broker Membership", path: "/for-business?tab=broker" },
        { label: "Stay Providers",    path: "/for-business?tab=stay_provider" },
        { label: "Event Organizers",  path: "/for-business?tab=event_organizer" },
        { label: "SME Directory",     path: "/for-business?tab=sme" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us",         path: "/about" },
        { label: "Contact Us",       path: "/contact" },
        { label: "For Business",     path: "/for-business" },
        { label: "Careers",          path: "/about" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Customer Terms",    path: "/terms/customer" },
        { label: "Provider Terms",    path: "/terms/provider" },
        { label: "Platform Terms",    path: "/terms" },
        { label: "Privacy Policy",    path: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="bg-obsidian border-t border-white/[0.05]">
      {/* Powered by banner */}
      <div className="border-b border-white/[0.04] py-3">
        <div className="container flex items-center justify-center gap-2.5">
          <span className="text-[10px] text-mist/30 uppercase tracking-widest font-medium">Powered by</span>
          <span className="text-[11px] font-black text-primary/70 tracking-tight">GRABBER MOBILITY SOLUTIONS (PVT) LTD</span>
          <span className="text-[10px] text-mist/20">·</span>
          <span className="text-[10px] text-mist/30">Registered in Sri Lanka</span>
        </div>
      </div>

      <div className="container pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-gold-dark rounded-full flex items-center justify-center text-base">💎</div>
              <div>
                <div className="font-display font-bold text-lg text-pearl">Pearl Hub</div>
                <div className="text-[9px] text-primary tracking-[2px]">SRI LANKA</div>
              </div>
            </div>
            <p className="text-[12px] text-fog leading-relaxed max-w-[240px] mb-4">
              Sri Lanka's premier multi-vertical marketplace. Properties, stays, vehicles, events, and local SMEs — all in one platform.
            </p>

            {/* Payment gateway logos */}
            <p className="text-[9px] font-black text-mist/30 uppercase tracking-widest mb-2">Accepted Payments</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "PayHere",  color: "bg-red-500/15 text-red-400 border-red-500/20" },
                { label: "LankaPay", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
                { label: "WebXPay",  color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
              ].map(p => (
                <span key={p.label} className={`text-[9px] font-black px-2 py-0.5 rounded border ${p.color}`}>{p.label}</span>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-2 mt-4">
              {socialLinks.map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label}
                  className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-black text-mist/50 hover:bg-primary/20 hover:text-primary transition-all uppercase">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <div className="text-[11px] font-black text-pearl mb-3 uppercase tracking-wider">{col.title}</div>
              {col.links.map(link => (
                <div key={link.label} onClick={() => navigate(link.path)}
                  className="text-[12px] text-fog mb-2.5 cursor-pointer hover:text-primary transition-colors">
                  {link.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-5 space-y-2">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-pearl">Grabber Mobility Solutions (Pvt) Ltd</div>
              <div className="text-[10px] text-mist/40">No. 1, De Mel Place, Colombo 03, Sri Lanka · +94 11 XXX XXXX</div>
            </div>
            <div className="text-[10px] text-mist/30 text-right">
              <div>Pearl Hub® is a registered trademark of Grabber Mobility Solutions (Pvt) Ltd</div>
              <div className="mt-0.5">All rights reserved. Unauthorised use prohibited.</div>
            </div>
          </div>
          <div className="flex justify-between items-center flex-wrap gap-2 pt-2 border-t border-white/[0.04]">
            <div className="text-[10px] text-mist/30">© 2026 Grabber Mobility Solutions (Pvt) Ltd · Pearl Hub. All rights reserved.</div>
            <div className="text-[10px] text-mist/30">🇱🇰 Proudly Sri Lankan</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
