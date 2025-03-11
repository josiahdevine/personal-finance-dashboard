import React, { useState } from 'react';
import Card from "../../common/Card";
import Button from "../../common/button/Button";
import { useAPIKeys } from '../../../hooks/useAPIKeys';
import { EyeIcon, EyeSlashIcon, PlusIcon } from '@heroicons/react/24/outline';

export const APIKeySettings: React.FC = () => {
  const { 
    apiKeys, 
    createAPIKey, 
    revokeAPIKey,
    creatingAPIKey 
  } = useAPIKeys();
  
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  return (
    <Card>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">API Keys</h2>
        <Button
          variant="primary"
          onClick={() => createAPIKey({ name: 'New API Key' })}
          isDisabled={creatingAPIKey}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create API Key
        </Button>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          {apiKeys.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No API keys generated yet
            </p>
          ) : (
            apiKeys.map((key) => (
              <div
                key={key.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{key.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => revokeAPIKey(key.id)}
                  >
                    Revoke
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-gray-50 rounded font-mono text-sm">
                    {showKeys[key.id] ? key.key : '•'.repeat(40)}
                  </code>
                  <Button
                    variant="ghost"
                    onClick={() => toggleKeyVisibility(key.id)}
                    className="p-2"
                  >
                    {showKeys[key.id] ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Last used: {key.lastUsed || 'Never'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card.Body>
    </Card>
  );
}; 