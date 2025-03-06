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
            <h3 className="text-lg font-medium">Notification Channels</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={preferences.channels.email}
                  onChange={(e) => updatePreferences({
                    channels: {
                      ...preferences.channels,
                      email: e.target.checked
                    }
                  })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="email-notifications" className="ml-2 text-sm text-gray-600">
                  Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push-notifications"
                  checked={preferences.channels.push}
                  onChange={(e) => updatePreferences({
                    channels: {
                      ...preferences.channels,
                      push: e.target.checked
                    }
                  })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="push-notifications" className="ml-2 text-sm text-gray-600">
                  Push Notifications
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Notification Types</h3>
            <div className="mt-2 space-y-2">
              {Object.entries(preferences.types).map(([type, enabled]) => (
                <div key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`notification-${type}`}
                    checked={enabled}
                    onChange={(e) => updatePreferences({
                      types: {
                        ...preferences.types,
                        [type]: e.target.checked
                      }
                    })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`notification-${type}`}
                    className="ml-2 text-sm text-gray-600 capitalize"
                  >
                    {type.replace(/-/g, ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Notification Schedule</h3>
            <div className="mt-2 space-y-4">
              <div>
                <label className="block text-sm text-gray-600">
                  Quiet Hours Start
                </label>
                <input
                  type="time"
                  value={preferences.schedule.quietHoursStart}
                  onChange={(e) => updatePreferences({
                    schedule: {
                      ...preferences.schedule,
                      quietHoursStart: e.target.value
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Quiet Hours End
                </label>
                <input
                  type="time"
                  value={preferences.schedule.quietHoursEnd}
                  onChange={(e) => updatePreferences({
                    schedule: {
                      ...preferences.schedule,
                      quietHoursEnd: e.target.value
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