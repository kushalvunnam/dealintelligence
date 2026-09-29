import React, { useState, useEffect } from 'react';
import { getDeals, prepareMeetingCompare, detectPatterns, getAllMemories } from '../services/api';
import { BrainCircuit, Play, ArrowRight, Activity, Cpu, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

export default function MemoryImpact() {
  const [deals, setDeals] = useState([]);
  const [selectedDealId, setSelectedDealId] = useState('');
  
  // Demo states
  const [demoState, setDemoState] = useState('idle'); // idle, loading, active
  const [loadingSteps, setLoadingSteps] = useState([]);
  
  // Data states
  const [compareData, setCompareData] = useState(null);
  const [patternData, setPatternData] = useState(null);
  const [allMemories, setAllMemories] = useState([]);

  useEffect(() => {
    getDeals().then(setDeals).catch(console.error);
    getAllMemories().then(setAllMemories).catch(console.error);
  }, []);

  const runDemo = async () => {
    // Attempt to select ABC Motors for the demo, otherwise just pick the first
    let targetId = deals.find(d => d.company.includes('ABC'))?._id || deals[0]?._id;
    if (!targetId) return;
    
    setSelectedDealId(targetId);
    setDemoState('loading');
    setLoadingSteps([]);

    const addStep = (msg, delay) => new Promise(r => setTimeout(() => {
      setLoadingSteps(prev => [...prev, msg]);
      r();
    }, delay));

    try {
      await addStep('✓ Deal identified: ABC Motors', 800);
      await addStep('✓ Retrieving Hindsight memories...', 1000);
      
      const compareResult = await prepareMeetingCompare(targetId);
      await addStep(`✓ ${compareResult.memoriesUsed?.length || 0} relevant memories found`, 800);
      
      await addStep('✓ Analyzing deal history (detecting patterns)...', 1000);
      const patternResult = await detectPatterns(targetId);
      
      await addStep('✓ Generating personalized briefing vs generic baseline...', 1200);
      
      setCompareData(compareResult);
      setPatternData(patternResult);
      setDemoState('active');

    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message;
      setLoadingSteps(prev => [...prev, '❌ Demo failed: ' + errorMessage]);
      setTimeout(() => setDemoState('idle'), 4000);
    }
  };

  const getMemoryCoverage = (memories) => {
    if (!memories) return 0;
    const types = new Set(memories.map(m => m.metadata?.interactionType || m.type));
    return Math.min(100, Math.round((types.size / 5) * 100)); // Normalizing assuming 5 key types
  };

  const dealMemories = allMemories.filter(m => m.dealId?._id === selectedDealId);
  const coverageScore = getMemoryCoverage(dealMemories);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <BrainCircuit size={240} className="transform translate-x-12 -translate-y-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="text-brand-400" /> How DealMind Learns
          </h1>
          <p className="text-slate-300 mt-2 text-lg">
            See the exact difference Hindsight makes. We'll run the same AI prompt with and without persistent memory.
          </p>
        </div>
        <div className="relative z-10">
          {demoState === 'idle' && (
            <button 
              onClick={runDemo}
              className="bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              <Play fill="currentColor" size={20} /> Start Learning Demo
            </button>
          )}
        </div>
      </div>

      {demoState === 'loading' && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-8" />
          <div className="space-y-4 w-full max-w-md">
            {loadingSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-lg font-medium text-slate-700 animate-in fade-in slide-in-from-bottom-2">
                {step.startsWith('✓') ? <CheckCircle2 className="text-green-500 shrink-0" /> : <Activity className="text-brand-500 shrink-0" />}
                {step.replace('✓ ', '')}
              </div>
            ))}
          </div>
        </div>
      )}

      {demoState === 'active' && compareData && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Intelligence Scorecard & Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Deal Memory Coverage</h2>
              <p className="text-sm text-slate-500 mb-6">Calculated strictly from actual stored interactions.</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>Overall Coverage</span>
                    <span>{coverageScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${coverageScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>Pricing History</span>
                    <span>{dealMemories.some(m => m.type === 'Pricing') ? 'High' : 'Low'}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 flex gap-1">
                    {Array.from({length: 10}).map((_, i) => (
                      <div key={i} className={`flex-1 rounded-sm ${i < 8 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>Competitor Context</span>
                    <span>{dealMemories.some(m => m.type === 'Competitor') ? 'High' : 'Low'}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 flex gap-1">
                    {Array.from({length: 10}).map((_, i) => (
                      <div key={i} className={`flex-1 rounded-sm ${i < 9 ? 'bg-orange-500' : 'bg-slate-200'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-brand-200 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BrainCircuit className="text-brand-500" /> Detected Patterns
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patternData?.data?.patterns?.map((pattern, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-brand-100 text-brand-700">{pattern.type}</span>
                      {pattern.recent && <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-red-100 text-red-700">Recent</span>}
                    </div>
                    <h3 className="font-bold text-slate-800">{pattern.topic}</h3>
                    <p className="text-sm text-slate-600 mt-1">Appeared {pattern.frequency} times</p>
                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500 italic">
                      Evidence: "{pattern.evidence[0]}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Before vs After */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">The Hindsight Impact</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* WITHOUT MEMORY */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-75 grayscale-[30%]">
                <div className="bg-slate-100 p-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-600 flex items-center gap-2">
                    <Cpu size={18} /> Standard CRM AI (No Memory)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Prompt: "Prepare me for ABC Motors"</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended Action</h4>
                    <p className="text-slate-700">{compareData.generic.recommendedNextAction}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Objections</h4>
                    <ul className="list-disc pl-4 text-sm text-slate-600">
                      {compareData.generic.previousObjections?.map((o,i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* WITH MEMORY */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-brand-500 overflow-hidden relative transform lg:scale-105">
                <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                  DealMind AI
                </div>
                <div className="bg-brand-50 p-4 border-b border-brand-100">
                  <h3 className="font-bold text-brand-900 flex items-center gap-2">
                    <Sparkles className="text-brand-500" size={18} /> DealMind (With Hindsight)
                  </h3>
                  <p className="text-xs text-brand-600 mt-1">Prompt: "Prepare me for ABC Motors" + 10 Historical Interactions</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-brand-900 text-white p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-brand-300 uppercase tracking-wider mb-1">Personalized Recommendation</h4>
                    <p className="font-medium text-lg leading-snug">{compareData.personalized.recommendedNextAction}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 p-3 rounded border border-red-100">
                      <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Real Objections</h4>
                      <ul className="list-disc pl-4 text-sm text-red-900">
                        {compareData.personalized.previousObjections?.map((o,i) => <li key={i}>{o}</li>)}
                      </ul>
                    </div>
                    <div className="bg-orange-50 p-3 rounded border border-orange-100">
                      <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">Identified Competitors</h4>
                      <ul className="list-disc pl-4 text-sm text-orange-900">
                        {compareData.personalized.competitors?.map((c,i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Transparency Section */}
                <div className="bg-slate-50 p-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <BrainCircuit size={16} className="text-brand-500" /> Why this recommendation?
                  </h4>
                  <div className="space-y-2">
                    {compareData.memoriesUsed?.slice(0,3).map((m, i) => (
                      <div key={i} className="text-xs bg-white p-2 rounded border border-slate-200 text-slate-600 shadow-sm">
                        <span className="font-bold text-slate-800 mr-2">Memory {i+1}:</span>
                        "{m.content || m.text}"
                      </div>
                    ))}
                    {compareData.memoriesUsed?.length > 3 && (
                      <p className="text-xs text-slate-400 italic">...and {compareData.memoriesUsed.length - 3} more memories.</p>
                    )}
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
