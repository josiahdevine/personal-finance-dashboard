import React from 'react';
import Card from "../../common/Card";
import Button from "../../common/button/Button";
import { useIntegrations } from '../../../hooks/useIntegrations';
import { Switch } from '../../common/Switch';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';

// Mock data and types for development
interface MockIntegration {
  id: string;
  name: string;
  type: "plaid" | "stripe" | "quickbooks" | "custom";
  status: string;
  icon: string;
  isConnected: boolean;
  settings?: Record<string, boolean>;
}

export const IntegrationSettings: React.FC = () => {
  const { 
    integrations: rawIntegrations, 
    addIntegration, 
    removeIntegration, 
    syncIntegration,
    updateIntegration 
  } = useIntegrations();

  // Convert to mock type for development
  const integrations = rawIntegrations as unknown as MockIntegration[];

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Connected Services</h2>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          {integrations.map((integration) => (
            <div 
              key={integration.id}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={integration.icon} 
                    alt={integration.name}
                    className="w-8 h-8 rounded"
                  />
                  <div>
                    <h3 className="font-medium">{integration.name}</h3>
                    <p className="text-sm text-gray-500">
                      {integration.isConnected ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                </div>
                
                {integration.isConnected ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => syncIntegration(integration.id)}
                      className="p-2"
                    >
                      <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => removeIntegration(integration.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => addIntegration({
                      type: integration.type,
                      name: integration.name,
                      settings: {}
                    })}
                  >
                    Connect
                  </Button>
                )}
              </div>

              {integration.isConnected && integration.settings && (
                <div className="space-y-3 pt-3 border-t">
                  <h4 className="text-sm font-medium">Integration Settings</h4>
                  {Object.entries(integration.settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <Switch
                        checked={value}
                        onChange={(checked) => 
                          updateIntegration(integration.id, {
                            settings: {
                              ...integration.settings,
                              [key]: checked
                            }
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {integration.isConnected && integration.status && (
                <div className="flex items-center space-x-2 pt-3 border-t">
                  {integration.status === 'healthy' ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600">
                        Integration working properly
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-red-600">
                        {integration.status}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}; 