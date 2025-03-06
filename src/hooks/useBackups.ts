import { useState, useEffect } from 'react';
import { useAsyncAction } from './useAsyncAction';
import { BackupService } from '../services/BackupService';
import type { Backup } from '../types/models';

export function useBackups() {
  const [backups, setBackups] = useState<Backup[]>([]);

  const {
    execute: fetchBackups,
    isLoading: loadingBackups,
    error: loadError
  } = useAsyncAction<[], Backup[]>(async () => {
    const data = await BackupService.getBackups();
    setBackups(data);
    return data;
  });

  const {
    execute: createBackup,
    isLoading: creatingBackup,
    error: createError
  } = useAsyncAction<[string, string], Backup>(async (type, name) => {
    const newBackup = await BackupService.createBackup(type as Backup['type'], name);
    setBackups(prev => [...prev, newBackup]);
    return newBackup;
  });

  const {
    execute: deleteBackup,
    isLoading: deletingBackup,
    error: deleteError
  } = useAsyncAction<[string], void>(async (id) => {
    await BackupService.deleteBackup(id);
    setBackups(prev => prev.filter(backup => backup.id !== id));
  });

  const {
    execute: restoreBackup,
    isLoading: restoringBackup,
    error: restoreError
  } = useAsyncAction<[string], Backup>(async (id) => {
    const restoredBackup = await BackupService.restoreBackup(id);
    setBackups(prev => prev.map(backup => backup.id === id ? restoredBackup : backup));
    return restoredBackup;
  });

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  return {
    backups,
    loadingBackups,
    creatingBackup,
    deletingBackup,
    restoringBackup,
    loadError,
    createError,
    deleteError,
    restoreError,
    createBackup,
    deleteBackup,
    restoreBackup
  };
} 