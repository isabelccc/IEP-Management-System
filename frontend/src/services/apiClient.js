import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  // 🔐 Request interceptor
  api.interceptors.request.use(
    (config) => {
      // get token from localStorage
      const token = localStorage.getItem("token");
  
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
  
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  export default api;