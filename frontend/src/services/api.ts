import axios from 'axios';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables sending and receiving httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('voltfix_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401s and attempt automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshRes.data?.data?.accessToken) {
          const newToken = refreshRes.data.data.accessToken;
          localStorage.setItem('voltfix_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh failed: clear local storage and broadcast logout
        localStorage.removeItem('voltfix_token');
        localStorage.removeItem('voltfix_user');
        window.dispatchEvent(new Event('voltfix_auth_logout'));
      }
    }

    return Promise.reject(error);
  }
);
