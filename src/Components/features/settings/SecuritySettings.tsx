import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useForm } from '../../../hooks/useForm';
import { useAuth } from '../../../contexts/AuthContext';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const SecuritySettings: React.FC = () => {
  const { updatePassword } = useAuth();
  
  const validatePasswords = (values: PasswordFormData) => {
    const errors: Record<string, string> = {};
    
    if (!values.currentPassword) errors.currentPassword = 'Current password is required';
    if (!values.newPassword) errors.newPassword = 'New password is required';
    if (values.newPassword && values.newPassword.length < 8) 
      errors.newPassword = 'Password must be at least 8 characters';
    if (values.newPassword !== values.confirmPassword) 
      errors.confirmPassword = 'Passwords do not match';
    
    return errors;
  };

  const [formState, formHandlers] = useForm<PasswordFormData>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validate: validatePasswords,
    onSubmit: async (values) => {
      await updatePassword(values.currentPassword, values.newPassword);
    }
  });
  
  const { values, errors, isSubmitting } = formState;
  const { handleSubmit, setFieldValue } = formHandlers;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Security Settings</h2>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Change Password</h3>
            
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <Input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={values.currentPassword}
                onChange={(e) => setFieldValue('currentPassword', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <Input
                type="password"
                name="newPassword"
                id="newPassword"
                value={values.newPassword}
                onChange={(e) => setFieldValue('newPassword', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <Input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={values.confirmPassword}
                onChange={(e) => setFieldValue('confirmPassword', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 mt-1">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {/* TODO: Implement 2FA setup */}}
              >
                Set Up Two-Factor Authentication
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};