import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Deals from './pages/Deals';
import DealDetails from './pages/DealDetails';
import Memory from './pages/Memory';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import MemoryImpact from './pages/MemoryImpact';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="deals" element={<Deals />} />
          <Route path="deals/:id" element={<DealDetails />} />
          <Route path="impact" element={<MemoryImpact />} />
          <Route path="memory" element={<Memory />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<div className="p-4">Page not found or under construction.</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
