import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.vuka.app/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('vuka_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('vuka_jwt');
    }
    return Promise.reject(error);
  },
);

export const saveToken = (token: string) => SecureStore.setItemAsync('vuka_jwt', token);
export const getToken = () => SecureStore.getItemAsync('vuka_jwt');
export const clearToken = () => SecureStore.deleteItemAsync('vuka_jwt');
