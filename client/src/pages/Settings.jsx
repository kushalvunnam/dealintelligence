import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Server, Shield, Bell, Database } from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    // Check if backend is reachable
    api.get('/deals')
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-brand-100 rounded-lg text-brand-600">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Application Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <User className="text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">Account Profile</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" disabled value="Alex Rep" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" disabled value="alex@dealmind.ai" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <input type="text" disabled value="Sales Representative" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <Bell className="text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Deal Updates</p>
                  <p className="text-sm text-slate-500">Receive alerts when a deal stage changes.</p>
                </div>
                <div className="w-11 h-6 bg-brand-500 rounded-full relative cursor-not-allowed opacity-80">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">AI Intelligence Digests</p>
                  <p className="text-sm text-slate-500">Weekly summaries of deal patterns.</p>
                </div>
                <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-not-allowed opacity-80">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <Server className="text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">System Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Backend Connection</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : apiStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="font-medium text-slate-900 capitalize">{apiStatus}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Hindsight Memory AI</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className="font-medium text-slate-900">{apiStatus === 'connected' ? 'Online' : 'Waiting'}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Groq Inference Engine</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className="font-medium text-slate-900">{apiStatus === 'connected' ? 'Online' : 'Waiting'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <Shield className="text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">Your connection is secure and your data is encrypted.</p>
              <button disabled className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium cursor-not-allowed">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
