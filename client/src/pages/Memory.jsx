import React, { useEffect, useState } from 'react';
import { getAllMemories, getDeals } from '../services/api';
import { BrainCircuit, Link, Sparkles, Search, Filter, X, CheckCircle2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Memory() {
  const [memories, setMemories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedDealFilter, setSelectedDealFilter] = useState('All Deals');
  const [selectedMemory, setSelectedMemory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAllMemories(), getDeals()]).then(([memoriesData, dealsData]) => {
      setMemories(memoriesData);
      setDeals(dealsData);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const getTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'objection': return 'bg-red-100 text-red-800 border-red-200';
      case 'competitor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pricing': return 'bg-green-100 text-green-800 border-green-200';
      case 'stakeholder': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const filteredMemories = memories.filter(m => {
    const matchesSearch = (m.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (m.dealId?.company?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || m.type === filterType;
    const matchesDeal = selectedDealFilter === 'All Deals' || m.dealId?.company === selectedDealFilter;
    return matchesSearch && matchesType && matchesDeal;
  });

  const filterOptions = ['All', 'Meetings', 'Objection', 'Competitor', 'Pricing', 'Stakeholder'];
  const uniqueCompanies = ['All Deals', ...new Set(deals.map(d => d.company).filter(Boolean))];

  if (loading) return <div className="p-8 text-slate-500">Loading memory banks...</div>;

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-100 text-brand-600 rounded-xl">
          <BrainCircuit size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Deal Memory</h1>
          <p className="text-slate-500 mt-1">Persistent intelligence extracted from all interactions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Memories</p>
          <p className="text-3xl font-bold text-slate-900">{memories.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Deals Tracked</p>
          <p className="text-3xl font-bold text-slate-900">{new Set(memories.map(m => m.dealId?._id)).size}</p>
        </div>
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-6 rounded-xl shadow-sm text-white flex flex-col justify-center">
          <p className="font-medium mb-1 flex items-center gap-2"><Sparkles size={16}/> AI Learning Status</p>
          <p className="text-sm opacity-90">Continuously extracting objections, pricing sensitivity, and competitor mentions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        
        {/* Filter and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Deal Filter Dropdown */}
            <div className="relative mr-2">
              <select 
                value={selectedDealFilter}
                onChange={(e) => setSelectedDealFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                {uniqueCompanies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            {filterOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setFilterType(opt)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${filterType === opt ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {filteredMemories.length === 0 && (
            <div className="text-center text-slate-500 py-12 relative z-10 bg-white">
              No memories match your search criteria.
            </div>
          )}
          
          {filteredMemories.map((memory, idx) => (
            <div key={memory._id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <BrainCircuit size={16} />
              </div>
              
              {/* Card */}
              <div 
                onClick={() => setSelectedMemory(memory)}
                className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-brand-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md border ${getTypeColor(memory.type)}`}>
                    {memory.type}
                  </span>
                  <time className="text-xs font-medium text-slate-500">
                    {new Date(memory.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </time>
                </div>
                <div className="mb-2 text-sm font-bold text-slate-800">
                  {memory.dealId?.company || 'Unknown Company'}
                </div>
                <div className="text-slate-600 text-sm italic">
                  "{memory.content}"
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-brand-600 font-medium">
                  <Sparkles size={12}/> AI Insight Generated
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Detail Panel (Modal) */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BrainCircuit className="text-brand-500" size={18}/> Memory Detail
              </h3>
              <button onClick={() => setSelectedMemory(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deal</p>
                  <p className="font-bold text-slate-900 cursor-pointer hover:text-brand-600 hover:underline flex items-center gap-1" onClick={() => navigate(`/deals/${selectedMemory.dealId?._id}`)}>
                    {selectedMemory.dealId?.company} <Link size={14}/>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-medium text-slate-700">{new Date(selectedMemory.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stored Context</p>
                <div className={`p-4 rounded-lg border ${getTypeColor(selectedMemory.type)}`}>
                  <p className="font-medium">"{selectedMemory.content}"</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">How it was used by AI</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500"/> 
                    Meeting preparation & intelligence briefings
                  </div>
                  {(selectedMemory.type === 'Objection' || selectedMemory.type === 'Pricing') && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500"/> 
                      Objection handling analysis
                    </div>
                  )}
                  {selectedMemory.type === 'Competitor' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500"/> 
                      Competitor differentiation strategy
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500"/> 
                    Next-action recommendations
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
