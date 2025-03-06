import axios from './api';

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
  totalRecords?: number;
  processedRecords?: number;
  errorRecords?: number;
  errors?: Array<{
    line: number;
    message: string;
  }>;
  createdAt: string;
  completedAt?: string;
}

export class ImportService {
  static async importData(options: ImportOptions): Promise<{ importId: string }> {
    const formData = new FormData();
    
    if (options.file) {
      formData.append('file', options.file);
    }
    
    formData.append('source', options.source);
    
    if (options.connectionId) {
      formData.append('connectionId', options.connectionId);
    }
    
    if (options.dateFormat) {
      formData.append('dateFormat', options.dateFormat);
    }
    
    if (options.columnMapping) {
      formData.append('columnMapping', JSON.stringify(options.columnMapping));
    }
    
    if (typeof options.skipFirstRow === 'boolean') {
      formData.append('skipFirstRow', String(options.skipFirstRow));
    }

    const response = await axios.post<{ importId: string }>('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async getImportStatus(importId: string): Promise<ImportStatus> {
    const response = await axios.get<ImportStatus>(`/import/${importId}/status`);
    return response.data;
  }

  static async getRecentImports(): Promise<ImportStatus[]> {
    const response = await axios.get<ImportStatus[]>('/import/history');
    return response.data;
  }

  static async cancelImport(importId: string): Promise<void> {
    await axios.post(`/import/${importId}/cancel`);
  }

  static async validateFile(file: File): Promise<{
    isValid: boolean;
    errors?: string[];
    preview?: Array<Record<string, any>>;
    suggestedMapping?: Record<string, string>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/import/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async getAvailableConnections(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    lastSync?: string;
  }>> {
    const response = await axios.get('/import/connections');
    return response.data;
  }
} 