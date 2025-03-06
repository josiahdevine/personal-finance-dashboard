import api from './api';
import type { Settings } from '../types/models';

export class SettingsService {
  static async getSettings(): Promise<Settings> {
    const response = await api.get<Settings>('/api/settings');
    return response.data;
  }

  static async updateSettings(data: Partial<Settings>): Promise<Settings> {
    const response = await api.patch<Settings>('/api/settings', data);
    return response.data;
  }
} 