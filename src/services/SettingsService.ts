import api from './api';
import type { Settings } from '../types/models';
import { AxiosResponse } from 'axios';

// Helper function for extracting response data
const extractData = <T>(response: T | AxiosResponse<T>): T => {
  return 'data' in (response as any) 
    ? (response as any).data 
    : response as T;
};

export class SettingsService {
  static async getSettings(): Promise<Settings> {
    const response = await api.get<Settings>('/api/settings');
    return extractData(response);
  }

  static async updateSettings(data: Partial<Settings>): Promise<Settings> {
    const response = await api.patch<Settings>('/api/settings', data);
    return extractData(response);
  }
} 