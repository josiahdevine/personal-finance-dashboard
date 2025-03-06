import React from 'react';
import { Card } from '../../common/Card';
import { useForm } from '../../../hooks/useForm';
import { useAuth } from '../../../hooks/useAuth';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export const ProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  const { values, handleChange, handleSubmit, isSubmitting } = useForm<ProfileFormData>({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      notifications: user?.preferences?.notifications || {
        email: true,
        push: true
      }
    },
    onSubmit: async (values) => {
      await updateProfile(values);
    }
  });

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Profile Settings</h2>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={values.notifications.email}
                  onChange={(e) => handleChange('notifications.email', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="email-notifications" className="ml-2 text-sm text-gray-600">
                  Email notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push-notifications"
                  checked={values.notifications.push}
                  onChange={(e) => handleChange('notifications.push', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="push-notifications" className="ml-2 text-sm text-gray-600">
                  Push notifications
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}; 