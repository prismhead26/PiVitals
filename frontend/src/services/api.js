/**
 * API service for PiVitals
 * Handles all HTTP requests to the backend
 */
import axios from 'axios';

// Determine base URL based on environment
const getBaseURL = () => {
  // In development, Vite proxy handles /api requests
  // In production, API is served from same origin or specified backend
  if (import.meta.env.DEV) {
    return '';  // Vite proxy will handle /api routes
  }
  // In production, set this via environment variable or use same origin
  return import.meta.env.VITE_API_URL || '';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API methods
export const metricsAPI = {
  /**
   * Get all metrics in a single call
   */
  getAllMetrics: () => api.get('/api/v1/metrics/all'),

  /**
   * Get CPU metrics
   */
  getCPUMetrics: () => api.get('/api/v1/metrics/cpu'),

  /**
   * Get memory metrics
   */
  getMemoryMetrics: () => api.get('/api/v1/metrics/memory'),

  /**
   * Get disk metrics
   */
  getDiskMetrics: () => api.get('/api/v1/metrics/disk'),

  /**
   * Get network metrics
   */
  getNetworkMetrics: () => api.get('/api/v1/metrics/network'),

  /**
   * Health check
   */
  getHealth: () => api.get('/api/v1/health'),
};

// System API methods
export const systemAPI = {
  /**
   * Get overview for processes, services, and security
   */
  getOverview: () => api.get('/api/v1/system/overview'),

  /**
   * Get process metrics
   */
  getProcesses: () => api.get('/api/v1/system/processes'),

  /**
   * Get service metrics
   */
  getServices: () => api.get('/api/v1/system/services'),

  /**
   * Get security metrics
   */
  getSecurity: () => api.get('/api/v1/system/security'),
};

export default api;
