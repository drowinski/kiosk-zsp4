import axios, { type AxiosInstance } from 'axios';
import { getAuthToken } from '@kiosk-zsp4/shared/features/auth/utils/token';

let api: AxiosInstance;

export function initializeApiClient(baseURL: string) {
  if (api !== undefined) {
    throw new Error('API client has already been initialized');
  }

  api = axios.create({
    baseURL: baseURL,
  });

  api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  api.interceptors.response.use((response) => response.data);

  return api;
}

export function getApiClient() {
  if (api === undefined) {
    throw new Error('API client has not been initialized');
  }
  return api;
}
