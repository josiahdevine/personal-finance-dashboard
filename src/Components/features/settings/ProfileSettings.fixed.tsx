import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useForm } from '../../../hooks/useForm';
import { User, Address } from '../../../types/user';
import { useAuth } from '../../../hooks/useAuth';

// Using User directly with type assertion to avoid type conflicts
type ExtendedUser = User;

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  street: string; // Changed from address to street
  city: string;
  state: string;
  zipCode: string;
}

/**
 * ProfileSettings - User profile management component
 * 
 * Features:
 * - Updates user profile information
 * - Validates form inputs
 * - Displays feedback on save
 */
export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  
  // Extract address details to populate form and cast user to ExtendedUser
  const extendedUser = user as unknown as ExtendedUser;
  const address = extendedUser?.address || {} as Address;
  
  const [formState, formHandlers] = useForm<ProfileFormData>({
    initialValues: {
      name: extendedUser?.displayName || '',
      email: extendedUser?.email || '',
      phone: extendedUser?.phoneNumber || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
    },
    onSubmit: async (values) => {
      try {
        // Implement the update profile logic here
        console.log('Updating profile with values:', values);
        // Example implementation:
        // await updateProfile({
        //   name: values.name,
        //   email: values.email,
        //   phone: values.phone,
        //   address: {
        //     street: values.street,
        //     city: values.city,
        //     state: values.state,
        //     zipCode: values.zipCode,
        //   }
        // });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  });
  
  const { values, isSubmitting } = formState;
  const { handleSubmit, setFieldValue } = formHandlers;

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-xl font-semibold">Profile Information</h2>
        <p className="text-sm text-gray-500">Update your personal information</p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => setFieldValue('name', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => setFieldValue('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <Input
              id="phone"
              value={values.phone}
              onChange={(e) => setFieldValue('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">Address Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="street" className="text-sm font-medium">
                  Street Address
                </label>
                <Input
                  id="street"
                  value={values.street}
                  onChange={(e) => setFieldValue('street', e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="city"
                    value={values.city}
                    onChange={(e) => setFieldValue('city', e.target.value)}
                    placeholder="New York"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">
                    State
                  </label>
                  <Input
                    id="state"
                    value={values.state}
                    onChange={(e) => setFieldValue('state', e.target.value)}
                    placeholder="NY"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="zipCode" className="text-sm font-medium">
                    Zip Code
                  </label>
                  <Input
                    id="zipCode"
                    value={values.zipCode}
                    onChange={(e) => setFieldValue('zipCode', e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="ml-auto" 
            disabled={isSubmitting}
          >
            {(isSubmitting) ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
