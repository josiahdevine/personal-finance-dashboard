import { renderHook, act } from '@testing-library/react-hooks';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  useAutoRefresh,
  useOptimisticUpdates,
  RefreshableContainer,
  useScheduledTasks,
  createDefaultSchedules
} from '../dataRefresh';

describe('useAutoRefresh', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches data initially and on interval', async () => {
    const mockData = { id: 1, value: 'test' };
    const fetchFn = jest.fn().mockResolvedValue({ success: true, data: mockData });

    const { result } = renderHook(() =>
      useAutoRefresh(fetchFn, { interval: 5000 })
    );

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('handles errors and retries', async () => {
    const error = new Error('API Error');
    const fetchFn = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue({ success: true, data: { id: 1 } });

    const onError = jest.fn();

    const { result } = renderHook(() =>
      useAutoRefresh(fetchFn, {
        interval: 5000,
        retryOnError: true,
        maxRetries: 1,
        onError
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe(error);
    expect(onError).toHaveBeenCalledWith(error);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toEqual({ id: 1 });
    expect(result.current.error).toBe(null);
  });
});

describe('useOptimisticUpdates', () => {
  const initialData = [
    { id: '1', value: 'test1' },
    { id: '2', value: 'test2' }
  ];

  it('updates data optimistically and handles success', async () => {
    const updateFn = jest.fn().mockResolvedValue({
      success: true,
      data: { id: '1', value: 'updated' }
    });

    const { result } = renderHook(() =>
      useOptimisticUpdates(initialData, updateFn)
    );

    await act(async () => {
      await result.current.update('1', { value: 'updated' });
    });

    expect(result.current.data[0].value).toBe('updated');
    expect(result.current.pendingUpdates[0].status).toBe('success');
  });

  it('reverts changes on error', async () => {
    const error = new Error('Update failed');
    const updateFn = jest.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useOptimisticUpdates(initialData, updateFn)
    );

    try {
      await act(async () => {
        await result.current.update('1', { value: 'updated' });
      });
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(result.current.data[0].value).toBe('test1');
    expect(result.current.pendingUpdates[0].status).toBe('error');
    expect(result.current.pendingUpdates[0].error).toBe(error);
  });
});

describe('RefreshableContainer', () => {
  it('renders children and refresh button', () => {
    render(
      <RefreshableContainer onRefresh={jest.fn()}>
        <div>Test Content</div>
      </RefreshableContainer>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('handles refresh click', async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);

    render(
      <RefreshableContainer onRefresh={onRefresh}>
        <div>Test Content</div>
      </RefreshableContainer>
    );

    const button = screen.getByText('Refresh');
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(onRefresh).toHaveBeenCalled();
    expect(button).toBeEnabled();
  });

  it('disables button during refresh', async () => {
    let resolveRefresh: () => void;
    const onRefresh = jest.fn().mockImplementation(
      () => new Promise(resolve => { resolveRefresh = resolve; })
    );

    render(
      <RefreshableContainer onRefresh={onRefresh}>
        <div>Test Content</div>
      </RefreshableContainer>
    );

    const button = screen.getByText('Refresh');
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();

    await act(async () => {
      resolveRefresh!();
      await Promise.resolve();
    });

    expect(button).toBeEnabled();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });
});

describe('useScheduledTasks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes tasks from config', async () => {
    const schedules = createDefaultSchedules();
    const { result } = renderHook(() => useScheduledTasks(schedules));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.activeTaskIds).toHaveLength(schedules.length);
  });

  it('allows task cancellation', async () => {
    const schedules = createDefaultSchedules();
    const { result } = renderHook(() => useScheduledTasks(schedules));

    await act(async () => {
      await Promise.resolve();
    });

    const taskId = result.current.activeTaskIds[0];

    await act(async () => {
      await result.current.cancelScheduledTask(taskId);
    });

    expect(result.current.activeTaskIds).not.toContain(taskId);
  });
});

describe('createDefaultSchedules', () => {
  it('creates default schedules with correct configuration', () => {
    const schedules = createDefaultSchedules();

    expect(schedules).toHaveLength(3);
    expect(schedules).toContainEqual(expect.objectContaining({
      type: 'insight',
      schedule: { type: 'interval', value: '3600000' }
    }));
    expect(schedules).toContainEqual(expect.objectContaining({
      type: 'report',
      schedule: { type: 'cron', value: '0 0 * * 1' }
    }));
    expect(schedules).toContainEqual(expect.objectContaining({
      type: 'sync',
      schedule: { type: 'interval', value: '900000' }
    }));
  });
});
