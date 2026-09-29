import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Brain, BrainCircuit, BarChart3, Building2, Users, Activity, Settings, X } from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const [profile, setProfile] = useState({
    name: 'Alex Rep',
    email: 'alex@dealmind.ai'
  });

  useEffect(() => {
    const loadProfile = () => {
      const saved = localStorage.getItem('dealmind_profile');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    };
    
    // Initial load
    loadProfile();

    // Listen for updates from Settings page
    window.addEventListener('profileUpdated', loadProfile);
    return () => window.removeEventListener('profileUpdated', loadProfile);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Learning Demo', path: '/impact', icon: BrainCircuit },
    { name: 'Deals', path: '/deals', icon: Briefcase },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Activities', path: '/activities', icon: Activity },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Brain },
    { name: 'Memory', path: '/memory', icon: BrainCircuit },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 w-64 glass-panel border-y-0 border-l-0 rounded-none z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <div className="relative">
              <BrainCircuit className="text-brand-400 relative z-10 animate-pulse-slow" />
              <div className="absolute inset-0 bg-brand-500 blur-md opacity-50 z-0"></div>
            </div>
            DealMind
          </h1>
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive 
                  ? 'text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] bg-gradient-to-r from-brand-500/20 to-transparent border border-brand-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Subtle active glow line */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-brand-400 rounded-r-full shadow-[0_0_10px_rgba(45,212,191,0.8)]"></div>
                  )}
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="font-medium tracking-wide text-sm">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 m-4 rounded-xl bg-navy-900/50 border border-white/5 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-sm font-bold uppercase text-navy-900 shadow-neon">
              {profile.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-slate-200" title={profile.name}>{profile.name}</p>
              <p className="text-xs text-brand-300/80 truncate font-mono" title={profile.email}>{profile.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
