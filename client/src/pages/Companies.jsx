import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeals } from '../services/api';
import { Building2, MapPin, Globe } from 'lucide-react';

export default function Companies() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  if (loading) return <div className="p-8 text-slate-500">Loading companies...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!Array.isArray(deals)) return <div className="p-8 text-red-600">Error: Unable to connect to the backend API.</div>;

  // Extract unique companies from deals
  const uniqueCompaniesMap = new Map();
  deals.forEach(deal => {
    if (deal.company && !uniqueCompaniesMap.has(deal.company)) {
      uniqueCompaniesMap.set(deal.company, deal);
    }
  });
  const companies = Array.from(uniqueCompaniesMap.values());

  if (companies.length === 0) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">No Companies Found</h2>
        <p className="text-slate-500 mt-2">There are currently no companies available in the database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((deal) => (
          <div 
            key={deal.company} 
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/deals/${deal._id}`)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{deal.company}</h3>
                <p className="text-sm text-slate-500">Active Deal: {deal.name}</p>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>www.{deal.company.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Headquarters</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
