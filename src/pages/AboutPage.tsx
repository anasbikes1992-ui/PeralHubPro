const AboutPage = () => (
  <div className="min-h-screen bg-background">
    <div className="bg-gradient-to-br from-obsidian via-slate to-sapphire py-16">
      <div className="container text-center">
        <h1 className="text-pearl text-4xl font-display font-bold mb-4">About Pearl Hub</h1>
        <p className="text-fog text-lg max-w-2xl mx-auto">Sri Lanka's premier multi-domain marketplace platform connecting customers with the island's finest services.</p>
      </div>
    </div>
    <div className="container py-16">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {[
            { icon: "🎯", title: "Our Mission", desc: "To digitize and streamline Sri Lanka's property, hospitality, transport, and entertainment industries through a single trusted platform." },
            { icon: "👁️", title: "Our Vision", desc: "To become the go-to marketplace for every Sri Lankan and tourist seeking properties, stays, vehicles, or events across the island." },
            { icon: "🛡️", title: "Trust & Safety", desc: "Every listing is verified with NIC and deed documentation. Brokers require signed owner consent forms. QR tickets are tamper-proof." },
            { icon: "💎", title: "Transparent Pricing", desc: "Clear, published commission rates with no hidden fees. Buyers get 0.5% cashback on owner property sales through our promo system." },
          ].map(item => (
            <div key={item.title} className="bg-card rounded-xl p-6 border border-border">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <h2 className="text-2xl mb-4">Pearl Hub in Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "12,400+", label: "Properties" },
              { value: "3,200+", label: "Stays Listed" },
              { value: "1,800+", label: "Vehicles" },
              { value: "4,280+", label: "Users" },
            ].map(s => (
              <div key={s.label}><div className="font-display text-2xl font-bold text-primary">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AboutPage;
