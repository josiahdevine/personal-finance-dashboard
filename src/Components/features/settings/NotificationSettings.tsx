import React from 'react';
import { Card } from '../../common/Card';
import { useNotifications } from '../../../hooks/useNotifications';

export const NotificationSettings: React.FC = () => {
  const { preferences, updatePreferences } = useNotifications();

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Notification Settings</h2>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Notification Channels</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={preferences.email}
                  onChange={(e) => updatePreferences({
                    email: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push-notifications"
                  checked={preferences.push}
                  onChange={(e) => updatePreferences({
                    push: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700">
                  Push Notifications
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Notification Types</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bills-notifications"
                  checked={preferences.types.bills}
                  onChange={(e) => updatePreferences({
                    types: {
                      ...preferences.types,
                      bills: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="bills-notifications" className="ml-2 block text-sm text-gray-700">
                  Bill Reminders
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="budget-notifications"
                  checked={preferences.types.budgetAlerts}
                  onChange={(e) => updatePreferences({
                    types: {
                      ...preferences.types,
                      budgetAlerts: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="budget-notifications" className="ml-2 block text-sm text-gray-700">
                  Budget Alerts
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="goals-notifications"
                  checked={preferences.types.goals}
                  onChange={(e) => updatePreferences({
                    types: {
                      ...preferences.types,
                      goals: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="goals-notifications" className="ml-2 block text-sm text-gray-700">
                  Goal Progress
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="unusual-activity-notifications"
                  checked={preferences.types.unusualActivity}
                  onChange={(e) => updatePreferences({
                    types: {
                      ...preferences.types,
                      unusualActivity: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="unusual-activity-notifications" className="ml-2 block text-sm text-gray-700">
                  Unusual Activity
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}; 