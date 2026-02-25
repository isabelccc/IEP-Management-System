import api from './apiClient.js';

const BASE = '/api/assistant';

export function sendChatMessage(message, context = {}) {
  return api.post(`${BASE}/chat`, { message, context });
}

export function generatePresentLevels(payload) {
  return api.post(`${BASE}/present-levels`, payload);
}

export function generateGoals(payload) {
  return api.post(`${BASE}/goals/generate`, payload);
}

export function analyzeGoal(payload) {
  return api.post(`${BASE}/goals/analyze`, payload);
}

export function suggestAccommodations(payload) {
  return api.post(`${BASE}/accommodations/suggest`, payload);
}
