import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const createResearch = (data) => API.post('/research', data);
export const getResearchSessions = (params) => API.get('/research', { params });
export const getResearchSession = (id) => API.get(`/research/${id}`);
export const getResearchStatus = (id) => API.get(`/research/${id}/status`);
export const getResearchSources = (id) => API.get(`/research/${id}/sources`);
export const getResearchReport = (id) => API.get(`/research/${id}/report`);
export const deleteResearchSession = (id) => API.delete(`/research/${id}`);