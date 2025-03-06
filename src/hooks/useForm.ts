import { useState, useCallback, FormEvent } from 'react';

interface FormConfig<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: FormConfig<T>) => {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false
  });

  const validateForm = useCallback((values: T) => {
    if (!validate) return {};
    return validate(values);
  }, [validate]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value
      },
      touched: {
        ...prev.touched,
        [field]: true
      }
    }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: isTouched
      }
    }));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm(state.values);
    setState(prev => ({
      ...prev,
      errors,
      touched: Object.keys(prev.values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Record<keyof T, boolean>)
    }));

    if (Object.keys(errors).length === 0) {
      setState(prev => ({ ...prev, isSubmitting: true }));
      try {
        await onSubmit(state.values);
      } finally {
        setState(prev => ({ ...prev, isSubmitting: false }));
      }
    }
  }, [state.values, validateForm, onSubmit]);

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false
    });
  }, [initialValues]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    resetForm
  };
}; 