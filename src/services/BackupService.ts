import api from './api';
import { Backup } from '../types/models';

export class BackupService {
  static async getBackups(): Promise<Backup[]> {
    const response = await api.get<Backup[]>('/api/backups');
    return response;
  }

  static async createBackup(type: Backup['type'], name: string): Promise<Backup> {
    const response = await api.post<Backup>('/api/backups', { type, name });
    return response;
  }

  static async deleteBackup(id: string): Promise<void> {
    await api.delete(`/api/backups/${id}`);
  }

  static async restoreBackup(id: string): Promise<Backup> {
    const response = await api.post<Backup>(`/api/backups/${id}/restore`);
    return response;
  }

  static async downloadBackup(id: string): Promise<Blob> {
    const response = await api.get<Blob>(`/api/backups/${id}/download`, {
      responseType: 'blob'
    });
    return response;
  }
} 