import React from 'react';
import { Tab } from '@headlessui/react';
import { ProfileSettings } from './ProfileSettings';
import { SecuritySettings } from './SecuritySettings';
import { PreferencesSettings } from './PreferencesSettings';
import { NotificationSettings } from './NotificationSettings';
import { AccountSettings } from './AccountSettings';
import { CategorySettings } from './CategorySettings';
import { ImportExportSettings } from './ImportExportSettings';
import { IntegrationSettings } from './IntegrationSettings';
import { APIKeySettings } from './APIKeySettings';
import { BackupSettings } from './BackupSettings';

const settingsTabs = [
  { name: 'Profile', component: ProfileSettings },
  { name: 'Security', component: SecuritySettings },
  { name: 'Preferences', component: PreferencesSettings },
  { name: 'Notifications', component: NotificationSettings },
  { name: 'Accounts', component: AccountSettings },
  { name: 'Categories', component: CategorySettings },
  { name: 'Import/Export', component: ImportExportSettings },
  { name: 'Integrations', component: IntegrationSettings },
  { name: 'API Keys', component: APIKeySettings },
  { name: 'Backups', component: BackupSettings }
];

export const SettingsLayout: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Tab.Group>
        <div className="border-b border-gray-200">
          <Tab.List className="-mb-px flex space-x-8">
            {settingsTabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    selected
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
        </div>

        <Tab.Panels className="mt-6">
          {settingsTabs.map((tab) => (
            <Tab.Panel key={tab.name}>
              <tab.component />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}; 