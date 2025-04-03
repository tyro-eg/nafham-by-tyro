/* eslint-disable no-underscore-dangle */
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import Kitsu from 'kitsu';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseURL = process.env.REACT_APP_API_BASE_URL;
// const userType = localStorage.getItem('tyro.type');

// Define Axios/Kitsu instances
const api = new Kitsu({
  baseURL,
});

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

api.interceptors.request.use(
  (config: any): any => {
    const accessToken = localStorage.getItem('tyro.token');

    const isFormData = config.data instanceof FormData;
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }

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
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// Kitsu response interceptor
api.interceptors.response.use(
  (response: any) => {
    response.data.headers = response.headers;
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config!;
    const refreshToken = localStorage.getItem('tyro.refreshToken');
    let accessToken = localStorage.getItem('tyro.token');

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
          return api.axios(originalRequest!);
        }
      } catch (refreshError) {
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

export const get = (url: string, config: AxiosRequestConfig = {}) =>
  axios.get(`${baseURL}${url}`, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

export const remove = (url: string, config: AxiosRequestConfig = {}) =>
  axios.delete(`${baseURL}${url}`, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

export const apiGet = (url: string, config: any = {}) =>
  api.request({ url, type: 'get', params: config });

export const jsonGet = (url: string, config: any = {}) => api.get(url, config);
