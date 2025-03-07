import React from 'react';
import { Card } from '../../common/Card';
import { useForm } from '../../../hooks/useForm';
import { Button } from '../../common/Button';
import { useAuth } from '../../../hooks/useAuth';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export const ProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  // Get address info safely
  const address = (user as any)?.address || {};

  const { values, setFieldValue, handleSubmit, isSubmitting } = useForm<ProfileFormData>({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || ''
    },
    onSubmit: async (values) => {
      await updateProfile(values);
    }
  });

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Profile Information</h2>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={values.name}
              onChange={(e) => setFieldValue('name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={(e) => setFieldValue('email', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={values.phone}
              onChange={(e) => setFieldValue('phone', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium">Address Information</h3>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={values.address}
              onChange={(e) => setFieldValue('address', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={values.city}
                onChange={(e) => setFieldValue('city', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={values.state}
                onChange={(e) => setFieldValue('state', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={values.zipCode}
              onChange={(e) => setFieldValue('zipCode', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}; 