import { useState, useEffect } from 'react';
import { useAsyncAction } from './useAsyncAction';
import { APIKeyService } from '../services/APIKeyService';
import type { APIKey, CreateAPIKeyData } from '../types/models';

export function useAPIKeys() {
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);

  const {
    execute: fetchAPIKeys,
    isLoading: loadingAPIKeys,
    error: loadError
  } = useAsyncAction<never[], APIKey[]>(async () => {
    const data = await APIKeyService.getAPIKeys();
    setAPIKeys(data);
    return data;
  });

  const {
    execute: createAPIKey,
    isLoading: creatingAPIKey,
    error: createError
  } = useAsyncAction<[CreateAPIKeyData], APIKey>(async (keyData) => {
    const newKey = await APIKeyService.createAPIKey(keyData);
    setAPIKeys(prev => [...prev, newKey]);
    return newKey;
  });

  const {
    execute: revokeAPIKey,
    isLoading: revokingAPIKey,
    error: revokeError
  } = useAsyncAction<[string], void>(async (id) => {
    await APIKeyService.revokeAPIKey(id);
    setAPIKeys(prev => prev.filter(key => key.id !== id));
  });

  useEffect(() => {
    fetchAPIKeys();
  }, [fetchAPIKeys]);

  return {
    apiKeys,
    loadingAPIKeys,
    creatingAPIKey,
    revokingAPIKey,
    loadError,
    createError,
    revokeError,
    createAPIKey,
    revokeAPIKey
  };
} 