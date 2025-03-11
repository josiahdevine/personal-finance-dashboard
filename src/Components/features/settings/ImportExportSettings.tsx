import React, { useState } from 'react';
import Card from "../../common/Card";
import Button from "../../common/button/Button";
import { useExport } from '../../../hooks/useExport';
import { useImport } from '../../../hooks/useImport';
import { CloudArrowUpIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';

export const ImportExportSettings: React.FC = () => {
  const { exportData } = useExport();
  const { startImport, importing } = useImport();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    await startImport(selectedFile);
    setSelectedFile(null);
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Import & Export Data</h2>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Export Data</h3>
            <p className="text-sm text-gray-500 mt-1">
              Download your financial data in CSV or JSON format
            </p>
            <div className="mt-4 flex space-x-4">
              <Button
                variant="secondary"
                onClick={() => exportData({ format: 'csv' })}
                className="flex items-center"
              >
                <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                Export as CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() => exportData({ format: 'json' })}
                className="flex items-center"
              >
                <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                Export as JSON
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Import Data</h3>
            <p className="text-sm text-gray-500 mt-1">
              Import your financial data from a CSV or JSON file
            </p>
            <div className="mt-4">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {selectedFile && (
                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={handleImport}
                    isDisabled={importing}
                    className="flex items-center"
                  >
                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                    Import
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}; 