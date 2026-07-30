import React, { useState, useEffect } from 'react';
import { FileText, Newspaper, ShieldAlert, Compass, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { db, isFirebaseReal } from '../../lib/firebase';
import FirebaseStatusPanel from '../FirebaseStatusPanel';

interface DashboardOverviewProps {
  apps: any[];
  news: any[];
  updates: any[];
}

export const AdminDashboardOverview = React.memo(({ apps, news, updates }: DashboardOverviewProps) => {
  const [pendingReviews, setPendingReviews] = useState<number | null>(null);

  useEffect(() => {
    if (!isFirebaseReal || !db) return;
    try {
      import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
        const q = query(collection(db, 'reviews'), where('is_approved', '==', false));
        const unsub = onSnapshot(q, (snap: any) => {
          setPendingReviews(snap.size);
        }, () => {
          setPendingReviews(0);
        });
        return () => unsub();
      }).catch(() => setPendingReviews(0));
    } catch(e) {
      setPendingReviews(0);
    }
  }, []);

  const chartData = [
    { name: 'Mon', apps: Math.max(0, apps.length - 5), traffic: 4000 },
    { name: 'Tue', apps: Math.max(0, apps.length - 4), traffic: 3000 },
    { name: 'Wed', apps: Math.max(0, apps.length - 3), traffic: 5000 },
    { name: 'Thu', apps: Math.max(0, apps.length - 2), traffic: 2780 },
    { name: 'Fri', apps: Math.max(0, apps.length - 1), traffic: 4890 },
    { name: 'Sat', apps: Math.max(0, apps.length - 0), traffic: 6390 },
    { name: 'Sun', apps: apps.length + 2, traffic: 8490 },
  ];

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8">
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
        <h2 className="text-3xl font-black bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent tracking-tight">Platform Overview</h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Real-time stats and platform health metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-blue-500/5 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Total Apps</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{apps.length}</div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-indigo-500/5 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">App Updates</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{updates?.length || 0}</div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Newspaper className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-amber-500/5 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Pending Reviews</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{pendingReviews === null ? '...' : pendingReviews}</div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-emerald-500/5 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Gateway Health</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">100%</div>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Compass className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-blue-500/5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-blue-500" /> Platform Traffic
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="traffic" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <FirebaseStatusPanel />
        </div>
      </div>
    </div>
  );
});

AdminDashboardOverview.displayName = 'AdminDashboardOverview';

export default AdminDashboardOverview;
