import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, type ApiErrorPayload, type ApiResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const AUTH_TOKEN_KEY = 'cafe_auth_token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore storage errors in non-browser/restricted environments
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: unwrap success envelope, normalise error envelope, handle 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // If wrapped in success envelope { success: true, message, data }, unwrap data
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      const envelope = response.data as ApiResponse<unknown>;
      return envelope.data as unknown as AxiosResponse;
    }
    return response.data;
  },
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    const url = error.config?.url || '';

    // Handle 401: clear session and redirect, except when authenticating (/auth/login or /auth/register)
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthEndpoint) {
      try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.setItem('auth_message', 'Your session has expired. Please log in again.');
      } catch {
        // Ignore storage errors
      }

      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        const fromPath = encodeURIComponent(
          window.location.pathname + window.location.search + window.location.hash,
        );
        window.location.href = `/login?expired=1&from=${fromPath}`;
      }
    }

    const message = data?.message || error.message || 'An unexpected error occurred';
    const rawErrors = data?.errors || [];

    const normalizedError = new ApiError(status, message, rawErrors);
    return Promise.reject(normalizedError);
  },
);

export default apiClient;
