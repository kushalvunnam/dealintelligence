import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeals } from '../services/api';
import { BrainCircuit, TrendingUp, Calendar, AlertCircle, Sparkles, ChevronRight, Activity, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [firstName, setFirstName] = useState('Alex');

  useEffect(() => {
    const loadName = () => {
      const saved = localStorage.getItem('dealmind_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setFirstName(parsed.name.split(' ')[0]);
      }
    };
    
    loadName();
    window.addEventListener('profileUpdated', loadName);

    getDeals().then(data => {
      setDeals(data);
    }).catch(err => {
      console.error(err);
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });

    return () => window.removeEventListener('profileUpdated', loadName);
  }, []);

  const safeDeals = Array.isArray(deals) ? deals : [];
  const totalValue = safeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  
  const abcDeal = safeDeals.find(d => d.company === 'ABC Motors');

  if (loading) return (
    <div className="space-y-6">
      <div className="h-20 bg-navy-800/50 rounded-xl animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-navy-800/50 rounded-xl animate-pulse"></div>)}
      </div>
      <div className="h-64 bg-navy-800/50 rounded-xl animate-pulse"></div>
    </div>
  );
  if (error) return <div className="glass-panel p-8 text-red-400">Error: {error}</div>;
  if (!Array.isArray(deals)) return <div className="glass-panel p-8 text-red-400">Error: Unable to connect to the backend API.</div>;

  return (
    <div className="space-y-8">
      <header className="relative z-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm tracking-tight">
          Good morning, {firstName}
        </h1>
        <p className="text-slate-400 mt-2 text-lg font-medium flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400" /> Here is what your sales intelligence is telling you today.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 perspective-1000">
        <div className="card-3d p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={64} className="text-brand-400 transform translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Deals</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-white">{deals.length}</p>
              <div className="flex items-center text-sm font-medium text-brand-400 mb-1">
                <TrendingUp size={16} className="mr-1" /> +12%
              </div>
            </div>
          </div>
        </div>

        <div className="card-3d p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={64} className="text-emerald-400 transform translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Pipeline Value</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-white">₹{(totalValue/100000).toFixed(1)}M</p>
            </div>
          </div>
        </div>

        <div className="card-3d p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit size={64} className="text-purple-400 transform translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Memory Signals</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-white">17</p>
              <p className="text-sm font-medium text-purple-400 mb-1">New insights</p>
            </div>
          </div>
        </div>

        <div className="card-3d p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar size={64} className="text-orange-400 transform translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Upcoming Meetings</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-white">4</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(20,184,166,0.15)] group transform transition-transform duration-500 hover:scale-[1.01]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 to-navy-900/90 backdrop-blur-xl z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse-slow z-0"></div>
        
        <div className="relative z-10 p-8 border border-brand-500/30 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-400/50">
                <BrainCircuit className="text-brand-300 w-5 h-5" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-brand-400/0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] border-brand-400/50"></div>
            </div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-white">DealMind Insight</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-xl leading-relaxed text-slate-200 max-w-4xl font-medium">
              <strong className="text-white">ABC Motors</strong> has shown repeated pricing sensitivity across recent interactions. The customer has also mentioned AutoCorp as a potential alternative vendor.
            </p>
            
            <div className="p-5 bg-navy-950/50 rounded-xl border border-white/10 max-w-4xl backdrop-blur-md shadow-inner relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-400 to-brand-600"></div>
              <p className="text-xs text-brand-400 uppercase tracking-widest font-bold mb-2 ml-2 flex items-center gap-2">
                <Sparkles size={14}/> Recommended Action
              </p>
              <p className="text-slate-300 ml-2">Prepare a value-based pricing response before the next meeting to emphasize ROI over absolute cost.</p>
            </div>
            
            <button 
              onClick={() => { if(abcDeal) navigate(`/deals/${abcDeal._id}`) }}
              className="group flex items-center gap-2 mt-4 bg-white/10 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-white/20 hover:border-brand-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]"
            >
              View Deal Intelligence <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="pt-4">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-400" /> Pipeline by Stage
        </h2>
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/5">
                <th className="px-6 py-5 font-semibold">Company</th>
                <th className="px-6 py-5 font-semibold">Deal</th>
                <th className="px-6 py-5 font-semibold">Stage</th>
                <th className="px-6 py-5 font-semibold text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {deals.map((deal) => (
                <tr 
                  key={deal._id} 
                  onClick={() => navigate(`/deals/${deal._id}`)}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-5 font-medium text-white group-hover:text-brand-300 transition-colors">{deal.company}</td>
                  <td className="px-6 py-5 text-slate-300">{deal.name}</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1.5 bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs rounded-full font-semibold tracking-wide">
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-medium text-white text-right">₹{deal.value.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
