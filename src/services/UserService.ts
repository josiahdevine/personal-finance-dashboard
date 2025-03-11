import axios, { AxiosResponse } from 'axios';
import { UserProfile, UpdateUserProfileData } from '../types/user';

// Helper function for extracting response data
const extractData = <T>(response: T | AxiosResponse<T>): T => {
  return 'data' in (response as any) 
    ? (response as any).data 
    : response as T;
};

export class UserService {
  static async getCurrentUser(): Promise<UserProfile> {
    const response = await axios.get<UserProfile>('/users/me');
    return extractData(response);
  }

  static async updateProfile(data: UpdateUserProfileData): Promise<UserProfile> {
    const response = await axios.patch<UserProfile>('/users/me', data);
    return extractData(response);
  }

  static async updateAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axios.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return extractData(response);
  }

  static async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<UserProfile> {
    const response = await axios.patch<UserProfile>('/users/me/preferences', preferences);
    return extractData(response);
  }

  static async deleteAccount(): Promise<void> {
    await axios.delete('/users/me');
  }

  static async requestDataExport(): Promise<{ exportId: string }> {
    const response = await axios.post<{ exportId: string }>('/users/me/export');
    return extractData(response);
  }

  static async getExportStatus(exportId: string): Promise<{ status: 'pending' | 'completed' | 'failed'; downloadUrl?: string }> {
    const response = await axios.get<{ status: 'pending' | 'completed' | 'failed'; downloadUrl?: string }>(`/users/me/export/${exportId}`);
    return extractData(response);
  }
} 