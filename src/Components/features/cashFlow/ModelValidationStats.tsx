import React from 'react';

interface ValidationMetrics {
  accuracy: number;
  meanAbsoluteError: number;
  meanSquaredError: number;
  rootMeanSquaredError: number;
  directionAccuracy: number;
  r2Score: number;
}

interface ModelValidationStatsProps {
  metrics: {
    modelType: string;
    metrics: ValidationMetrics;
    validationPeriod: {
      startDate: string;
      endDate: string;
    };
  };
}

export const ModelValidationStats: React.FC<ModelValidationStatsProps> = ({ metrics }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Accuracy</p>
          <p className="text-lg font-semibold">{metrics.metrics.accuracy.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Direction Accuracy</p>
          <p className="text-lg font-semibold">{metrics.metrics.directionAccuracy.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Mean Absolute Error</p>
          <p className="text-lg font-semibold">${metrics.metrics.meanAbsoluteError.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">R² Score</p>
          <p className="text-lg font-semibold">{metrics.metrics.r2Score.toFixed(1)}%</p>
        </div>
      </div>

      <div className="text-sm text-gray-500 mt-4">
        <p>Validation Period:</p>
        <p>
          {new Date(metrics.validationPeriod.startDate).toLocaleDateString()} -{' '}
          {new Date(metrics.validationPeriod.endDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}; 