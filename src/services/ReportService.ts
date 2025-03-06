import api from './api';

interface ReportSchedule {
  id: string;
  type: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  lastSent?: string;
}

interface ReportOptions {
  type: string;
  format: 'pdf' | 'csv' | 'xlsx';
  startDate?: string;
  endDate?: string;
  includeCharts?: boolean;
  includeTransactions?: boolean;
}

export const generateReport = async (options: ReportOptions): Promise<Blob> => {
  try {
    const { data } = await api.post<Blob>('/reports/generate', options, {
      responseType: 'blob'
    });
    return data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const getReportSchedules = async (): Promise<ReportSchedule[]> => {
  try {
    const { data } = await api.get<ReportSchedule[]>('/reports/schedules');
    return data;
  } catch (error) {
    console.error('Error fetching report schedules:', error);
    throw error;
  }
};

export const createReportSchedule = async (schedule: Omit<ReportSchedule, 'id' | 'lastSent'>): Promise<ReportSchedule> => {
  try {
    const { data } = await api.post<ReportSchedule>('/reports/schedules', schedule);
    return data;
  } catch (error) {
    console.error('Error creating report schedule:', error);
    throw error;
  }
};

export const updateReportSchedule = async (
  id: string,
  schedule: Partial<Omit<ReportSchedule, 'id' | 'lastSent'>>
): Promise<ReportSchedule> => {
  try {
    const { data } = await api.put<ReportSchedule>(`/reports/schedules/${id}`, schedule);
    return data;
  } catch (error) {
    console.error('Error updating report schedule:', error);
    throw error;
  }
};

export const deleteReportSchedule = async (id: string): Promise<void> => {
  try {
    await api.delete(`/reports/schedules/${id}`);
  } catch (error) {
    console.error('Error deleting report schedule:', error);
    throw error;
  }
}; 