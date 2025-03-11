import React from 'react';
import Card from "../../common/Card";
import { useAnalytics } from '../../../hooks/useAnalytics';

export const RiskAssessment: React.FC = () => {
  const { analyticsData, loadingAnalytics } = useAnalytics();
  
  // Extract risk metrics from analytics data
  const riskMetrics = analyticsData?.riskMetrics;
  
  // Sample recommendations (since they're not in the original data model)
  const recommendations = [
    "Increase your emergency fund to cover at least 6 months of expenses",
    "Diversify your investment portfolio to reduce market risk",
    "Consider paying down high-interest debt more aggressively"
  ];

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Risk Assessment</h2>
      </Card.Header>
      <Card.Body>
        {loadingAnalytics ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Overall Risk Score</h3>
              <div className="mt-2 flex items-center">
                <span className={`text-3xl font-bold ${getRiskColor(riskMetrics?.overallRisk || 0)}`}>
                  {riskMetrics?.overallRisk || 0}
                </span>
                <span className="text-gray-600 ml-2">/ 100</span>
              </div>
            </div>

            <div className="space-y-4">
              {riskMetrics?.factors?.map(factor => (
                <div key={factor.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{factor.name}</span>
                    <span className={`text-sm ${getRiskColor(factor.score)}`}>
                      {factor.score}/100
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full bg-${factor.score >= 80 ? 'red' : 
                        factor.score >= 60 ? 'orange' : 
                        factor.score >= 40 ? 'yellow' : 'green'}-600`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {factor.impact === 'high' ? 'High impact risk factor' : 
                     factor.impact === 'medium' ? 'Medium impact risk factor' : 
                     'Low impact risk factor'}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Recommendations</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}; 