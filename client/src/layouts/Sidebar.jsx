import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Brain, BrainCircuit, BarChart3, Building2, Users, Activity, Settings, X } from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const [profile, setProfile] = useState({
    name: 'Kushal Chowdarry',
    email: 'kushal@dealmind.ai'
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
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-[#0F172A] flex flex-col z-50 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-slate-800 shadow-xl md:shadow-none`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <BrainCircuit className="text-brand-500 w-7 h-7" />
            DealMind
          </h1>
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 h-[44px] rounded-lg transition-colors group relative font-medium text-[15px] ${
                  isActive 
                  ? 'text-white bg-[#0F766E]' 
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#1E293B]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Left Border */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#14B8A6] rounded-l-lg"></div>
                  )}
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'}`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        {/* Profile Section */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A]">
          <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-brand-700 flex items-center justify-center text-sm font-bold uppercase text-white shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate" title={profile.name}>{profile.name}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5" title={profile.email}>{profile.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
