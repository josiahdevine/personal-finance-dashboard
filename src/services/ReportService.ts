import api from './api';

// Define report-related interfaces
export interface ReportOptions {
  type: 'income' | 'expense' | 'cashflow' | 'budget';
  format: 'pdf' | 'csv' | 'json';
  startDate: string;
  endDate: string;
  accounts?: string[];
  categories?: string[];
  includeTransactions?: boolean;
}

export interface ReportSchedule {
  id: string;
  name: string;
  options: ReportOptions;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6, Sunday to Saturday
  dayOfMonth?: number; // 1-31
  recipients: string[];
  lastSent?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate a report based on the provided options
 * @param options Report generation options
 * @returns A blob containing the report file
 */
export const generateReport = async (options: ReportOptions): Promise<Blob> => {
  try {
    const response = await api.post<Blob>('/reports/generate', options, {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

/**
 * Get all report schedules for the current user
 * @returns List of report schedules
 */
export const getReportSchedules = async (): Promise<ReportSchedule[]> => {
  try {
    const response = await api.get<ReportSchedule[]>('/reports/schedules');
    return response;
  } catch (error) {
    console.error('Error fetching report schedules:', error);
    throw error;
  }
};

/**
 * Create a new report schedule
 * @param schedule Report schedule to create
 * @returns Created report schedule
 */
export const createReportSchedule = async (schedule: Omit<ReportSchedule, 'id' | 'lastSent'>): Promise<ReportSchedule> => {
  try {
    const response = await api.post<ReportSchedule>('/reports/schedules', schedule);
    return response;
  } catch (error) {
    console.error('Error creating report schedule:', error);
    throw error;
  }
};

/**
 * Update an existing report schedule
 * @param id ID of the report schedule to update
 * @param schedule Updated report schedule
 * @returns Updated report schedule
 */
export const updateReportSchedule = async (
  id: string,
  schedule: Partial<Omit<ReportSchedule, 'id' | 'lastSent'>>
): Promise<ReportSchedule> => {
  try {
    const response = await api.put<ReportSchedule>(`/reports/schedules/${id}`, schedule);
    return response;
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