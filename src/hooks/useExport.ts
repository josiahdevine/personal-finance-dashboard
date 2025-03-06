import { useCallback } from 'react';
import { useAsyncAction } from './useAsyncAction';
import { ExportService } from '../services/ExportService';

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  startDate?: string;
  endDate?: string;
  categories?: string[];
  includeMetadata?: boolean;
}

export function useExport() {
  const {
    execute: exportData,
    isLoading: exporting,
    error: exportError
  } = useAsyncAction<[ExportOptions], Blob>(async (options) => {
    return await ExportService.exportData(options);
  });

  const downloadExport = useCallback(async (options: ExportOptions) => {
    try {
      const blob = await exportData(options);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${new Date().toISOString()}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download export:', error);
      throw error;
    }
  }, [exportData]);

  return {
    exportData,
    downloadExport,
    exporting,
    exportError
  };
} 