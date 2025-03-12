import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useForm } from '../../../hooks/useForm';
import { useAuth } from '../../../contexts/AuthContext';
import { Address } from '../../../types/user';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  street: string; // Changed from address to street to match Address structure
  city: string;
  state: string;
  zipCode: string;
}

// Extended user type that includes properties we need for the form
interface ExtendedUser {
  id?: string;
  email?: string;
  name?: string;
  displayName?: string;
  phoneNumber?: string;
  address?: Address;
}

// Define the update profile data structure to match what the API expects
interface UpdateProfileData {
  name: string;
  email: string;
  phone: string;
  // Other properties that User accepts
  [key: string]: any;
}

export const ProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  // Cast user to our extended type
  const extendedUser = user as ExtendedUser;
  
  // Fallbacks in case the user object is incomplete
  const address = extendedUser?.address || {} as Address;

  const [formState, formHandlers] = useForm<ProfileFormData>({
    initialValues: {
      name: extendedUser?.displayName || extendedUser?.name || '',
      email: extendedUser?.email || '',
      phone: extendedUser?.phoneNumber || '',
      street: address.street || '', // Using the street field instead of address
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
    },
    onSubmit: async (values) => {
      if (typeof updateProfile === 'function') {
        // Create an update object that matches what the API expects
        const updateData: UpdateProfileData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
        };
        
        await updateProfile(updateData);
      }
    }
  });
  
  const { values, errors, isSubmitting } = formState;
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
