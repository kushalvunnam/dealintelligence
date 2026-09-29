import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeals } from '../services/api';
import { BrainCircuit, TrendingUp, Calendar, Activity, Briefcase, ChevronRight, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [firstName, setFirstName] = useState('Kushal');

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
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="h-16 w-1/3 bg-slate-200 rounded-lg animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-[140px] bg-white border border-slate-200 rounded-xl shadow-sm animate-pulse"></div>)}
      </div>
      <div className="h-48 bg-white border border-slate-200 rounded-xl shadow-sm animate-pulse"></div>
    </div>
  );
  
  if (error) return <div className="clean-card p-8 text-red-600">Error: {error}</div>;
  if (!Array.isArray(deals)) return <div className="clean-card p-8 text-red-600">Error: Unable to connect to the backend API.</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <header>
        <h1 className="text-[32px] font-bold text-slate-900 leading-tight">
          Good morning, {firstName}
        </h1>
        <p className="text-slate-500 mt-1 text-[16px]">
          Here's what your sales intelligence is telling you today.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="clean-card p-5 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide">Active Deals</p>
            <div className="p-2 bg-teal-50 rounded-lg text-brand-600"><Briefcase size={20} /></div>
          </div>
          <div>
            <p className="text-[36px] font-bold text-slate-900 leading-none">{deals.length}</p>
            <p className="text-[13px] font-medium text-teal-700 mt-2 flex items-center gap-1">
              <TrendingUp size={14} /> +12% from last month
            </p>
          </div>
        </div>

        <div className="clean-card p-5 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide">Pipeline Value</p>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Activity size={20} /></div>
          </div>
          <div>
            <p className="text-[36px] font-bold text-slate-900 leading-none">₹{(totalValue/100000).toFixed(1)}M</p>
            <p className="text-[13px] font-medium text-slate-500 mt-2">Total active pipeline</p>
          </div>
        </div>

        <div className="clean-card p-5 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide">Memory Signals</p>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><BrainCircuit size={20} /></div>
          </div>
          <div>
            <p className="text-[36px] font-bold text-slate-900 leading-none">17</p>
            <p className="text-[13px] font-medium text-purple-700 mt-2">New insights captured</p>
          </div>
        </div>

        <div className="clean-card p-5 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide">Upcoming Meetings</p>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-500"><Calendar size={20} /></div>
          </div>
          <div>
            <p className="text-[36px] font-bold text-slate-900 leading-none">4</p>
            <p className="text-[13px] font-medium text-slate-500 mt-2">Scheduled this week</p>
          </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="clean-card p-6 border-l-4 border-l-brand-600">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="text-brand-600" size={24} />
          <h2 className="text-xl font-bold text-slate-900">DealMind Insight</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-lg text-slate-700 max-w-4xl">
            <strong className="text-slate-900">ABC Motors</strong> has shown repeated pricing sensitivity across recent interactions. The customer has also mentioned AutoCorp as a potential alternative vendor.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 inline-block">
            <p className="text-[13px] font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Sparkles size={14}/> Recommended Action
            </p>
            <p className="text-slate-700 text-[15px]">Prepare a value-based pricing response before the next meeting to emphasize ROI over absolute cost.</p>
          </div>
          
          <div className="pt-2">
            <button 
              onClick={() => { if(abcDeal) navigate(`/deals/${abcDeal._id}`) }}
              className="btn-primary flex items-center gap-2"
            >
              View Deal Intelligence <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Pipeline by Stage</h2>
        <div className="clean-card overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Deal</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-slate-500 uppercase tracking-wider text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {deals.map((deal) => (
                <tr 
                  key={deal._id} 
                  onClick={() => navigate(`/deals/${deal._id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">{deal.company}</td>
                  <td className="px-6 py-4 text-slate-600">{deal.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-brand-50 text-brand-700 border border-brand-200 text-xs rounded-full font-medium">
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 text-right">₹{deal.value.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
