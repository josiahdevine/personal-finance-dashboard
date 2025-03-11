import api from './api';
import { NotificationPreferences } from '../types/models';

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const response = await api.get<NotificationPreferences>('/notifications/preferences');
    return response;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  try {
    const response = await api.put<NotificationPreferences>('/notifications/preferences', preferences);
    return response;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

export const registerPushToken = async (token: string): Promise<void> => {
  try {
    await api.post('/notifications/push-token', { token });
  } catch (error) {
    console.error('Error registering push token:', error);
    throw error;
  }
};

export const unregisterPushToken = async (token: string): Promise<void> => {
  try {
    await api.delete('/notifications/push-token', {
      data: { token }
    });
  } catch (error) {
    console.error('Error unregistering push token:', error);
    throw error;
  }
}; 