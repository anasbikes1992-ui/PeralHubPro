import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const ForBusinessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "owner";
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: "owner", label: "Property Owner", icon: "🏠" },
    { id: "broker", label: "Broker", icon: "🏢" },
    { id: "stay_provider", label: "Stay Provider", icon: "🏨" },
    { id: "event_organizer", label: "Event Organizer", icon: "🎭" },
    { id: "sme", label: "SME Directory", icon: "🏪" },
  ];

  const content: Record<string, { title: string; subtitle: string; color: string; pricing: { name: string; price: string; basis: string; highlight?: boolean }[]; features: string[]; terms: string[] }> = {
    owner: {
      title: "Property Owner",
      subtitle: "List your property directly and connect with verified buyers across Sri Lanka.",
      color: "emerald",
      pricing: [
        { name: "Listing Fee", price: "Rs. 1,000", basis: "Per listing, one-time" },
        { name: "Sale Commission", price: "2.0%", basis: "Of final sale price" },
        { name: "Buyer Discount", price: "0.5%", basis: "Cashback to buyer (funded by Pearl Hub)", highlight: true },
        { name: "Wanted Ad", price: "Rs. 8,500", basis: "Per ad, valid 30 days" },
      ],
      features: [
        "Direct listing without broker middlemen",
        "Verified NIC & deed documentation",
        "Interactive map placement",
        "Promo code system for buyer cashback",
        "Real-time enquiry notifications",
        "Analytics dashboard with view counts",
      ],
      terms: [
        "Rs. 1,000 flat fee per property listing, non-refundable.",
        "2.0% sale commission payable upon completed transaction.",
        "0.5% buyer cashback on promo redemption (owner-listed only, funded by Pearl Hub).",
        "Wanted ads: Rs. 8,500 flat fee, valid 30 days.",
        "Owners must provide valid NIC and property deed documentation.",
        "All fees processed via LankaPay. Transaction charges borne by client.",
      ],
    },
    broker: {
      title: "Licensed Broker",
      subtitle: "Membership plan with unlimited commission-free sales and 65 active listings.",
      color: "primary",
      pricing: [
        { name: "Monthly Membership", price: "Rs. 23,000", basis: "65 listings/month", highlight: true },
        { name: "Sale Commission", price: "0%", basis: "No commission on sales" },
        { name: "Wanted Ad", price: "Rs. 8,500", basis: "Per ad, valid 30 days" },
      ],
      features: [
        "Up to 65 active listings per month",
        "Zero sale commission",
        "Priority placement in search results",
        "Bulk listing management tools",
        "Dedicated analytics dashboard",
        "Client enquiry management",
      ],
      terms: [
        "Rs. 23,000/month for up to 65 property listings.",
        "Brokers are exempt from sale commission.",
        "Buyer discount NOT applicable on broker-listed properties.",
        "Maximum 65 active listings per billing period.",
        "All listings must have documented owner consent.",
        "All fees processed via LankaPay. Transaction charges borne by client.",
      ],
    },
    stay_provider: {
      title: "Stay Provider",
      subtitle: "List your hotel, villa, guest house, or hostel on Pearl Hub.",
      color: "sapphire",
      pricing: [
        { name: "Commission", price: "8.5%", basis: "Per booking total (excl. taxes)", highlight: true },
        { name: "Listing Fee", price: "Free", basis: "No upfront listing cost" },
      ],
      features: [
        "Sri Lanka Tourism Board approved listings",
        "Multiple room type management",
        "Real-time booking system",
        "Guest review management",
        "Revenue analytics and reports",
        "Integration with LankaPay payments",
      ],
      terms: [
        "8.5% flat commission on each booking total (excluding government taxes).",
        "No upfront listing fee — pay only when you earn.",
        "Must maintain valid STB registration where applicable.",
        "Cancellation policies managed per property.",
        "Payouts processed weekly via LankaPay.",
      ],
    },
    event_organizer: {
      title: "Event Organizer",
      subtitle: "Sell tickets for cinema, concerts, and sports with QR-coded entry.",
      color: "indigo",
      pricing: [
        { name: "Ticket Commission", price: "8.5%", basis: "Per ticket sold", highlight: true },
        { name: "Event Listing", price: "Free", basis: "No upfront listing cost" },
      ],
      features: [
        "QR-coded tamper-proof tickets",
        "Real-time seat selection system",
        "VIP, Premium & Standard tiers",
        "Live sales dashboard",
        "Automated email & SMS tickets",
        "Gate scanning integration",
      ],
      terms: [
        "8.5% commission per ticket sold.",
        "No upfront event listing fee.",
        "QR tickets generated and distributed automatically.",
        "Event cancellation requires 48-hour notice for full refund processing.",
        "Payouts processed within 7 days post-event.",
      ],
    },
    sme: {
      title: "SME Directory",
      subtitle: "Get your small or medium business listed in Pearl Hub's Social Hub.",
      color: "teal",
      pricing: [
        { name: "Basic Listing", price: "Free", basis: "Name, contact, category" },
        { name: "Featured Listing", price: "Rs. 5,000/mo", basis: "Priority placement + badge", highlight: true },
        { name: "Premium Profile", price: "Rs. 12,000/mo", basis: "Full page + promotions" },
      ],
      features: [
        "Business profile with contact details",
        "Category-based discovery",
        "Customer reviews and ratings",
        "Photo gallery for products/services",
        "Social Hub integration",
        "Featured placement options",
      ],
      terms: [
        "Basic listings are free with standard placement.",
        "Featured listings: Rs. 5,000/month, billed monthly.",
        "Premium profiles: Rs. 12,000/month with dedicated page.",
        "All businesses must provide valid BR registration.",
        "Content must comply with Pearl Hub community guidelines.",
      ],
    },
  };

  const active = content[activeTab];
  const colorMap: Record<string, string> = {
    emerald: "from-emerald to-emerald/70",
    primary: "from-primary to-gold-dark",
    sapphire: "from-sapphire to-sapphire/70",
    indigo: "from-indigo to-indigo/70",
    teal: "from-teal to-teal/70",
  };
  const textColorMap: Record<string, string> = {
    emerald: "text-emerald",
    primary: "text-primary",
    sapphire: "text-sapphire",
    indigo: "text-indigo",
    teal: "text-teal",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className={`bg-gradient-to-br ${colorMap[active.color]} py-14`}>
        <div className="container text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/15 text-pearl text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">💼 For Business</div>
          <h1 className="text-pearl text-4xl mb-2">Grow Your Business with Pearl Hub</h1>
          <p className="text-pearl/75 text-lg max-w-[600px] mx-auto">Join Sri Lanka's premier multi-domain marketplace. Choose your business type below.</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-card border-b border-border sticky top-16 z-30">
        <div className="container flex gap-0 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? `border-current ${textColorMap[content[tab.id].color]}` : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-12">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Title */}
          <div className="text-center mb-10">
            <h2 className={`text-3xl mb-2 ${textColorMap[active.color]}`}>{active.title}</h2>
            <p className="text-muted-foreground text-base max-w-[500px] mx-auto">{active.subtitle}</p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {active.pricing.map((p, i) => (
              <div key={i} className={`bg-card rounded-2xl p-6 border-2 text-center transition-all ${p.highlight ? `border-current ${textColorMap[active.color]} shadow-lg` : "border-border"}`}>
                <div className="text-sm font-medium text-muted-foreground mb-2">{p.name}</div>
                <div className={`font-display text-3xl font-bold mb-1 ${p.highlight ? textColorMap[active.color] : ""}`}>{p.price}</div>
                <div className="text-xs text-muted-foreground">{p.basis}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-xl mb-4">✨ Features & Benefits</h3>
              <div className="space-y-3">
                {active.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 bg-card rounded-lg p-3 border border-border">
                    <span className={`text-lg ${textColorMap[active.color]}`}>✓</span>
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl mb-4">📋 Terms & Conditions</h3>
              <div className="bg-card rounded-xl p-5 border border-border space-y-3">
                {active.terms.map((t, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">{i + 1}.</strong> {t}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button onClick={() => navigate(`/login?role=${activeTab}`)}
              className={`bg-gradient-to-r ${colorMap[active.color]} text-pearl px-10 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-xl hover:-translate-y-0.5`}>
              🚀 Get Started as {active.title}
            </button>
            <p className="text-xs text-muted-foreground mt-3">Already have an account? <button onClick={() => navigate("/login")} className="text-primary font-semibold underline">Sign in</button></p>
          </div>

          {/* Social Proof */}
          <div className="mt-16 text-center">
            <h3 className="text-xl mb-6">Trusted by Businesses Across Sri Lanka</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[700px] mx-auto">
              {[
                { value: "890+", label: "Verified Owners" },
                { value: "120+", label: "Licensed Brokers" },
                { value: "340+", label: "Stay Providers" },
                { value: "85+", label: "Event Organizers" },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
                  <div className={`font-display text-2xl font-bold ${textColorMap[active.color]}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForBusinessPage;
