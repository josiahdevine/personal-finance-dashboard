import React, { useEffect, useRef } from 'react';
import Card from "../../../components/common/Card";
import Button from "../../../components/common/button/Button";
import { ResponsiveContainer } from '../../../components/layout/ResponsiveContainer';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowUpIcon, ArrowDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface HealthScoreComponent {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface HealthScoreWidgetProps {
  score: number;
  previousScore?: number;
  change?: number;
  components?: HealthScoreComponent[];
  topRecommendation?: string;
  isLoading?: boolean;
  onViewDetails?: () => void;
  className?: string;
}

// Helper to determine text color based on status
const getStatusColor = (status: string, isDarkMode: boolean): string => {
  switch (status) {
    case 'excellent':
      return isDarkMode ? 'text-green-400' : 'text-green-600';
    case 'good':
      return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    case 'fair':
      return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    case 'poor':
      return isDarkMode ? 'text-red-400' : 'text-red-600';
    default:
      return '';
  }
};

// Helper to get gauge gradient
const getGaugeGradient = (score: number): string => {
  if (score >= 80) return 'from-green-500 to-green-400';
  if (score >= 60) return 'from-blue-500 to-blue-400';
  if (score >= 40) return 'from-yellow-500 to-yellow-400';
  return 'from-red-500 to-red-400';
};

export const HealthScoreWidget: React.FC<HealthScoreWidgetProps> = ({
  score,
  previousScore,
  change,
  components = [],
  topRecommendation,
  isLoading = false,
  onViewDetails,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const scoreRef = useRef<HTMLDivElement>(null);
  
  // Calculate score delta
  const scoreDelta = previousScore !== undefined ? score - previousScore : change || 0;
  
  // Determine score status
  const getScoreStatus = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };
  
  const scoreStatus = getScoreStatus(score);
  const statusColor = getStatusColor(scoreStatus, isDarkMode);
  const gaugeGradient = getGaugeGradient(score);
  
  // Animate the score filling effect
  useEffect(() => {
    if (scoreRef.current && !isLoading) {
      const scoreElement = scoreRef.current;
      scoreElement.style.height = '0%';
      
      setTimeout(() => {
        scoreElement.style.height = `${score}%`;
      }, 100);
    }
  }, [score, isLoading]);
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <Card.Header>
          <div className="animate-pulse h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </Card.Header>
        <Card.Body>
          <div className="animate-pulse flex flex-col items-center justify-center py-6">
            <div className="relative h-32 w-32 mb-4">
              <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-4"></div>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <Card.Header>
        <h2 className="text-xl font-semibold">Financial Health</h2>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer>
          <div className="flex flex-col items-center mb-4">
            {/* Gauge */}
            <div className="relative h-40 w-40 mb-2">
              {/* Background Circle */}
              <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Fill Circle with Gradient */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div 
                  ref={scoreRef}
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${gaugeGradient} rounded-full transition-all duration-1000 ease-out`}
                  style={{ height: '0%' }}
                ></div>
              </div>
              
              {/* Center White Circle */}
              <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-col">
                <span className={`text-3xl font-bold ${statusColor}`}>{score}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">out of 100</span>
              </div>
            </div>
            
            {/* Score Status and Change */}
            <div className="text-center">
              <div className={`text-lg font-medium ${statusColor} capitalize`}>
                {scoreStatus}
              </div>
              
              {scoreDelta !== 0 && (
                <div className="flex items-center justify-center text-sm mt-1">
                  {scoreDelta > 0 ? (
                    <>
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">+{scoreDelta} since last check</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500">{scoreDelta} since last check</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Top Component Scores - only shown if components are provided */}
          {components.length > 0 && (
            <div className="space-y-3 mb-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Component Scores</h3>
              <div className="space-y-2">
                {components.slice(0, 3).map((component) => (
                  <div key={component.name} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{component.name}</span>
                    <span className={`text-sm font-medium ${getStatusColor(component.status, isDarkMode)}`}>
                      {component.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recommendation */}
          {topRecommendation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Top Recommendation</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">{topRecommendation}</p>
            </div>
          )}
          
          {/* View Details Button */}
          {onViewDetails && (
            <div className="text-center">
              <Button
                variant="text"
                size="sm"
                onClick={onViewDetails}
                rightIcon={<ChevronRightIcon className="h-4 w-4" />}
              >
                View Full Health Report
              </Button>
            </div>
          )}
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}; 