import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDealById, getDealActivities, prepareMeeting, analyzeObjections, analyzeCompetitors, generateNextActions } from '../services/api';
import { BrainCircuit, Loader2, Sparkles, AlertCircle, TrendingDown, Target, Zap, Clock, ShieldAlert } from 'lucide-react';

export default function DealDetails() {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // AI States
  const [aiData, setAiData] = useState(null);
  const [aiView, setAiView] = useState(''); // 'meeting', 'objections', 'competitors', 'actions'
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingText, setAiLoadingText] = useState('');

  useEffect(() => {
    Promise.all([getDealById(id), getDealActivities(id)])
      .then(([dealData, activitiesData]) => {
        setDeal(dealData);
        setActivities(activitiesData);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  const handleAiAction = async (actionFn, viewName) => {
    setAiLoading(true);
    setAiData(null);
    setAiView(viewName);
    setAiLoadingText('Retrieving memories from Hindsight...');
    
    try {
      // Simulate multi-step loading for UX
      setTimeout(() => setAiLoadingText('Analyzing historical context...'), 1200);
      
      const response = await actionFn(id);
      
      if (response && response.memoriesUsed) {
        setAiLoadingText(`Synthesizing ${response.memoriesUsed.length} relevant memories...`);
        setTimeout(() => {
          setAiData(response);
          setAiLoading(false);
        }, 800);
      } else {
        setAiData(response);
        setAiLoading(false);
      }
    } catch (err) {
      console.error(err);
      setAiLoading(false);
      setAiData({ error: err.message || 'Failed to generate AI intelligence' });
    }
  };

  const [showMemories, setShowMemories] = useState(false);

  if (loading) return <div className="p-8 text-slate-500 flex items-center gap-2"><Loader2 className="animate-spin"/> Loading deal details...</div>;
  if (!deal) return <div className="p-8">Deal not found.</div>;

  const renderMemorySources = (memories) => {
    if (!memories || memories.length === 0) return null;
    return (
      <div className="mt-8 border-t border-slate-200 pt-6">
        <button 
          onClick={() => setShowMemories(!showMemories)}
          className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 hover:text-brand-400 transition-colors"
        >
          <BrainCircuit className="text-brand-500 w-4 h-4" />
          Why this recommendation? {showMemories ? '(Hide)' : '(Show)'}
        </button>
        
        {showMemories && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {memories.map((m, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-700 capitalize">{m.metadata?.interactionType || 'Memory'}</span>
                  <span className="text-slate-500 text-xs">• {new Date(m.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-500">"{m.content || m.text}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAiContent = () => {
    if (aiLoading) {
      return (
        <div className="p-12 flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <p className="font-medium animate-pulse">{aiLoadingText}</p>
        </div>
      );
    }

    if (!aiData) return (
      <div className="p-12 text-center text-slate-500 min-h-[300px] flex flex-col items-center justify-center">
        <Sparkles className="w-12 h-12 text-slate-700 mb-4" />
        <p>Select an action above to generate Deal Intelligence using Hindsight memory.</p>
        {activities.length === 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg max-w-md text-orange-800 text-sm">
            <p className="font-bold mb-1">DealMind hasn't learned enough about this deal yet.</p>
            <p>Add a meeting or interaction to start building deal memory.</p>
          </div>
        )}
      </div>
    );

    if (aiData.error) return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold">Error generating intelligence</p>
          <p className="text-sm mt-1">{aiData.error}</p>
        </div>
      </div>
    );

    const { data, memoriesUsed } = aiData;

    return (
      <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-6 pb-4 border-b border-slate-200 flex justify-between items-end">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Deal Data</p>
            <h3 className="text-xl font-bold text-slate-900">{deal.company} • {deal.stage}</h3>
          </div>
          <span className="px-3 py-1 bg-brand-100 text-brand-800 text-xs font-bold rounded-full border border-brand-500/30 shadow-sm flex items-center gap-1">
            <BrainCircuit size={12}/> AI Generated
          </span>
        </div>

        {/* VIEW: MEETING */}
        {aiView === 'meeting' && data && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 text-brand-400">Deal Summary</h4>
              <p className="text-slate-700 leading-relaxed">{data.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="clean-card p-5 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target size={16} className="text-blue-500"/> Customer Priorities
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                  {data.customerPriorities?.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div className="clean-card p-5 rounded-lg border border-red-100 shadow-sm">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500"/> Previous Objections
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                  {data.previousObjections?.map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>
            </div>

            <div className="bg-brand-900 p-6 rounded-lg shadow-sm text-slate-900 border border-brand-800">
              <h4 className="font-bold text-brand-200 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap size={16}/> Recommended Next Action
              </h4>
              <p className="font-medium text-lg leading-relaxed">{data.recommendedNextAction}</p>
            </div>
            
            <div className="clean-card p-5 rounded-lg border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Talking Points</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                {data.talkingPoints?.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* VIEW: OBJECTIONS */}
        {aiView === 'objections' && data && (
          <div className="space-y-6">
            <div className="bg-red-50 p-5 rounded-lg border border-red-200">
              <h4 className="font-bold text-red-900 text-sm mb-2">Objection Analysis</h4>
              <p className="text-red-800 text-sm mb-4">{data.frequency}</p>
              <div className="space-y-2">
                {data.previousObjections?.map((obj, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <AlertCircle className="text-red-500 w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-red-900 text-sm">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="clean-card p-5 rounded-lg border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 text-brand-400">Response Strategy</h4>
              <p className="text-slate-700 leading-relaxed text-sm">{data.possibleResponseStrategy}</p>
            </div>
          </div>
        )}

        {/* VIEW: COMPETITORS */}
        {aiView === 'competitors' && data && (
          <div className="space-y-4">
            {data.competitors?.length > 0 ? data.competitors.map((comp, idx) => (
              <div key={idx} className="clean-card p-5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <TrendingDown className="text-orange-500" size={18}/> {comp.name}
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium ml-2">{comp.mentions} mentions</span>
                </h4>
                <p className="text-sm text-slate-500 mt-2"><span className="font-semibold text-slate-700">Context:</span> {comp.context}</p>
                <p className="text-sm text-slate-500 mt-1"><span className="font-semibold text-slate-700">Concern:</span> {comp.customerConcern}</p>
                <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-md">
                  <p className="text-sm font-semibold text-brand-300 mb-1">Suggested Positioning</p>
                  <p className="text-sm text-slate-700">{comp.suggestedResponse}</p>
                </div>
              </div>
            )) : <p className="text-slate-500">No competitors identified in the memory banks.</p>}
          </div>
        )}

        {/* VIEW: ACTIONS */}
        {aiView === 'actions' && data && (
          <div className="space-y-4">
            {data.nextActions?.map((action, idx) => (
              <div key={idx} className="clean-card p-5 rounded-lg border border-brand-500/30 shadow-sm flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-400 flex items-center justify-center shrink-0 font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{action.action}</h4>
                  <p className="text-sm text-slate-500">{action.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {renderMemorySources(memoriesUsed)}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button onClick={() => window.history.back()} className="text-slate-500 hover:text-brand-400 font-medium text-sm mb-4 flex items-center gap-1 transition-colors">
          ← Back to Deals
        </button>
        <h1 className="text-3xl font-bold text-slate-900">{deal.company}</h1>
        <p className="text-xl text-slate-500 mt-1">{deal.name} • ₹{deal.value.toLocaleString('en-IN')}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: AI Interface */}
        <div className="xl:col-span-2 space-y-6">
          <div className="clean-card rounded-xl shadow-sm border border-brand-500/30 overflow-hidden flex flex-col min-h-[600px]">
            
            {/* AI Control Panel */}
            <div className="bg-brand-50 p-6 border-b border-brand-100">
              <h2 className="text-xl font-bold text-brand-900 flex items-center gap-2 mb-4">
                <Sparkles className="text-brand-500" />
                AI Deal Intelligence
              </h2>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleAiAction(prepareMeeting, 'meeting')}
                  disabled={aiLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${aiView === 'meeting' ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-brand-100'} disabled:opacity-50`}
                >
                  Prepare Meeting
                </button>
                <button 
                  onClick={() => handleAiAction(analyzeObjections, 'objections')}
                  disabled={aiLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${aiView === 'objections' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-red-50'} disabled:opacity-50`}
                >
                  Analyze Objections
                </button>
                <button 
                  onClick={() => handleAiAction(analyzeCompetitors, 'competitors')}
                  disabled={aiLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${aiView === 'competitors' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50'} disabled:opacity-50`}
                >
                  Analyze Competitors
                </button>
                <button 
                  onClick={() => handleAiAction(generateNextActions, 'actions')}
                  disabled={aiLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${aiView === 'actions' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-green-50'} disabled:opacity-50`}
                >
                  Suggest Next Actions
                </button>
              </div>
            </div>

            {/* AI Output Area */}
            <div className="flex-1 clean-card relative">
              {renderAiContent()}
            </div>
          </div>
        </div>

        {/* Right Column: Info & Activities */}
        <div className="space-y-6">
          <div className="clean-card rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Deal Overview</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Stage</p>
                <p className="font-medium text-slate-900">{deal.stage}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Probability</p>
                <p className="font-medium text-slate-900">{deal.probability}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Owner</p>
                <p className="font-medium text-slate-900">{deal.owner}</p>
              </div>
            </div>
          </div>

          <div className="clean-card rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock size={18} className="text-slate-500" /> Recent Activities
            </h2>
            <div className="space-y-5">
              {activities.length === 0 ? (
                <p className="text-slate-500 text-sm">No activities recorded yet.</p>
              ) : (
                activities.map(activity => (
                  <div key={activity._id} className="border-l-2 border-brand-500/30 pl-4 relative">
                    <div className="absolute w-2.5 h-2.5 bg-brand-500 rounded-full -left-[5px] top-1.5"></div>
                    <div>
                      <p className="text-xs font-bold text-brand-400 uppercase tracking-wider">{activity.type}</p>
                      <p className="font-medium text-slate-900 text-sm mt-0.5">{activity.summary}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}



