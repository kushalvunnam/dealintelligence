import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeals, updateCompany, createDeal } from '../services/api';
import { Building2, MapPin, Globe, Edit2, X, AlertCircle, Activity, ChevronRight, Plus } from 'lucide-react';

export default function Companies() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyName, setCompanyName] = useState('');
  
  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

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
    e.stopPropagation();
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

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      setSaveError('Company Name is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      // Create a dummy deal to register the company
      await createDeal({ company: newCompanyName.trim(), name: 'General Deal', stage: 'Lead', value: 0 });
      fetchDeals();
      setIsAddModalOpen(false);
      setNewCompanyName('');
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to add company');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-white border border-slate-200 rounded-xl animate-pulse shadow-sm"></div>)}
      </div>
    </div>
  );
  
  if (error) return <div className="clean-card p-8 text-red-600 font-medium">Error: {error}</div>;
  if (!Array.isArray(deals)) return <div className="clean-card p-8 text-red-600 font-medium">Error: Unable to connect to the backend API.</div>;

  const uniqueCompaniesMap = new Map();
  deals.forEach(deal => {
    if (deal.company && !uniqueCompaniesMap.has(deal.company)) {
      uniqueCompaniesMap.set(deal.company, deal);
    }
  });
  const companies = Array.from(uniqueCompaniesMap.values());

  if (companies.length === 0) {
    return (
      <div className="clean-card p-12 text-center flex flex-col items-center justify-center max-w-[1400px] mx-auto">
        <Building2 className="w-16 h-16 text-slate-400 mb-4" />
        <h2 className="text-[24px] font-bold text-slate-900">No Companies Found</h2>
        <p className="text-slate-500 mt-2 text-[15px]">There are currently no companies available in the intelligence database.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">
          Companies
        </h1>
        <button 
          onClick={() => { setSaveError(null); setNewCompanyName(''); setIsAddModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((deal) => (
          <div 
            key={deal.company} 
            className="clean-card p-6 cursor-pointer group relative bg-white"
            onClick={() => navigate(`/deals/${deal._id}`)}
          >
            <button 
              onClick={(e) => openEditModal(e, deal.company)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-brand-700 bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20"
              title="Edit Company"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-5 pr-10">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shrink-0 group-hover:border-brand-300 group-hover:bg-brand-50 transition-colors">
                <Building2 className="w-6 h-6 text-brand-700" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-[18px] text-slate-900 truncate group-hover:text-brand-700 transition-colors" title={deal.company}>{deal.company}</h3>
                <p className="text-[14px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                  <Activity size={14} className="text-brand-600" /> Active: {deal.name}
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 text-[14px] text-slate-600">
                <div className="p-1.5 bg-slate-50 rounded-md border border-slate-100"><Globe className="w-4 h-4 text-slate-400" /></div>
                <span className="truncate font-mono text-[13px]">www.{deal.company.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div className="flex items-center gap-3 text-[14px] text-slate-600">
                <div className="p-1.5 bg-slate-50 rounded-md border border-slate-100"><MapPin className="w-4 h-4 text-slate-400" /></div>
                <span className="truncate">Global HQ</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Edit Company Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-[18px] text-slate-900 flex items-center gap-2">
                <Building2 className="text-brand-700 w-5 h-5" /> Edit Company Profile
              </h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {saveError}
                </div>
              )}
              
              <div>
                <label className="block text-[14px] font-semibold text-slate-700 mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                  placeholder="Enter company name"
                  autoFocus
                />
                <p className="text-[13px] text-slate-500 mt-2 font-medium flex items-start gap-1.5 leading-snug">
                  <Activity size={14} className="text-brand-600 shrink-0 mt-0.5"/> Updates intelligence mappings across all deals and memory records.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={closeEditModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving || !companyName.trim() || companyName === editingCompany}
                  className="btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Premium Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-[18px] text-slate-900 flex items-center gap-2">
                <Building2 className="text-brand-700 w-5 h-5" /> Add New Company
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddCompany} className="p-6 space-y-6">
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {saveError}
                </div>
              )}
              
              <div>
                <label className="block text-[14px] font-semibold text-slate-700 mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                  placeholder="Enter new company name"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving || !newCompanyName.trim()}
                  className="btn-primary"
                >
                  {isSaving ? 'Adding...' : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
