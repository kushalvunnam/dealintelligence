import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
});

export const getDeals = async () => {
  const response = await api.get('/deals');
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
  const response = await api.get('/memories');
  return response.data;
};

export const prepareMeeting = async (dealId) => {
  const response = await api.post('/ai/prepare-meeting', { dealId });
  return response.data;
};

export const chatWithAI = async (dealId, message) => {
  const response = await api.post('/ai/chat', { dealId, message });
  return response.data;
};

export const analyzeObjections = async (dealId) => {
  const response = await api.post('/ai/analyze-objections', { dealId });
  return response.data;
};

export const analyzeCompetitors = async (dealId) => {
  const response = await api.post('/ai/analyze-competitors', { dealId });
  return response.data;
};

export const generateNextActions = async (dealId) => {
  const response = await api.post('/ai/next-actions', { dealId });
  return response.data;
};

export const detectPatterns = async (dealId) => {
  const response = await api.post('/ai/patterns', { dealId });
  return response.data;
};

export const prepareMeetingCompare = async (dealId) => {
  const response = await api.post('/ai/prepare-meeting-compare', { dealId });
  return response.data;
};

export default api;
