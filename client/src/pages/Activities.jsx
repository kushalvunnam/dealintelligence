import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMemories } from '../services/api';
import { Activity, Calendar, Building2, ExternalLink } from 'lucide-react';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllMemories().then(data => {
      setActivities(data);
    }).catch(err => {
      console.error(err);
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Loading activities...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!Array.isArray(activities)) return <div className="p-8 text-red-600">Error: Unable to connect to the backend API.</div>;

  if (activities.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Recent Activities</h1>
        <div className="p-12 glass-panel rounded-xl shadow-glass border border-white/10 text-center">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300">No activities found</h2>
          <p className="text-slate-400 mt-2">There are currently no interactions or activities logged in the database.</p>
        </div>
      </div>
    );
  }

  // Sort activities by date descending
  const sortedActivities = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Recent Activities</h1>
      </div>

      <div className="glass-panel rounded-xl shadow-glass border border-white/10 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {sortedActivities.map((activity, index) => (
            <div key={activity._id || index} className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Activity className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white capitalize">
                        {activity.type || 'Interaction'}
                      </span>
                      {activity.dealId && (
                        <span className="text-sm font-medium px-2 py-1 bg-white/10 text-slate-400 rounded-md flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {activity.dealId.company}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 mt-2 line-clamp-2">
                      {activity.content}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
                {activity.dealId && (
                  <button 
                    onClick={() => navigate(`/deals/${activity.dealId._id}`)}
                    className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-500/20 rounded-lg transition-colors"
                    title="View Deal"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

