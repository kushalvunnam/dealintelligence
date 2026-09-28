import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Building2, Users, Activity, Brain, BrainCircuit, BarChart3, Settings } from 'lucide-react';

const Sidebar = () => {
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
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BrainCircuit className="text-brand-500" />
          DealMind
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive ? 'bg-brand-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium">Alex Rep</p>
            <p className="text-xs text-slate-400">alex@dealmind.ai</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
