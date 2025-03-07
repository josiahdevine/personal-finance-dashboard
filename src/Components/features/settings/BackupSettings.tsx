import React from 'react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { useBackups } from '../../../hooks/useBackups';
import { CloudArrowUpIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';

export const BackupSettings: React.FC = () => {
  const { 
    backups,
    createBackup,
    restoreBackup,
    deleteBackup,
    creatingBackup,
    restoringBackup
  } = useBackups();

  const handleCreateBackup = () => {
    createBackup('full', 'Manual Backup');
  };

  return (
    <Card>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Data Backups</h2>
        <Button
          variant="primary"
          onClick={handleCreateBackup}
          disabled={creatingBackup}
          className="flex items-center"
        >
          <CloudArrowUpIcon className="h-5 w-5 mr-2" />
          Create Backup
        </Button>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">
              Automatic Backups
            </h3>
            <p className="mt-1 text-sm text-blue-600">
              Your data is automatically backed up daily. We keep the last 30 days of backups.
            </p>
          </div>

          <div className="space-y-4">
            {backups.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No backups available
              </p>
            ) : (
              backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">
                      {new Date(backup.createdAt).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Size: {backup.size}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => restoreBackup(backup.id)}
                      disabled={restoringBackup}
                      className="flex items-center"
                    >
                      <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                      Restore
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => deleteBackup(backup.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}; 