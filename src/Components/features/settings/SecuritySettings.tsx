import React, { useState } from 'react';
import Card from "../../common/Card";
import { useForm } from '../../../hooks/useForm';
import { validatePassword } from '../../../utils/validation';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const SecuritySettings: React.FC = () => {
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  // Mock function for password change
  const changePassword = async (currentPassword: string, newPassword: string) => {
    console.log('Changing password:', { currentPassword, newPassword });
    // In a real app, this would call an API
    return Promise.resolve();
  };

  const { values, setFieldValue, handleSubmit, isSubmitting, errors } = useForm<PasswordFormData>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validate: (values) => {
      const errors: Partial<Record<keyof PasswordFormData, string>> = {};
      
      if (!values.currentPassword) {
        errors.currentPassword = 'Current password is required';
      }
      
      if (!values.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (!validatePassword(values.newPassword)) {
        errors.newPassword = 'Password must be at least 8 characters with a number and special character';
      }
      
      if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      try {
        // Use the mock function
        await changePassword(values.currentPassword, values.newPassword);
        // Reset form after successful submission
        values.currentPassword = '';
        values.newPassword = '';
        values.confirmPassword = '';
      } catch (error) {
        console.error('Failed to change password:', error);
      }
    }
  });

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Security Settings</h2>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={values.currentPassword}
                onChange={(e) => setFieldValue('currentPassword', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors?.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={values.newPassword}
                onChange={(e) => setFieldValue('newPassword', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors?.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={(e) => setFieldValue('confirmPassword', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors?.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button
                onClick={() => setShowTwoFactor(!showTwoFactor)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {showTwoFactor ? 'Hide' : 'Setup'}
              </button>
            </div>

            {showTwoFactor && (
              <div className="mt-4">
                {/* Two-factor authentication setup UI */}
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}; 