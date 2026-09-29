import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeals } from '../services/api';
import { Users, Mail, Phone, Building2 } from 'lucide-react';

export default function Contacts() {
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

  if (loading) return <div className="p-8 text-slate-500">Loading contacts...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!Array.isArray(deals)) return <div className="p-8 text-red-600">Error: Unable to connect to the backend API.</div>;

  // Since contacts aren't an explicit endpoint, we will mock them based on the deals
  // or return an empty state if we strictly don't want to fake data. 
  // The prompt says "Do NOT fake contact records", so we will show a useful empty state, 
  // or extract real ones if the deal schema ever supports it. Currently the Deal schema does not have contact array.
  
  // Actually, we'll just show an empty state to be safe and adhere to "Do not fake contact records".
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
      </div>
      
      <div className="p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-700">No contacts available yet</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Contact synchronization is not currently configured for this workspace. 
          Future updates will integrate directly with your CRM's contact directory.
        </p>
      </div>
    </div>
  );
}
