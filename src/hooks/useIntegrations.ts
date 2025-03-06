import { useState, useEffect } from 'react';
import { useAsyncAction } from './useAsyncAction';
import { IntegrationService } from '../services/IntegrationService';
import type { Integration, CreateIntegrationData, UpdateIntegrationData } from '../types/models';

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  const {
    execute: fetchIntegrations,
    isLoading: loadingIntegrations,
    error: loadError
  } = useAsyncAction<[], Integration[]>(async () => {
    const data = await IntegrationService.getIntegrations();
    setIntegrations(data);
    return data;
  });

  const {
    execute: addIntegration,
    isLoading: addingIntegration,
    error: addError
  } = useAsyncAction<[CreateIntegrationData], Integration>(async (integrationData) => {
    const newIntegration = await IntegrationService.createIntegration(integrationData);
    setIntegrations(prev => [...prev, newIntegration]);
    return newIntegration;
  });

  const {
    execute: updateIntegration,
    isLoading: updatingIntegration,
    error: updateError
  } = useAsyncAction<[string, UpdateIntegrationData], Integration>(async (id, integrationData) => {
    const updatedIntegration = await IntegrationService.updateIntegration(id, integrationData);
    setIntegrations(prev => prev.map(int => int.id === id ? updatedIntegration : int));
    return updatedIntegration;
  });

  const {
    execute: removeIntegration,
    isLoading: removingIntegration,
    error: removeError
  } = useAsyncAction<[string], void>(async (id) => {
    await IntegrationService.deleteIntegration(id);
    setIntegrations(prev => prev.filter(int => int.id !== id));
  });

  const {
    execute: syncIntegration,
    isLoading: syncingIntegration,
    error: syncError
  } = useAsyncAction<[string], Integration>(async (id) => {
    const syncedIntegration = await IntegrationService.syncIntegration(id);
    setIntegrations(prev => prev.map(int => int.id === id ? syncedIntegration : int));
    return syncedIntegration;
  });

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return {
    integrations,
    loadingIntegrations,
    addingIntegration,
    updatingIntegration,
    removingIntegration,
    syncingIntegration,
    loadError,
    addError,
    updateError,
    removeError,
    syncError,
    addIntegration,
    updateIntegration,
    removeIntegration,
    syncIntegration
  };
} 