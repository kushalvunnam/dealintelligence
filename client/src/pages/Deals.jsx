import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeals } from '../services/api';

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  useEffect(() => {
    getDeals().then(data => {
      setDeals(data);
    }).catch(err => {
      console.error(err);
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading deals...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!Array.isArray(deals)) return <div className="p-8 text-red-600">Error: Unable to connect to the backend API. Please configure VITE_API_BASE_URL.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Active Deals</h1>
      </div>

      <div className="glass-panel rounded-xl shadow-glass border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-sm text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Company</th>
              <th className="px-6 py-4 font-medium">Deal Name</th>
              <th className="px-6 py-4 font-medium">Value</th>
              <th className="px-6 py-4 font-medium">Stage</th>
              <th className="px-6 py-4 font-medium">Probability</th>
              <th className="px-6 py-4 font-medium">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {deals.map((deal) => (
              <tr 
                key={deal._id} 
                className="hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/deals/${deal._id}`)}
              >
                <td className="px-6 py-4 font-bold text-white">{deal.company}</td>
                <td className="px-6 py-4 text-slate-400">{deal.name}</td>
                <td className="px-6 py-4 font-medium text-white">₹{deal.value.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-white/10 text-slate-300 text-sm rounded-full font-medium">
                    {deal.stage}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{deal.probability}%</td>
                <td className="px-6 py-4 text-slate-400">{deal.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

