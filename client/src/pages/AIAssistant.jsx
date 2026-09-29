import React, { useState, useEffect, useRef } from 'react';
import { getDeals, chatWithAI } from '../services/api';
import { Send, BrainCircuit, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';

export default function AIAssistant() {
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getDeals().then(setDeals).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDeal) {
      setMessages([
        { role: 'ai', content: 'Hello! I am DealMind AI. I have connected to Hindsight. Ask me questions about past interactions, objections, or strategy for this deal.', memoriesUsed: [] }
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedDeal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e, text = input) => {
    if (e) e.preventDefault();
    if (!text.trim() || !selectedDeal) return;

    const userMsg = text.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAI(selectedDeal, userMsg);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: response.answer, 
        memoriesUsed: response.memoriesUsed 
      }]);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setMessages(prev => [...prev, { role: 'ai', content: `AI request failed: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    handleSend(null, prompt);
  };

  const suggestedPrompts = [
    "Prepare me for my next meeting.",
    "What objections has this customer raised?",
    "Which competitors are we up against?",
    "What pricing concerns should I expect?",
    "What should I do next?"
  ];

  const renderMemorySources = (memories) => {
    if (!memories || memories.length === 0) return null;
    return (
      <div className="mt-4 border-t border-brand-500/30/50 pt-3">
        <p className="text-xs font-bold text-brand-300 mb-2 flex items-center gap-1 uppercase tracking-wider">
          <BrainCircuit size={12}/> Memory Used
        </p>
        <div className="space-y-2">
          {memories.map((m, i) => (
            <div key={i} className="text-xs bg-brand-500/20 p-2 rounded border border-brand-100 text-brand-900">
              <span className="font-semibold capitalize mr-1">{m.metadata?.interactionType || 'Interaction'}:</span>
              {m.content || m.text}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col glass-panel rounded-xl shadow-glass border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-brand-500" /> DealMind AI
          </h1>
          <p className="text-sm text-slate-400 mt-1">Your deal intelligence assistant</p>
        </div>
        <select 
          className="px-4 py-2 border border-white/20 rounded-lg glass-panel focus:outline-none focus:ring-2 focus:ring-brand-400 min-w-[250px]"
          value={selectedDeal}
          onChange={(e) => setSelectedDeal(e.target.value)}
        >
          <option value="">Select a deal context...</option>
          {deals.map(deal => (
            <option key={deal._id} value={deal._id}>{deal.company} - {deal.name}</option>
          ))}
        </select>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-white/5 relative">
        {!selectedDeal ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-400">Select a deal to begin</p>
            <p className="text-sm mt-2 max-w-md">The AI needs to know which deal's memory bank to query in Hindsight.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {suggestedPrompts.map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-4 py-2 glass-panel border border-white/10 rounded-full text-sm text-brand-300 hover:border-brand-500/50 hover:bg-brand-500/20 transition-colors shadow-glass"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 max-w-4xl ${msg.role === 'ai' ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[0_8px_30px_rgba(20,184,166,0.2)]' : 'bg-brand-500/200 text-white'}`}>
                  {msg.role === 'ai' ? <BrainCircuit size={16} /> : <User size={16} />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'ai' ? 'glass-panel border border-white/10 text-slate-200 shadow-glass' : 'bg-brand-600 text-white shadow-glass'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.role === 'ai' && renderMemorySources(msg.memoriesUsed)}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4 max-w-4xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center shrink-0 shadow-[0_8px_30px_rgba(20,184,166,0.2)]">
                  <BrainCircuit size={16} />
                </div>
                <div className="p-4 rounded-2xl glass-panel border border-white/10 text-slate-400 italic flex items-center gap-2 shadow-glass">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" /> Querying Hindsight memory...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 glass-panel border-t border-white/10">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input 
            type="text" 
            placeholder={selectedDeal ? "Ask DealMind AI..." : "Select a deal above to start chatting"}
            className="w-full pl-4 pr-12 py-3.5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-500 disabled:bg-white/5 disabled:cursor-not-allowed shadow-glass transition-shadow"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!selectedDeal || loading}
          />
          <button 
            type="submit" 
            disabled={!selectedDeal || !input.trim() || loading}
            className="absolute right-2 top-2 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-slate-300 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

