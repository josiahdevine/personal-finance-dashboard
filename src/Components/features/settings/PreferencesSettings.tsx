import React from 'react';
import { Card } from '../../common/Card';
import { useSettings } from '../../../hooks/useSettings';
import { useTheme } from '../../../hooks/useTheme';

export const PreferencesSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();

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
              {['light', 'dark', 'system'].map((themeOption) => (
                <div key={themeOption} className="flex items-center">
                  <input
                    type="radio"
                    id={`theme-${themeOption}`}
                    name="theme"
                    value={themeOption}
                    checked={theme === themeOption}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`theme-${themeOption}`}
                    className="ml-2 text-sm text-gray-600 capitalize"
                  >
                    {themeOption}
                  </label>
                </div>
              ))}
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

          <div>
            <h3 className="text-lg font-medium">Dashboard View</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-net-worth"
                  checked={settings.dashboardPreferences.showNetWorth}
                  onChange={(e) => updateSettings({
                    dashboardPreferences: {
                      ...settings.dashboardPreferences,
                      showNetWorth: e.target.checked
                    }
                  })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="show-net-worth" className="ml-2 text-sm text-gray-600">
                  Show Net Worth
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-goals"
                  checked={settings.dashboardPreferences.showGoals}
                  onChange={(e) => updateSettings({
                    dashboardPreferences: {
                      ...settings.dashboardPreferences,
                      showGoals: e.target.checked
                    }
                  })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="show-goals" className="ml-2 text-sm text-gray-600">
                  Show Financial Goals
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-insights"
                  checked={settings.dashboardPreferences.showInsights}
                  onChange={(e) => updateSettings({
                    dashboardPreferences: {
                      ...settings.dashboardPreferences,
                      showInsights: e.target.checked
                    }
                  })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="show-insights" className="ml-2 text-sm text-gray-600">
                  Show Financial Insights
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Alert Thresholds</h3>
            <div className="mt-2 space-y-4">
              <div>
                <label className="block text-sm text-gray-600">
                  Low Balance Alert
                </label>
                <input
                  type="number"
                  value={settings.alertThresholds.lowBalance}
                  onChange={(e) => updateSettings({
                    alertThresholds: {
                      ...settings.alertThresholds,
                      lowBalance: Number(e.target.value)
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Large Transaction Alert
                </label>
                <input
                  type="number"
                  value={settings.alertThresholds.largeTransaction}
                  onChange={(e) => updateSettings({
                    alertThresholds: {
                      ...settings.alertThresholds,
                      largeTransaction: Number(e.target.value)
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}; 