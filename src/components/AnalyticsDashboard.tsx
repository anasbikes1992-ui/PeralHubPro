import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";

const monthlyData = [
  { month: "Sep", revenue: 320000, bookings: 42, views: 1200 },
  { month: "Oct", revenue: 410000, bookings: 56, views: 1800 },
  { month: "Nov", revenue: 385000, bookings: 48, views: 1650 },
  { month: "Dec", revenue: 520000, bookings: 71, views: 2100 },
  { month: "Jan", revenue: 480000, bookings: 63, views: 2400 },
  { month: "Feb", revenue: 610000, bookings: 85, views: 3100 },
  { month: "Mar", revenue: 725000, bookings: 94, views: 3600 },
];

const trafficData = [
  { day: "Mon", visitors: 450, pageViews: 1200 },
  { day: "Tue", visitors: 520, pageViews: 1400 },
  { day: "Wed", visitors: 480, pageViews: 1300 },
  { day: "Thu", visitors: 610, pageViews: 1800 },
  { day: "Fri", visitors: 720, pageViews: 2200 },
  { day: "Sat", visitors: 850, pageViews: 2800 },
  { day: "Sun", visitors: 680, pageViews: 2100 },
];

const topListings = [
  { name: "Luxury Villa - Colombo 7", type: "property", views: 342, enquiries: 18 },
  { name: "Shangri-La Colombo", type: "stay", views: 215, enquiries: 12 },
  { name: "Toyota Prius 2022", type: "vehicle", views: 185, enquiries: 24 },
  { name: "Oppenheimer - IMAX", type: "event", views: 890, enquiries: 156 },
];

const AnalyticsDashboard = () => {
  const { userRole, properties, stays, vehicles, events } = useStore();
  const [dateRange, setDateRange] = useState("30d");
  const [loading, setLoading] = useState(false);

  const isAdmin = userRole === "admin";
  const isProvider = ["owner", "broker", "stay_provider", "vehicle_provider", "event_organizer", "sme"].includes(userRole);

  const categoryData = [
    { name: "Properties", value: properties.length, color: "hsl(155, 60%, 27%)" },
    { name: "Stays", value: stays.length, color: "hsl(210, 53%, 23%)" },
    { name: "Vehicles", value: vehicles.length, color: "hsl(350, 73%, 33%)" },
    { name: "Events", value: events.length, color: "hsl(256, 57%, 29%)" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-black text-pearl tracking-tight">Analytics Overview</h2>
          <p className="text-mist text-sm font-medium mt-1">Real-time performance metrics for your Pearl Hub ecosystem.</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          {[
            { id: "7d", label: "7D" },
            { id: "30d", label: "30D" },
            { id: "90d", label: "90D" },
            { id: "1y", label: "1Y" },
          ].map(r => (
            <button 
              key={r.id} 
              onClick={() => setDateRange(r.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                dateRange === r.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-mist hover:text-pearl"
              }`}
            >
              {r.label}
            </button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-1 self-center" />
          <button className="px-4 py-2 text-primary text-[10px] font-black tracking-widest uppercase hover:bg-white/5 rounded-xl transition-all">
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: "💰", label: "Estimated Revenue", value: isAdmin ? "Rs. 2.4M" : "Rs. 124K", change: "+12.5%", color: "text-emerald" },
          { icon: isAdmin ? "👥" : "📅", label: isAdmin ? "New Users" : "Active Bookings", value: isAdmin ? "1,240" : "42", change: "+5.2%", color: "text-sapphire" },
          { icon: "🏠", label: "Active Listings", value: properties.length + stays.length + vehicles.length + events.length, change: "+3", color: "text-primary" },
          { icon: "📈", label: "Conversion Rate", value: "3.2%", change: "+0.8%", color: "text-ruby" },
        ].map((kpi, i) => (
          <div key={i} className="group bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-primary/50 transition-all hover:bg-white/[0.08] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl filter drop-shadow-md">{kpi.icon}</span>
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-white/5 border border-white/5 text-emerald">
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-black text-pearl mb-1">{kpi.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-mist">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Revenue Chart */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-mist">Revenue Growth</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-mist uppercase tracking-widest">Revenue</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6A24D" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#C6A24D" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#6B7280' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#6B7280' }}
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0A0A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontWeight: 900 }}
                itemStyle={{ color: '#C6A24D' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C6A24D" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Split */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-mist mb-8">Asset Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={categoryData} 
                cx="50%" 
                cy="50%" 
                innerRadius={70} 
                outerRadius={100} 
                paddingAngle={8} 
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0A0A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontWeight: 900 }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Listings Table */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-mist">Top Performing Assets</h3>
          <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-pearl transition-colors">
            Full Report →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-mist">Asset Name</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-mist">Category</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-mist">Views</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-mist">Inquiries</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-mist">Conv Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topListings.map((item, i) => (
                <tr key={i} className="group hover:bg-white/[0.03] transition-colors">
                  <td className="px-8 py-6 font-bold text-pearl group-hover:text-primary transition-colors">{item.name}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-white/5 border border-white/5 text-mist">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-sm text-pearl opacity-60 group-hover:opacity-100">{item.views.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right font-black text-sm text-pearl opacity-60 group-hover:opacity-100">{item.enquiries.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-emerald font-black text-sm">
                      {((item.enquiries / item.views) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
