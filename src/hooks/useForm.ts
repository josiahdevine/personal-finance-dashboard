import { useState, useCallback, useEffect } from 'react';

interface FormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => Record<string, string>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

interface FormHandlers {
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setFieldValue: (field: string, value: any) => void;
  setFieldTouched: (field: string, isTouched?: boolean) => void;
  resetForm: () => void;
}

export function useForm<T extends Record<string, any>>(options: FormOptions<T>): [FormState<T>, FormHandlers] {
  const {
    initialValues,
    onSubmit,
    validate,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;
  
  // Initialize form state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Run validation and update errors
  const validateForm = useCallback(() => {
    if (!validate) return {};
    
    const newErrors = validate(values);
    setErrors(newErrors);
    return newErrors;
  }, [values, validate]);
  
  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;
  
  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);
  
  // Handle field change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setValues(prevValues => {
      // Handle special input types
      let newValue: any = value;
      
      if (type === 'number') {
        newValue = value === '' ? '' : Number(value);
      } else if (type === 'checkbox') {
        const target = e.target as HTMLInputElement;
        newValue = target.checked;
      }
      
      return { ...prevValues, [name]: newValue };
    });
    
    setIsDirty(true);
    
    if (validateOnChange) {
      validateForm();
    }
  }, [validateForm, validateOnChange]);
  
  // Handle field blur
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    if (validateOnBlur) {
      validateForm();
    }
  }, [validateForm, validateOnBlur]);
  
  // Set a field value programmatically
  const setFieldValue = useCallback((field: string, value: any) => {
    setValues(prevValues => ({
      ...prevValues,
      [field]: value
    }));
    
    setIsDirty(true);
    
    if (validateOnChange) {
      validateForm();
    }
  }, [validateForm, validateOnChange]);
  
  // Set a field touched state programmatically
  const setFieldTouched = useCallback((field: string, isTouched = true) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [field]: isTouched
    }));
    
    if (validateOnBlur && isTouched) {
      validateForm();
    }
  }, [validateForm, validateOnBlur]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Set all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allTouched);
    
    // Validate form
    const formErrors = validate ? validate(values) : {};
    setErrors(formErrors);
    
    // Only submit if there are no errors
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);
  
  // Run validation when initialValues change
  useEffect(() => {
    if (validate) {
      validateForm();
    }
  }, [initialValues, validate, validateForm]);
  
  return [
    { values, errors, touched, isSubmitting, isValid, isDirty },
    { handleChange, handleBlur, handleSubmit, setFieldValue, setFieldTouched, resetForm }
  ];
} 