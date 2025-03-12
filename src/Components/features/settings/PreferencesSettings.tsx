import React from 'react';
import { Card, CardHeader, CardContent } from "../../ui/card";
import { Switch } from "../../ui/switch";
import { useSettings } from '../../../hooks/useSettings';
import { useTheme } from '../../../contexts/ThemeContext';
import { EnhancedSelect } from '../../../components/ui/enhanced-select';

export const PreferencesSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { isDarkMode, toggleTheme } = useTheme();

  // If settings are null, show a loading state
  if (!settings) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Display & Preferences</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Theme</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <Switch
                  id="theme-toggle"
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
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
            <EnhancedSelect
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "JPY", label: "JPY (¥)" }
              ]}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium">Date Format</h3>
            <EnhancedSelect
              value={settings.dateFormat}
              onChange={(e) => updateSettings({ dateFormat: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              options={[
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }
              ]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 