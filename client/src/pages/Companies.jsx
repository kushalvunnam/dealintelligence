import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeals, updateCompany } from '../services/api';
import { Building2, MapPin, Globe, Edit2, X, AlertCircle } from 'lucide-react';

export default function Companies() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const fetchDeals = () => {
    getDeals().then(data => {
      setDeals(data);
    }).catch(err => {
      console.error(err);
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const openEditModal = (e, companyName) => {
    e.stopPropagation(); // prevent navigation
    setEditingCompany(companyName);
    setCompanyName(companyName);
    setSaveError(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCompany(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setSaveError('Company Name is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await updateCompany(editingCompany, { name: companyName.trim() });
      fetchDeals();
      closeEditModal();
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to update company');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-navy-800/50 rounded-xl animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-navy-800/50 rounded-xl animate-pulse"></div>)}
      </div>
    </div>
  );
  
  if (error) return <div className="glass-panel p-8 text-red-400">Error: {error}</div>;
  if (!Array.isArray(deals)) return <div className="glass-panel p-8 text-red-400">Error: Unable to connect to the backend API.</div>;

  const uniqueCompaniesMap = new Map();
  deals.forEach(deal => {
    if (deal.company && !uniqueCompaniesMap.has(deal.company)) {
      uniqueCompaniesMap.set(deal.company, deal);
    }
  });
  const companies = Array.from(uniqueCompaniesMap.values());

  if (companies.length === 0) {
    return (
      <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
        <Building2 className="w-16 h-16 text-slate-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">No Companies Found</h2>
        <p className="text-slate-400 mt-2">There are currently no companies available in the intelligence database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative perspective-1000">
      <div className="flex justify-between items-center relative z-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
          Companies
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {companies.map((deal) => (
          <div 
            key={deal.company} 
            className="card-3d p-6 cursor-pointer group"
            onClick={() => navigate(`/deals/${deal._id}`)}
          >
            <button 
              onClick={(e) => openEditModal(e, deal.company)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-brand-400 bg-white/5 hover:bg-brand-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-sm"
              title="Edit Company"
            >
              <Edit2 className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-5 pr-10">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:border-brand-400/50 transition-colors">
                <Building2 className="w-6 h-6 text-brand-400" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-lg text-white truncate group-hover:text-brand-300 transition-colors" title={deal.company}>{deal.company}</h3>
                <p className="text-sm text-slate-400 truncate flex items-center gap-1">
                  <Activity size={12} className="text-brand-500" /> Active: {deal.name}
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="p-1.5 bg-white/5 rounded-md"><Globe className="w-4 h-4 text-brand-400" /></div>
                <span className="truncate font-mono text-xs opacity-80">www.{deal.company.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="p-1.5 bg-white/5 rounded-md"><MapPin className="w-4 h-4 text-purple-400" /></div>
                <span className="truncate opacity-80">Global HQ</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Edit Company Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel border-white/10 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(20,184,166,0.15)] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-900 opacity-90 z-0"></div>
            
            <div className="relative z-10 flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Building2 className="text-brand-400 w-5 h-5" /> Edit Intelligence Profile
              </h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="relative z-10 p-6 space-y-6">
              {saveError && (
                <div className="p-3 bg-red-900/30 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {saveError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-navy-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all shadow-inner"
                  placeholder="Enter company name"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
                  <Activity size={12} className="text-brand-500"/> Updates intelligence mappings globally.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving || !companyName.trim() || companyName === editingCompany}
                  className="px-6 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-lg font-medium transition-all shadow-neon disabled:opacity-50 disabled:shadow-none"
                >
                  {isSaving ? 'Syncing...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
