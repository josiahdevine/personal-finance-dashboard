import { api } from '../utils/api';

export interface ImportOptions {
  source: 'csv' | 'qfx' | 'ofx' | 'mint';
  file?: File;
  connectionId?: string;
  dateFormat?: string;
  columnMapping?: Record<string, string>;
  skipFirstRow?: boolean;
}

export interface ImportStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    column: string;
    message: string;
  }>;
}

export const uploadFile = async (file: File): Promise<{ importId: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ importId: string }>('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getImportHistory = async (): Promise<ImportStatus[]> => {
  try {
    const { data } = await api.get<ImportStatus[]>('/import/history');
    return data;
  } catch (error) {
    console.error('Error getting import history:', error);
    throw error;
  }
};

export const validateFile = async (file: File): Promise<ValidationResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<ValidationResult>('/import/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    console.error('Error validating file:', error);
    throw error;
  }
};

export const cancelImport = async (importId: string): Promise<void> => {
  try {
    await api.post(`/import/${importId}/cancel`);
  } catch (error) {
    console.error('Error canceling import:', error);
    throw error;
  }
};

export class ImportService {
  static async getAvailableConnections(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    lastSync?: string;
  }>> {
    const response = await api.get('/import/connections');
    return response.data;
  }

  static async startImport(file: File): Promise<ImportStatus> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ImportStatus>('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  static async getImportStatus(importId: string): Promise<ImportStatus> {
    const response = await api.get<ImportStatus>(`/import/${importId}/status`);
    return response.data;
  }
} 