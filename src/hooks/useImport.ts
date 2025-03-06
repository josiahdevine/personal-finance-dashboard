import { useState } from 'react';
import { ImportService, ImportStatus } from '../services/ImportService';

export function useImport() {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ImportStatus | null>(null);

  const startImport = async (file: File) => {
    setImporting(true);
    setError(null);
    
    try {
      const importStatus = await ImportService.startImport(file);
      setStatus(importStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start import');
    } finally {
      setImporting(false);
    }
  };

  const checkStatus = async (importId: string) => {
    try {
      const importStatus = await ImportService.getImportStatus(importId);
      setStatus(importStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check import status');
    }
  };

  return {
    importing,
    error,
    status,
    startImport,
    checkStatus
  };
} 