import axios from './api';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    currency: string;
    dateFormat: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export type UpdateUserProfileData = Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>;

export class UserService {
  static async getCurrentUser(): Promise<UserProfile> {
    const response = await axios.get<UserProfile>('/users/me');
    return response.data;
  }

  static async updateProfile(data: UpdateUserProfileData): Promise<UserProfile> {
    const response = await axios.patch<UserProfile>('/users/me', data);
    return response.data;
  }

  static async updateAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<UserProfile> {
    const response = await axios.patch<UserProfile>('/users/me/preferences', preferences);
    return response.data;
  }

  static async deleteAccount(): Promise<void> {
    await axios.delete('/users/me');
  }

  static async requestDataExport(): Promise<{ exportId: string }> {
    const response = await axios.post<{ exportId: string }>('/users/me/export');
    return response.data;
  }

  static async getExportStatus(exportId: string): Promise<{ status: 'pending' | 'completed' | 'failed'; downloadUrl?: string }> {
    const response = await axios.get(`/users/me/export/${exportId}`);
    return response.data;
  }
} 