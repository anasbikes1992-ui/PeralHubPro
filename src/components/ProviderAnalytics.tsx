import React from 'react';
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Globe
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface AnalyticsProps {
  data: {
    earnings: { date: string; amount: number }[];
    occupancy: { date: string; rate: number }[];
    languages: { lang: string; count: number }[];
  }
}

export const ProviderAnalytics = ({ data }: AnalyticsProps) => {
  const currentEarnings = data.earnings.reduce((acc, curr) => acc + curr.amount, 0);
  const avgOccupancy = Math.round(data.occupancy.reduce((acc, curr) => acc + curr.rate, 0) / data.occupancy.length);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-white/5 p-6 rounded-[2rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} className="text-primary" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mist/60 mb-2">Total Earnings</p>
          <h3 className="text-3xl font-black text-white tracking-tight">Rs. {currentEarnings.toLocaleString()}</h3>
          <div className="flex items-center gap-1.5 mt-4 text-emerald text-[10px] font-black uppercase tracking-widest">
            <ArrowUpRight size={14} /> 12.5% vs last month
          </div>
        </Card>

        <Card className="bg-zinc-900 border-white/5 p-6 rounded-[2rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar size={80} className="text-sapphire" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mist/60 mb-2">Avg. Occupancy</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{avgOccupancy}%</h3>
          <div className="flex items-center gap-1.5 mt-4 text-emerald text-[10px] font-black uppercase tracking-widest">
            <ArrowUpRight size={14} /> 4.2% vs last month
          </div>
        </Card>

        <Card className="bg-zinc-900 border-white/5 p-6 rounded-[2rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe size={80} className="text-ruby" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mist/60 mb-2">Top Origin</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{data.languages[0]?.lang || 'N/A'}</h3>
          <div className="flex items-center gap-1.5 mt-4 text-mist/40 text-[10px] font-black uppercase tracking-widest">
            {data.languages.slice(1, 3).map(l => l.lang).join(' · ')}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-white/5 p-8 rounded-[2.5rem]">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-pearl mb-8 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Revenue Performance
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.earnings}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#C5A059', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#C5A059" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-white/5 p-8 rounded-[2.5rem]">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-pearl mb-8 flex items-center gap-2">
            <Users size={16} className="text-sapphire" /> Occupancy Trend
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.occupancy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="rate" stroke="#0077FF" strokeWidth={3} dot={{ fill: '#0077FF', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
