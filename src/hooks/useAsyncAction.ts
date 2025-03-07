import { useState, useCallback } from 'react';

interface AsyncActionState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface AsyncActionOptions<TResult> {
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
}

export function useAsyncAction<TParams extends any[], TResult>(
  action: (...args: TParams) => Promise<TResult>,
  options?: AsyncActionOptions<TResult>
): {
  execute: (...args: TParams) => Promise<TResult>;
  data: TResult | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [state, setState] = useState<AsyncActionState<TResult>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: TParams): Promise<TResult> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await action(...args);
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (options?.onError) {
          options.onError(error);
        }
        setState({ data: null, isLoading: false, error });
        throw error;
      }
    },
    [action, options]
  );

  return {
    execute,
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
  };
} 