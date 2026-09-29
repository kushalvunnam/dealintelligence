import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeals, updateCompany } from '../services/api';
import { Building2, MapPin, Globe, Edit2, X } from 'lucide-react';

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
      // Refresh list
      fetchDeals();
      closeEditModal();
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to update company');
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((deal) => (
          <div 
            key={deal.company} 
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer relative group"
            onClick={() => navigate(`/deals/${deal._id}`)}
          >
            <button 
              onClick={(e) => openEditModal(e, deal.company)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Edit Company"
            >
              <Edit2 className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4 pr-10">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-brand-500" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-lg text-slate-900 truncate" title={deal.company}>{deal.company}</h3>
                <p className="text-sm text-slate-500 truncate">Active Deal: {deal.name}</p>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">www.{deal.company.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Headquarters</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Company Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Building2 className="text-brand-500 w-5 h-5" /> Edit Company
              </h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {saveError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  {saveError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name *</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-slate-900"
                  placeholder="Enter company name"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2">
                  Note: Updating the company name will automatically update all associated deals and contacts to preserve data relationships.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving || !companyName.trim() || companyName === editingCompany}
                  className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
