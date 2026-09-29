import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeals } from '../services/api';
import { BrainCircuit, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

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
  
  // Find ABC Motors for the Insight Card navigation
  const abcDeal = safeDeals.find(d => d.company === 'ABC Motors');

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!Array.isArray(deals)) return <div className="p-8 text-red-600">Error: Unable to connect to the backend API. Please configure VITE_API_BASE_URL.</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Good morning, {firstName}</h1>
        <p className="text-slate-500 mt-1">Here's what is happening across your pipeline.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Deals</p>
              <p className="text-2xl font-bold mt-1">{deals.length}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-brand-500"><TrendingUp size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Pipeline Value</p>
              <p className="text-2xl font-bold mt-1">₹{totalValue.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-green-500"><TrendingUp size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Meetings This Week</p>
              <p className="text-2xl font-bold mt-1">4</p>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg text-purple-500"><Calendar size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Follow-ups Due</p>
              <p className="text-2xl font-bold mt-1">2</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg text-orange-500"><AlertCircle size={20} /></div>
          </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-brand-900 to-brand-800 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <BrainCircuit size={160} className="transform translate-x-12 -translate-y-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="text-brand-100" size={24} />
            <h2 className="text-lg font-bold text-brand-50">DealMind Insight</h2>
          </div>
          <p className="text-lg leading-relaxed max-w-3xl">
            <strong>ABC Motors</strong> has raised pricing concerns in 2 recent meetings. 
            The customer also mentioned AutoCorp as an alternative vendor.
          </p>
          <div className="mt-4 p-4 bg-white/10 rounded-lg max-w-3xl border border-white/20">
            <p className="text-sm text-brand-100 uppercase tracking-wider font-semibold mb-1">Recommended Action</p>
            <p>Prepare a value-based pricing response before the next meeting to emphasize ROI over absolute cost.</p>
          </div>
          <button 
            onClick={() => { if(abcDeal) navigate(`/deals/${abcDeal._id}`) }}
            className="mt-6 bg-white text-brand-900 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            View Deal Intelligence
          </button>
        </div>
      </div>

      {/* Pipeline */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Pipeline by Stage</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Deal</th>
                <th className="px-6 py-4 font-medium">Stage</th>
                <th className="px-6 py-4 font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {deals.map((deal) => (
                <tr 
                  key={deal._id} 
                  onClick={() => navigate(`/deals/${deal._id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">{deal.company}</td>
                  <td className="px-6 py-4 text-slate-600">{deal.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-brand-50 text-brand-700 text-sm rounded-full font-medium">
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">₹{deal.value.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
