import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
  timeout: 15000 // Default 15 second timeout for standard requests
});

// Detect if Vercel returned the index.html fallback instead of an actual API response
api.interceptors.response.use((response) => {
  if (typeof response.data === 'string' && response.data.trim().startsWith('<!doctype html>')) {
    throw new Error('API not configured. The frontend is receiving HTML instead of JSON data. Please configure VITE_API_BASE_URL.');
  }
  return response;
});

// Simple module-level cache to prevent duplicate requests on navigation
const cache = {
  deals: { data: null, timestamp: 0 },
  memories: { data: null, timestamp: 0 }
};
const CACHE_TTL = 30000; // 30 seconds

export const getDeals = async () => {
  if (cache.deals.data && Date.now() - cache.deals.timestamp < CACHE_TTL) {
    return cache.deals.data;
  }
  const response = await api.get('/deals');
  cache.deals = { data: response.data, timestamp: Date.now() };
  return response.data;
};

export const createDeal = async (dealData) => {
  const response = await api.post('/deals', dealData);
  // Invalidate deals cache
  cache.deals.timestamp = 0;
  return response.data;
};

export const getDealById = async (id) => {
  const response = await api.get(`/deals/${id}`);
  return response.data;
};

export const getDealActivities = async (id) => {
  const response = await api.get(`/deals/${id}/activities`);
  return response.data;
};

export const getDealMemories = async (id) => {
  const response = await api.get(`/deals/${id}/memories`);
  return response.data;
};

export const getAllMemories = async () => {
  if (cache.memories.data && Date.now() - cache.memories.timestamp < CACHE_TTL) {
    return cache.memories.data;
  }
  const response = await api.get('/memories');
  cache.memories = { data: response.data, timestamp: Date.now() };
  return response.data;
};

// AI Endpoints require longer timeouts (60 seconds) due to LLM generation time
const aiConfig = { timeout: 60000 };

export const prepareMeeting = async (dealId) => {
  const response = await api.post('/ai/prepare-meeting', { dealId }, aiConfig);
  return response.data;
};

export const chatWithAI = async (dealId, message) => {
  const response = await api.post('/ai/chat', { dealId, message }, aiConfig);
  return response.data;
};

export const analyzeObjections = async (dealId) => {
  const response = await api.post('/ai/analyze-objections', { dealId }, aiConfig);
  return response.data;
};

export const analyzeCompetitors = async (dealId) => {
  const response = await api.post('/ai/analyze-competitors', { dealId }, aiConfig);
  return response.data;
};

export const generateNextActions = async (dealId) => {
  const response = await api.post('/ai/next-actions', { dealId }, aiConfig);
  return response.data;
};

export const detectPatterns = async (dealId) => {
  const response = await api.post('/ai/patterns', { dealId }, aiConfig);
  return response.data;
};

export const prepareMeetingCompare = async (dealId) => {
  const response = await api.post('/ai/prepare-meeting-compare', { dealId }, aiConfig);
  return response.data;
};

// Contact API
export const getContacts = async () => {
  const response = await api.get('/contacts');
  return response.data;
};

export const getContactById = async (id) => {
  const response = await api.get(`/contacts/${id}`);
  return response.data;
};

export const createContact = async (contactData) => {
  const response = await api.post('/contacts', contactData);
  return response.data;
};

export const updateContact = async (id, contactData) => {
  const response = await api.put(`/contacts/${id}`, contactData);
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

// Company API
export const updateCompany = async (oldName, companyData) => {
  const response = await api.put(`/companies/${encodeURIComponent(oldName)}`, companyData);
  return response.data;
};

export default api;
