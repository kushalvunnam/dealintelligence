import React, { useEffect, useState } from 'react';
import { getDeals, getAllMemories } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Analytics() {
  const [deals, setDeals] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDeals(), getAllMemories()])
      .then(([d, m]) => {
        setDeals(d);
        setMemories(m);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  if (!Array.isArray(deals) || !Array.isArray(memories)) {
    return <div className="p-8 text-red-600">Error: Unable to connect to the backend API. Please configure VITE_API_BASE_URL.</div>;
  }

  // Process data for Stage Distribution
  const stageData = deals.reduce((acc, deal) => {
    const existing = acc.find(item => item.name === deal.stage);
    if (existing) existing.value += 1;
    else acc.push({ name: deal.stage, value: 1 });
    return acc;
  }, []);

  // Process data for Pipeline Value by Stage
  const pipelineData = deals.reduce((acc, deal) => {
    const existing = acc.find(item => item.name === deal.stage);
    if (existing) existing.value += deal.value;
    else acc.push({ name: deal.stage, value: deal.value });
    return acc;
  }, []);

  // Process data for Objection Categories from Memories
  const memoryTypeData = memories.reduce((acc, mem) => {
    const existing = acc.find(item => item.name === mem.type);
    if (existing) existing.value += 1;
    else acc.push({ name: mem.type, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Analytics & Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stage Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Deal Stage Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intelligence Type Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">AI Intelligence Extracted</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memoryTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {memoryTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Value by Stage */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pipeline Value by Stage (₹)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
