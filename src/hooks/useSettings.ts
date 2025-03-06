import { useState, useCallback, useEffect } from 'react';
import { useAsyncAction } from './useAsyncAction';
import { SettingsService } from '../services/SettingsService';
import type { Settings } from '../types/models';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  const {
    execute: fetchSettings,
    isLoading: loadingSettings,
    error: loadError
  } = useAsyncAction<[], Settings>(async () => {
    const data = await SettingsService.getSettings();
    setSettings(data);
    return data;
  });

  const {
    execute: updateSettings,
    isLoading: updatingSettings,
    error: updateError
  } = useAsyncAction<[Partial<Settings>], Settings>(async (settingsData) => {
    const updatedSettings = await SettingsService.updateSettings(settingsData);
    setSettings(updatedSettings);
    return updatedSettings;
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateTheme = useCallback((theme: Settings['theme']) => {
    return updateSettings({ theme });
  }, [updateSettings]);

  const updateCurrency = useCallback((currency: string) => {
    return updateSettings({ currency });
  }, [updateSettings]);

  const updateLanguage = useCallback((language: string) => {
    return updateSettings({ language });
  }, [updateSettings]);

  const updateTimezone = useCallback((timezone: string) => {
    return updateSettings({ timezone });
  }, [updateSettings]);

  const updateDateFormat = useCallback((dateFormat: string) => {
    return updateSettings({ dateFormat });
  }, [updateSettings]);

  const updateNotifications = useCallback((notifications: Settings['notifications']) => {
    return updateSettings({ notifications });
  }, [updateSettings]);

  const updatePrivacy = useCallback((privacy: Settings['privacy']) => {
    return updateSettings({ privacy });
  }, [updateSettings]);

  return {
    settings,
    loadingSettings,
    updatingSettings,
    loadError,
    updateError,
    updateSettings,
    updateTheme,
    updateCurrency,
    updateLanguage,
    updateTimezone,
    updateDateFormat,
    updateNotifications,
    updatePrivacy
  };
} 