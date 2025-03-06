import { useState, useCallback } from 'react';

interface FormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Record<keyof T, string> | null;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: FormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors && errors[name]) {
      setErrors(prev => prev ? { ...prev, [name]: '' } : null);
    }
  }, [errors]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors) {
        setErrors(validationErrors);
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);
  
  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset: () => setValues(initialValues)
  };
} 