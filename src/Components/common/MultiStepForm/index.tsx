import React, { useState, useCallback } from 'react';

interface Step {
  id: string;
  title: string;
  component: React.ReactNode;
  validationSchema?: any;
}

interface MultiStepFormProps {
  steps: Step[];
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  submitButtonText?: string;
  showStepIndicator?: boolean;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  initialValues,
  onSubmit,
  submitButtonText = 'Submit',
  showStepIndicator = true,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formValues, setFormValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  
  const handleNext = useCallback(
    async (stepData: Record<string, any>) => {
      const newValues = { ...formValues, ...stepData };
      setFormValues(newValues);
      
      if (isLastStep) {
        try {
          setIsSubmitting(true);
          await onSubmit(newValues);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setCurrentStepIndex(index => index + 1);
      }
    },
    [formValues, isLastStep, onSubmit]
  );
  
  const handlePrevious = useCallback(() => {
    setCurrentStepIndex(index => index - 1);
  }, []);
  
  const handleStepClick = useCallback(
    (index: number) => {
      // Only allow navigating to completed steps or the next available step
      if (index <= currentStepIndex + 1) {
        setCurrentStepIndex(index);
      }
    },
    [currentStepIndex]
  );
  
  return (
    <div className="w-full">
      {showStepIndicator && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex flex-col items-center ${
                    index <= currentStepIndex ? 'cursor-pointer' : 'opacity-50'
                  }`}
                  onClick={() => handleStepClick(index)}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : index === currentStepIndex
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-sm">{step.title}</div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        {React.cloneElement(currentStep.component as React.ReactElement, {
          initialValues: formValues,
          onSubmit: handleNext,
          onBack: isFirstStep ? undefined : handlePrevious,
          isSubmitting,
          isLastStep,
          submitButtonText: isLastStep ? submitButtonText : 'Next',
          backButtonText: 'Previous',
        })}
      </div>
    </div>
  );
} 