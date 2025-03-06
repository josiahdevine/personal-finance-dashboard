import React, { useState } from 'react';
import {
  UserCircleIcon,
  CreditCardIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface UserProfile {
  username: string;
  email: string;
  subscriptionPlan: 'monthly' | 'annual';
  nextBillingDate: string;
  nextBillingAmount: number;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export const Profile: React.FC = () => {
  // Mock user data - replace with real data from your backend
  const [profile, setProfile] = useState<UserProfile>({
    username: 'johndoe',
    email: 'john.doe@example.com',
    subscriptionPlan: 'annual',
    nextBillingDate: '2024-12-31',
    nextBillingAmount: 99.99,
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
  });

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(profile.email);

  const handleEmailUpdate = () => {
    setProfile({ ...profile, email: newEmail });
    setIsEditingEmail(false);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>

        <div className="mt-6 space-y-8">
          {/* Account Information */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Account Information</h3>
              <div className="mt-6 grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <div className="mt-1 flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{profile.username}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 flex items-center">
                    {isEditingEmail ? (
                      <div className="flex-1 flex space-x-2">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="flex-1 block w-full min-w-0 rounded-md sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={handleEmailUpdate}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingEmail(false)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900">{profile.email}</span>
                        </div>
                        <button
                          onClick={() => setIsEditingEmail(true)}
                          className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Subscription Details</h3>
              <div className="mt-6 grid grid-cols-1 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {profile.subscriptionPlan.charAt(0).toUpperCase() + profile.subscriptionPlan.slice(1)} Plan
                      </span>
                    </div>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Change Plan
                    </button>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Next billing on {profile.nextBillingDate} for ${profile.nextBillingAmount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Preferences</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">Email Notifications</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.email}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            email: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">Push Notifications</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.push}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            push: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">SMS Notifications</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.sms}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            sms: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy and Security */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Privacy & Security</h3>
              <div className="mt-6 space-y-4">
                <button className="flex items-center text-gray-700 hover:text-gray-900">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Change Password
                </button>
                <button className="flex items-center text-gray-700 hover:text-gray-900">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Privacy Policy
                </button>
                <button className="flex items-center text-gray-700 hover:text-gray-900">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 