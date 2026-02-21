import api from './apiClient.js';

const baseURL = "/api/auth"
export const login = (email, password) => {
  return api.post(`${baseURL}/login`, { email, password });
};

export const logout = () => {
  return api.post(`${baseURL}/logout`);
};

export const getMe = () => {
  return api.get(`${baseURL}/me`);
};