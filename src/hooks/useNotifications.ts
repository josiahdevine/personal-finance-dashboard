import { useState, useCallback, useEffect } from 'react';
import { useAsyncAction } from './useAsyncAction';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: {
    text: string;
    url: string;
  };
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  types: {
    bills: boolean;
    budgetAlerts: boolean;
    goals: boolean;
    unusualActivity: boolean;
  };
}

interface NotificationFilters {
  type?: Notification['type'];
  isRead?: boolean;
  isArchived?: boolean;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    types: {
      bills: true,
      budgetAlerts: true,
      goals: true,
      unusualActivity: true
    }
  });
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { execute: fetchNotifications } = useAsyncAction(async () => {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.isRead !== undefined) queryParams.append('isRead', String(filters.isRead));
    if (filters.isArchived !== undefined) queryParams.append('isArchived', String(filters.isArchived));
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const response = await fetch(`/api/notifications?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    const data = await response.json();
    setNotifications(data);
    setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
  });

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/notifications/preferences');
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }
      const data = await response.json();
      setPreferences(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification preferences');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNotification = useCallback(async (data: Notification) => {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create notification');
    }

    const newNotification = await response.json();
    setNotifications(prev => [...prev, newNotification]);
    setUnreadCount(prev => prev + 1);
    return newNotification;
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      setUnreadCount(prev => prev - 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const response = await fetch('/api/notifications/read-all', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  const archiveNotification = useCallback(async (id: string) => {
    const response = await fetch(`/api/notifications/${id}/archive`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to archive notification');
    }

    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isArchived: true } : notification
      )
    );
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => prev - 1);
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (id: string) => {
    const response = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    setNotifications(prev => prev.filter(notification => notification.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => prev - 1);
    }
  }, [notifications]);

  const updateFilters = useCallback((newFilters: NotificationFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }
      const updatedPreferences = await response.json();
      setPreferences(updatedPreferences);
      setError(null);
      return updatedPreferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/notifications/clear', {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to clear notifications');
      }
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear notifications');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchNotifications(), fetchPreferences()]);
  }, [fetchNotifications, fetchPreferences]);

  return {
    notifications,
    preferences,
    unreadCount,
    filters,
    isLoading,
    error,
    createNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    updateFilters,
    clearFilters,
    updatePreferences,
    clearAll,
    refreshNotifications: fetchNotifications,
    refreshPreferences: fetchPreferences
  };
}; 