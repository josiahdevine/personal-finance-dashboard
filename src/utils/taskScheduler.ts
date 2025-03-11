import { useEffect, useCallback, useState } from 'react';
import { BaseComponentProps, Transaction, Account, Budget, ApiResponse } from '../types/index';
import { useAuth } from '../hooks/useAuth';
import { validateUser } from '../types/guards';
import { handleApiError } from '../utils/errorHandling';

interface Task {
  id: string;
  type: 'insight' | 'report' | 'sync';
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  schedule: {
    type: 'interval' | 'cron' | 'once';
    value: string; // Interval in ms or cron expression
    lastRun?: string;
    nextRun?: string;
  };
  metadata?: Record<string, unknown>;
  error?: Error;
}

interface TaskResult<T = unknown> {
  taskId: string;
  data: T;
  timestamp: string;
}

interface TaskManager {
  scheduleTask: (task: Omit<Task, 'id' | 'status'>) => Promise<string>;
  cancelTask: (taskId: string) => Promise<void>;
  getTaskStatus: (taskId: string) => Promise<Task>;
  getTaskResult: <T>(taskId: string) => Promise<TaskResult<T>>;
}

interface InsightGenerationConfig extends Record<string, unknown> {
  accounts?: string[];
  startDate?: string;
  endDate?: string;
}

interface ReportGenerationConfig extends Record<string, unknown> {
  type: 'monthly' | 'yearly';
  format: 'pdf' | 'csv';
  includeTransactions?: boolean;
}

interface SyncConfig extends Record<string, unknown> {
  provider: string;
  accountId: string;
}

const createTaskManager = (apiClient: any): TaskManager => {
  return {
    scheduleTask: async (task) => {
      const response = await apiClient.post('/tasks', task) as { id: string };
      return response.id;
    },

    cancelTask: async (taskId) => {
      await handleApiError(() =>
        apiClient.delete(`/tasks/${taskId}`)
      );
    },

    getTaskStatus: async (taskId) => {
      return handleApiError(() =>
        apiClient.get(`/tasks/${taskId}`)
      );
    },

    getTaskResult: async <T>(taskId: string) => {
      return handleApiError(() =>
        apiClient.get(`/tasks/${taskId}/result`)
      );
    }
  };
};

export const useTaskScheduler = (taskManager: TaskManager) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [results, setResults] = useState<TaskResult[]>([]);

  const scheduleInsightGeneration = useCallback(async (
    config: InsightGenerationConfig,
    schedule: Task['schedule']
  ) => {
    const taskId = await taskManager.scheduleTask({
      type: 'insight',
      schedule,
      metadata: config
    });

    setTasks(prev => [...prev, {
      id: taskId,
      type: 'insight',
      status: 'scheduled',
      schedule
    }]);

    return taskId;
  }, [taskManager]);

  const scheduleReportGeneration = useCallback(async (
    config: ReportGenerationConfig,
    schedule: Task['schedule']
  ) => {
    const taskId = await taskManager.scheduleTask({
      type: 'report',
      schedule,
      metadata: config
    });

    setTasks(prev => [...prev, {
      id: taskId,
      type: 'report',
      status: 'scheduled',
      schedule
    }]);

    return taskId;
  }, [taskManager]);

  const scheduleSync = useCallback(async (
    config: SyncConfig,
    schedule: Task['schedule']
  ) => {
    const taskId = await taskManager.scheduleTask({
      type: 'sync',
      schedule,
      metadata: config
    });

    setTasks(prev => [...prev, {
      id: taskId,
      type: 'sync',
      status: 'scheduled',
      schedule
    }]);

    return taskId;
  }, [taskManager]);

  const cancelScheduledTask = useCallback(async (taskId: string) => {
    await taskManager.cancelTask(taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, [taskManager]);

  const getTaskStatus = useCallback(async (taskId: string) => {
    const status = await taskManager.getTaskStatus(taskId);
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, ...status } : task
      )
    );
    return status;
  }, [taskManager]);

  const getTaskResult = useCallback(async <T>(taskId: string) => {
    const result = await taskManager.getTaskResult<T>(taskId);
    setResults(prev => [...prev, result]);
    return result;
  }, [taskManager]);

  return {
    tasks,
    results,
    scheduleInsightGeneration,
    scheduleReportGeneration,
    scheduleSync,
    cancelScheduledTask,
    getTaskStatus,
    getTaskResult
  };
};

