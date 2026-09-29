import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX, LayoutDashboard, Briefcase } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-12 h-12 text-slate-400" />
      </div>
      
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">
        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-colors"
        >
          <LayoutDashboard className="w-5 h-5" />
          Back to Dashboard
        </button>
        <button 
          onClick={() => navigate('/deals')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Briefcase className="w-5 h-5" />
          Go to Deals
        </button>
      </div>
    </div>
  );
}
