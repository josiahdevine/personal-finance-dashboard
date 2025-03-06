import api from './api';

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  startDate?: string;
  endDate?: string;
  categories?: string[];
  includeMetadata?: boolean;
}

interface ExportJob {
  id: string;
  type: string;
  format: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'processing';
  downloadUrl?: string;
}

export const exportData = async (
  type: string,
  format: string,
  startDate?: string,
  endDate?: string
): Promise<Blob> => {
  try {
    const { data } = await api.get<Blob>('/export', {
      params: { type, format, startDate, endDate },
      responseType: 'blob'
    });
    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const getExportJobs = async (): Promise<ExportJob[]> => {
  try {
    const { data } = await api.get<ExportJob[]>('/export/jobs');
    return data;
  } catch (error) {
    console.error('Error fetching export jobs:', error);
    throw error;
  }
};

export class ExportService {
  static async exportData(options: ExportOptions): Promise<Blob> {
    const response = await api.post('/api/export', options, {
      responseType: 'blob',
      headers: {
        'Accept': options.format === 'json' ? 'application/json' : 
                 options.format === 'csv' ? 'text/csv' : 
                 'application/pdf'
      }
    });
    return new Blob([response.data], {
      type: options.format === 'json' ? 'application/json' : 
            options.format === 'csv' ? 'text/csv' : 
            'application/pdf'
    });
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