import { api } from './api';

interface ReportOptions {
  startDate: string;
  endDate: string;
  type: 'spending' | 'income' | 'net-worth' | 'budget';
  format: 'pdf' | 'csv';
  includeCharts?: boolean;
}

export class ReportService {
  static async generateReport(options: ReportOptions): Promise<Blob> {
    const response = await api.post('/reports/generate', options, {
      responseType: 'blob'
    });
    return response;
  }

  static async getScheduledReports(): Promise<{
    id: string;
    type: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    lastSent?: string;
  }[]> {
    const response = await api.get('/reports/scheduled');
    return response;
  }

  static async scheduleReport(
    type: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    recipients: string[]
  ): Promise<void> {
    await api.post('/reports/schedule', {
      type,
      frequency,
      recipients
    });
  }

  static async cancelScheduledReport(id: string): Promise<void> {
    await api.delete(`/reports/scheduled/${id}`);
  }
} 