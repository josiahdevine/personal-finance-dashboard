import { api } from './api';
import { NotificationPreferences } from '../types/models';

export class NotificationService {
  static async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<NotificationPreferences>('/notifications/preferences');
    return response;
  }

  static async updatePreferences(updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.patch<NotificationPreferences>('/notifications/preferences', updates);
    return response;
  }

  static async registerPushToken(token: string): Promise<void> {
    await api.post('/notifications/push-token', { token });
  }

  static async unregisterPushToken(token: string): Promise<void> {
    await api.delete('/notifications/push-token', { data: { token } });
  }
} 