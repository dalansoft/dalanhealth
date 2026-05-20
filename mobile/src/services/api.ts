import axios from 'axios';
import Constants from 'expo-constants';
import { useAuth } from '@/store/auth';

const baseURL = (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ?? 'http://localhost:8000/api/v1';

export const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const t = useAuth.getState().token;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
