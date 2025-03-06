import { api } from './api';

interface ExportOptions {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  accounts?: string[];
  format: 'csv' | 'pdf' | 'json';
  includeDeleted?: boolean;
}

export class ExportService {
  static async exportData(type: 'transactions' | 'accounts' | 'goals', options: ExportOptions): Promise<Blob> {
    const response = await api.post(
      `/export/${type}`,
      options,
      { responseType: 'blob' }
    );
    return response;
  }

  static async getExportHistory(): Promise<{
    id: string;
    type: string;
    format: string;
    createdAt: string;
    status: 'completed' | 'failed' | 'processing';
    downloadUrl?: string;
  }[]> {
    const response = await api.get('/export/history');
    return response;
  }

  static async scheduleExport(
    type: 'transactions' | 'accounts' | 'goals',
    options: ExportOptions & { frequency: 'daily' | 'weekly' | 'monthly' }
  ): Promise<void> {
    await api.post('/export/schedule', { type, ...options });
  }

  static async cancelScheduledExport(id: string): Promise<void> {
    await api.delete(`/export/scheduled/${id}`);
  }
} 