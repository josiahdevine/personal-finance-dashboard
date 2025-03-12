import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useForm } from '../../../hooks/useForm';
import { useAuth } from '../../../hooks/useAuth';
import { Address, User } from '../../../types/user';

// We need to handle both the Firebase User type and our application's User type
// Using User directly with type assertion to avoid type conflicts
type ExtendedUser = User;

// Interface for the form data
interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

// Interface for the update profile data that matches the auth service
interface UpdateProfileData {
  name: string;
  email: string;
  phone: string;
  // Using custom property to match the updateProfile function expectations
  customData?: {
    address: Address;
  };
}

export const ProfileSettings: React.FC = () => {
  const auth = useAuth();
  // Use type assertion to treat auth.user as our extended user type
  const user = auth.user as unknown as ExtendedUser;
  const updateProfile = auth.updateProfile;
  
  // Fallbacks in case the user object is incomplete
  const address = (user?.address || {}) as Address;

  const [formState, formHandlers] = useForm<ProfileFormData>({
    initialValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
    },
    onSubmit: async (values) => {
      // Cast the update data to match what the auth service expects
      await updateProfile({
        name: values.name,
        email: values.email,
        phone: values.phone,
        customData: {
          address: {
            street: values.street,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
          }
        }
      } as UpdateProfileData);
    }
  });
  
  const { values, isSubmitting } = formState;
  const { handleSubmit, setFieldValue } = formHandlers;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Profile Information</h2>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
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
            <Input
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
            <Input
              id="phone"
              name="phone"
              value={values.phone}
              onChange={(e) => setFieldValue('phone', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-3">Address Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <Input
                  id="street"
                  name="street"
                  value={values.street}
                  onChange={(e) => setFieldValue('street', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <Input
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
                  <Input
                    id="state"
                    name="state"
                    value={values.state}
                    onChange={(e) => setFieldValue('state', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    Zip Code
                  </label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={values.zipCode}
                    onChange={(e) => setFieldValue('zipCode', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit" 
            variant="default"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
