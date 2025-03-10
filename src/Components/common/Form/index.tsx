import React, { createContext, useContext, useState, useCallback } from 'react';
import clsx from 'clsx';

// Types for form state management
interface FormState {
  values: Record<string, any>;
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Props for the Form component
interface FormProps {
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>, event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onReset?: () => void;
  validate?: (values: Record<string, any>) => Record<string, string>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  children: React.ReactNode;
  className?: string;
  noValidate?: boolean;
  id?: string;
  action?: string;
  method?: string;
  encType?: string;
  target?: string;
  autoComplete?: string;
}

// Context for form state and methods
interface FormContextType {
  state: FormState;
  registerField: (name: string, value: any) => void;
  setFieldValue: (name: string, value: any) => void;
  setFieldTouched: (name: string, isTouched: boolean) => void;
  setFieldError: (name: string, error: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleReset: () => void;
  resetForm: () => void;
}

// Create form context
const FormContext = createContext<FormContextType | undefined>(undefined);

// Helper to use the form context
export const useForm = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a Form component');
  }
  return context;
};

export const Form = Object.assign(
  ({ 
    initialValues = {},
    onSubmit,
    onReset,
    validate,
    validateOnChange = true,
    validateOnBlur = true,
    children,
    className = '',
    ...props
  }: FormProps) => {
    // Initialize form state
    const [state, setState] = useState<FormState>({
      values: initialValues,
      touched: {},
      errors: {},
      isValid: true,
      isSubmitting: false,
    });

    // Validate the form
    const validateForm = useCallback(
      (values: Record<string, any> = state.values) => {
        if (!validate) return {};
        
        const errors = validate(values);
        const isValid = Object.keys(errors).length === 0;
        
        setState(prevState => ({
          ...prevState,
          errors,
          isValid,
        }));
        
        return errors;
      },
      [validate, state.values]
    );

    // Register a field in the form
    const registerField = useCallback(
      (name: string, value: any) => {
        if (state.values[name] === undefined) {
          setState(prevState => ({
            ...prevState,
            values: {
              ...prevState.values,
              [name]: value,
            },
          }));
        }
      },
      [state.values]
    );

    // Set a field's value
    const setFieldValue = useCallback(
      (name: string, value: any) => {
        setState(prevState => {
          const newValues = {
            ...prevState.values,
            [name]: value,
          };
          
          // Validate on change if enabled
          let newErrors = prevState.errors;
          let isValid = prevState.isValid;
          
          if (validateOnChange && validate) {
            newErrors = validate(newValues);
            isValid = Object.keys(newErrors).length === 0;
          }
          
          return {
            ...prevState,
            values: newValues,
            errors: newErrors,
            isValid,
          };
        });
      },
      [validate, validateOnChange]
    );

    // Mark a field as touched (usually on blur)
    const setFieldTouched = useCallback(
      (name: string, isTouched = true) => {
        setState(prevState => {
          const newTouched = {
            ...prevState.touched,
            [name]: isTouched,
          };
          
          // Validate on blur if enabled
          let newErrors = prevState.errors;
          let isValid = prevState.isValid;
          
          if (validateOnBlur && validate && isTouched) {
            newErrors = validate(prevState.values);
            isValid = Object.keys(newErrors).length === 0;
          }
          
          return {
            ...prevState,
            touched: newTouched,
            errors: newErrors,
            isValid,
          };
        });
      },
      [validate, validateOnBlur]
    );

    // Set a field error manually
    const setFieldError = useCallback(
      (name: string, error: string) => {
        setState(prevState => {
          const newErrors = {
            ...prevState.errors,
            [name]: error,
          };
          
          return {
            ...prevState,
            errors: newErrors,
            isValid: Object.keys(newErrors).length === 0,
          };
        });
      },
      []
    );

    // Handle form submission
    const handleSubmit = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validate all fields before submission
        setState(prevState => ({
          ...prevState,
          isSubmitting: true,
        }));
        
        // Run validation
        const errors = validateForm();
        
        if (Object.keys(errors).length === 0 && onSubmit) {
          try {
            await onSubmit(state.values, e);
          } catch (error) {
            console.error('Form submission error:', error);
          }
        }
        
        setState(prevState => ({
          ...prevState,
          isSubmitting: false,
        }));
      },
      [state.values, validateForm, onSubmit]
    );

    // Handle form reset
    const handleReset = useCallback(() => {
      resetForm();
      if (onReset) {
        onReset();
      }
    }, [onReset]);

    // Reset the form to initial state
    const resetForm = useCallback(() => {
      setState({
        values: initialValues,
        touched: {},
        errors: {},
        isValid: true,
        isSubmitting: false,
      });
    }, [initialValues]);

    // Create context value
    const contextValue: FormContextType = {
      state,
      registerField,
      setFieldValue,
      setFieldTouched,
      setFieldError,
      handleSubmit,
      handleReset,
      resetForm,
    };

    return (
      <FormContext.Provider value={contextValue}>
        <form
          onSubmit={handleSubmit}
          onReset={handleReset}
          className={clsx('space-y-4', className)}
          noValidate
          {...props}
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  },
  {
    Field: FormField,
    SubmitButton,
    ResetButton
  }
);

// FormField component for managing individual fields
interface FormFieldProps {
  name: string;
  children: React.ReactNode | ((props: FormFieldRenderProps) => React.ReactNode);
  label?: string;
  helperText?: string;
  className?: string;
}

interface FormFieldRenderProps {
  id: string;
  name: string;
  value: any;
  error: string | undefined;
  touched: boolean;
  isValid: boolean;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
}

export function FormField({
  name,
  children,
  label: _label,
  helperText: _helperText,
  className = '',
}: FormFieldProps) {
  const { state, setFieldValue, setFieldTouched } = useForm();
  const id = `field-${name}`;
  const value = state.values[name];
  const error = state.errors[name];
  const touched = !!state.touched[name];
  const isValid = !error;

  const handleChange = (e: React.ChangeEvent<any>) => {
    const fieldValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFieldValue(name, fieldValue);
  };

  const handleBlur = (_e: React.FocusEvent<any>) => {
    setFieldTouched(name, true);
  };

  const fieldProps: FormFieldRenderProps = {
    id,
    name,
    value,
    error,
    touched,
    isValid,
    onChange: handleChange,
    onBlur: handleBlur,
  };

  return (
    <div className={clsx('form-field', className)}>
      {typeof children === 'function' ? children(fieldProps) : children}
    </div>
  );
}

// Submit button component
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function SubmitButton({
  loading,
  children,
  disabled,
  className = '',
  ...props
}: SubmitButtonProps) {
  const { state } = useForm();
  const isDisabled = disabled || state.isSubmitting || !state.isValid;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={clsx(
        'btn btn-primary',
        (isDisabled || loading) && 'opacity-70 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading || state.isSubmitting ? (
        <div className="flex items-center">
          <svg className="animate-spinner h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Reset button component
interface ResetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function ResetButton({
  children,
  className = '',
  ...props
}: ResetButtonProps) {
  return (
    <button
      type="reset"
      className={clsx('btn btn-secondary', className)}
      {...props}
    >
      {children}
    </button>
  );
} 