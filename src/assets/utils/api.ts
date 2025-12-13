/* eslint-disable no-underscore-dangle */
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import store from '@/redux/store';
import { clearCurrentUser } from '@/redux/user/user.slice';
import { queryClient } from '@/lib/queryClient';

// ============================================================================
// Types
// ============================================================================

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface QueuedRequest {
  resolve: (value?: string) => void;
  reject: (error?: any) => void;
}

// ============================================================================
// Constants
// ============================================================================

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://tyro-backend.onrender.com/api/v1';

const STORAGE_KEYS = {
  TOKEN: 'tyro.token',
  REFRESH_TOKEN: 'tyro.refreshToken',
  EXPIRE_AT: 'tyro.expireAt',
  TYPE: 'tyro.type',
  ID: 'tyro.id',
} as const;

const PROTECTED_ENDPOINTS = ['/users/tokens', '/users/sign_out'] as const;

// ============================================================================
// Axios Instances
// ============================================================================

/**
 * Separate axios instance for refresh token requests.
 * Bypasses interceptors to prevent infinite loops.
 */
const refreshAxiosInstance = axios.create({ baseURL });

// ============================================================================
// Token Refresh State Management
// ============================================================================

let isRefreshing = false;
const failedQueue: QueuedRequest[] = [];

/**
 * Process queued requests after token refresh completes.
 */
const processQueue = (
  error: any,
  token: string | undefined = undefined,
): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue.length = 0; // Clear array
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get header value from response (case-insensitive).
 */
const getHeader = (headers: Record<string, string>, name: string): string => {
  const lowerName = name.toLowerCase();

  // Try lowercase first (axios normalizes headers to lowercase)
  if (headers[lowerName]) {
    return headers[lowerName];
  }

  // Try original case
  if (headers[name]) {
    return headers[name];
  }

  // Try case-insensitive search
  const headerKey = Object.keys(headers).find(
    (key) => key.toLowerCase() === lowerName,
  );
  return headerKey ? headers[headerKey] : '';
};

/**
 * Check if request URL matches protected endpoints.
 */
const isProtectedEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return PROTECTED_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

/**
 * Clear all authentication data and perform logout.
 */
const performLogout = (): void => {
  // Clear localStorage
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });

  // Clear Redux state
  store.dispatch(clearCurrentUser());

  // Clear query cache
  queryClient.clear();

  // Redirect to home
  window.location.href = '/';
};

/**
 * Refresh access token using refresh token.
 */
const refreshAccessToken = async (
  accessToken: string,
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string; expireAt: string }> => {
  const lang = localStorage.getItem('i18nextLng') || 'en';

  const response = await refreshAxiosInstance.post('/users/tokens', undefined, {
    headers: {
      Authorization: accessToken,
      'Refresh-Token': refreshToken,
      Lang: lang,
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error(`Token refresh failed with status ${response.status}`);
  }

  const headers = response.headers as Record<string, string>;
  const newAccessToken = getHeader(headers, 'access-token');
  const newRefreshToken = getHeader(headers, 'refresh-token');
  const expireAt = getHeader(headers, 'expire-at');

  if (!newAccessToken) {
    throw new Error('No access token received from refresh');
  }

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expireAt,
  };
};

/**
 * Save tokens to localStorage.
 */
const saveTokens = (
  accessToken: string,
  refreshToken: string,
  expireAt: string,
): void => {
  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
  if (expireAt) {
    localStorage.setItem(STORAGE_KEYS.EXPIRE_AT, expireAt);
  }
};

// ============================================================================
// Request Interceptor
// ============================================================================

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const lang = localStorage.getItem('i18nextLng') || 'en';
    const isFormData = config.data instanceof FormData;

    // Set content type for non-FormData requests
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
      config.headers['Accept'] = 'application/json;odata=verbose';
    }

    // Set language header
    config.headers['Lang'] = lang;

    // Set authorization header
    if (accessToken && config.headers) {
      config.headers['Authorization'] = accessToken;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ============================================================================
// Response Interceptor
// ============================================================================

axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | CustomAxiosRequestConfig
      | undefined;
    const requestUrl = originalRequest?.url || '';

    // Skip protected endpoints to prevent infinite loops
    if (isProtectedEndpoint(requestUrl)) {
      return Promise.reject(error);
    }

    // Early return if not a 401 error or request config is missing
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Early return if request was already retried
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const accessToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

    // If tokens are missing, perform logout
    if (!refreshToken || !accessToken) {
      performLogout();
      return Promise.reject(error);
    }

    // Mark request as retried
    originalRequest._retry = true;

    // If refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token: unknown) => {
          if (originalRequest && typeof token === 'string' && token) {
            originalRequest.headers['Authorization'] = token;
          }
          return axios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Start token refresh process
    isRefreshing = true;

    try {
      // Get fresh tokens (in case they were updated by another process)
      const currentAccessToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const currentRefreshToken = localStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN,
      );

      if (!currentAccessToken || !currentRefreshToken) {
        throw new Error('Tokens missing from storage');
      }

      // Refresh tokens
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expireAt,
      } = await refreshAccessToken(currentAccessToken, currentRefreshToken);

      // Save new tokens
      saveTokens(newAccessToken, newRefreshToken, expireAt);

      // Process queued requests
      processQueue(undefined, newAccessToken);

      // Update original request with new token and retry
      originalRequest.headers['Authorization'] = newAccessToken;
      isRefreshing = false;
      return axios(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, undefined);
      performLogout();
      return Promise.reject(refreshError);
    }
  },
);

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create default headers for API requests.
 */
const createDefaultHeaders = (
  config: AxiosRequestConfig,
  isFormData = false,
): Record<string, string> => {
  const headers: Record<string, string> = {
    ...(config.headers as Record<string, string>),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

/**
 * POST request
 */
export const post = (
  url: string,
  data: unknown,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse> => {
  return axios.post(`${baseURL}${url}`, data, {
    ...config,
    headers: createDefaultHeaders(config),
  });
};

/**
 * PATCH request
 */
export const patch = (
  url: string,
  data: unknown,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse> => {
  const isFormData = data instanceof FormData;
  return axios.patch(`${baseURL}${url}`, data, {
    ...config,
    headers: createDefaultHeaders(config, isFormData),
  });
};

/**
 * PUT request
 */
export const putRequest = (
  url: string,
  data: unknown,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse> => {
  return axios.put(`${baseURL}${url}`, data, {
    ...config,
    headers: createDefaultHeaders(config),
  });
};

/**
 * GET request
 */
export const get = (
  url: string,
  options: { params?: Record<string, any>; config?: AxiosRequestConfig } = {},
): Promise<AxiosResponse> => {
  const { params = {}, config = {} } = options;
  return axios.get(`${baseURL}${url}`, {
    ...config,
    params,
    headers: createDefaultHeaders(config),
  });
};

/**
 * DELETE request
 */
export const remove = (
  url: string,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse> => {
  return axios.delete(`${baseURL}${url}`, {
    ...config,
    headers: createDefaultHeaders(config),
  });
};