interface TaskMonitorProps extends BaseComponentProps {
  taskIds: string[];
  onTaskComplete?: (taskId: string, result: TaskResult) => void;
  onTaskError?: (taskId: string, error: Error) => void;
}

export const TaskMonitor: React.FC<TaskMonitorProps> = ({
  taskIds,
  onTaskComplete,
  onTaskError
}) => {
  const authContext = useAuth();
  const user = authContext?.user;
  const taskManager = createTaskManager({} as any); // Replace with your API client
  const [monitoredTasks, setMonitoredTasks] = useState<Record<string, Task>>({});

  const checkTaskStatus = useCallback(async (taskId: string) => {
    try {
      const status = await taskManager.getTaskStatus(taskId);
      setMonitoredTasks(prev => ({
        ...prev,
        [taskId]: status
      }));

      if (status.status === 'completed') {
        const result = await taskManager.getTaskResult(taskId);
        onTaskComplete?.(taskId, result);
      } else if (status.status === 'failed') {
        onTaskError?.(taskId, status.error!);
      }
    } catch (error) {
      onTaskError?.(taskId, error as Error);
    }
  }, [taskManager, onTaskComplete, onTaskError]);

  useEffect(() => {
    if (!user || !validateUser(user)) {
      return;
    }

    const intervals: Record<string, NodeJS.Timeout> = {};

    taskIds.forEach(taskId => {
      intervals[taskId] = setInterval(() => {
        const task = monitoredTasks[taskId];
        if (task && (task.status === 'completed' || task.status === 'failed')) {
          clearInterval(intervals[taskId]);
          return;
        }
        checkTaskStatus(taskId);
      }, 5000);
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [taskIds, user, checkTaskStatus, monitoredTasks]);

  return null;
};

interface TaskScheduleConfig {
  type: 'insight' | 'report' | 'sync';
  schedule: Task['schedule'];
  config: InsightGenerationConfig | ReportGenerationConfig | SyncConfig;
}

export const useScheduledTasks = (initialSchedules: TaskScheduleConfig[]) => {
  const taskManager = createTaskManager({} as any); // Replace with your API client
  const scheduler = useTaskScheduler(taskManager);
  const [activeTaskIds, setActiveTaskIds] = useState<string[]>([]);

  const initializeTasks = useCallback(async () => {
    const taskIds = await Promise.all(
      initialSchedules.map(async (schedule) => {
        switch (schedule.type) {
          case 'insight':
            return scheduler.scheduleInsightGeneration(
              schedule.config as InsightGenerationConfig,
              schedule.schedule
            );
          case 'report':
            return scheduler.scheduleReportGeneration(
              schedule.config as ReportGenerationConfig,
              schedule.schedule
            );
          case 'sync':
            return scheduler.scheduleSync(
              schedule.config as SyncConfig,
              schedule.schedule
            );
        }
      })
    );

    setActiveTaskIds(taskIds);
  }, [initialSchedules, scheduler]);

  useEffect(() => {
    initializeTasks();
  }, [initializeTasks]);

  return {
    activeTaskIds,
    ...scheduler
  };
};

export const createDefaultSchedules = (): TaskScheduleConfig[] => [
  {
    type: 'insight',
    schedule: {
      type: 'interval',
      value: '3600000' // Every hour
    },
    config: {
      timeFrame: 'day',
      categories: ['all']
    }
  },
  {
    type: 'report',
    schedule: {
      type: 'cron',
      value: '0 0 * * 1' // Every Monday at midnight
    },
    config: {
      type: 'spending',
      format: 'pdf',
      timeFrame: 'week'
    }
  },
  {
    type: 'sync',
    schedule: {
      type: 'interval',
      value: '900000' // Every 15 minutes
    },
    config: {
      syncTypes: ['transactions', 'balances']
    }
  }
];
