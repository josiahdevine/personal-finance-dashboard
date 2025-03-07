import React from 'react';
import { Card } from '../../common/Card';
import { useSettings } from '../../../hooks/useSettings';
import { useTheme } from '../../../hooks/useTheme';

export const PreferencesSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();

  // If settings are null, show a loading state
  if (!settings) {
    return (
      <Card>
        <Card.Body>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Display & Preferences</h2>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Theme</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="theme-toggle"
                  className="ml-2 text-sm text-gray-600"
                >
                  Dark Mode
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Currency Display</h3>
            <select
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <div>
            <h3 className="text-lg font-medium">Date Format</h3>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSettings({ dateFormat: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}; 