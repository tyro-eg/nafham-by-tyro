/* eslint-disable no-underscore-dangle */
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://tyro-backend.onrender.com/api/v1';

// Axios interceptors for request and response
axios.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig<any>,
  ): InternalAxiosRequestConfig<any> => {
    const accessToken = localStorage.getItem('tyro.token');
    const lang = localStorage.getItem('i18nextLng') || 'en';
    const isFormData = config.data instanceof FormData;

    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
      config.headers['Accept'] = 'application/json;odata=verbose';
    }

    config.headers['Lang'] = lang;

    if (accessToken && config.headers) {
      config.headers['Authorization'] = accessToken;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Axios response interceptor to handle token expiration
axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: CustomAxiosRequestConfig | undefined = error.config;
    const refreshToken = localStorage.getItem('tyro.refreshToken');
    let accessToken = localStorage.getItem('tyro.token');

    // Don't intercept these endpoints to prevent infinite loops or unnecessary retries
    if (
      originalRequest?.url?.includes('/users/tokens') ||
      originalRequest?.url?.includes('/users/sign_out')
    ) {
      return Promise.reject(error);
    }

    if (
      refreshToken &&
      error.response?.status === 401 &&
      !originalRequest?._retry
    ) {
      if (originalRequest) originalRequest._retry = true;

      try {
        const res = await axios.post(`${baseURL}/users/tokens`, undefined, {
          headers: {
            Authorization: accessToken,
            'Refresh-Token': refreshToken,
          },
        });

        if (res.status === 200) {
          localStorage.setItem('tyro.token', res.headers['access-token'] || '');
          localStorage.setItem(
            'tyro.refreshToken',
            res.headers['refresh-token'] || '',
          );
          localStorage.setItem('tyro.expireAt', res.headers['expire-at'] || '');
          if (originalRequest)
            originalRequest.headers['Authorization'] =
              res.headers['access-token'] || '';
          return axios(originalRequest!);
        }
      } catch (refreshError) {
        // If refresh token is invalid, clear all auth data and redirect to login
        localStorage.removeItem('tyro.token');
        localStorage.removeItem('tyro.refreshToken');
        localStorage.removeItem('tyro.expireAt');
        localStorage.removeItem('tyro.type');

        // Redirect to login or home page
        window.location.href = '/';

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// Export functions for CRUD operations
export const post = (
  url: string,
  data: unknown,
  config: AxiosRequestConfig = {},
) =>
  axios.post(`${baseURL}${url}`, data, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

export const patch = (
  url: string,
  data: unknown,
  config: AxiosRequestConfig = {},
) => {
  const isFormData = data instanceof FormData;

  const headers = { ...(config.headers || {}) };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return axios.patch(`${baseURL}${url}`, data, {
    ...config,
    headers,
  });
};

export const putRequest = (
  url: string,
  data: unknown,
  config: AxiosRequestConfig = {},
) =>
  axios.put(`${baseURL}${url}`, data, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

// Consolidated GET function with optional params and config
export const get = (
  url: string,
  options: { params?: any; config?: AxiosRequestConfig } = {},
) => {
  const { params = {}, config = {} } = options;
  return axios.get(`${baseURL}${url}`, {
    ...config,
    params,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });
};

export const remove = (url: string, config: AxiosRequestConfig = {}) =>
  axios.delete(`${baseURL}${url}`, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });
