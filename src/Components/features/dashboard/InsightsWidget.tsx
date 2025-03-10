import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { ResponsiveContainer } from '../../../components/layout/ResponsiveContainer';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  LightBulbIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export interface InsightItem {
  id: string;
  type: 'trend' | 'alert' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  impact?: 'positive' | 'negative' | 'neutral';
  date: Date;
  relatedAccounts?: string[];
  relatedCategories?: string[];
  seen?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export interface InsightsWidgetProps {
  insights: InsightItem[];
  isLoading?: boolean;
  onInsightClick?: (insight: InsightItem) => void;
  onViewAll?: () => void;
  maxItems?: number;
  className?: string;
}

// Helper to determine the icon for an insight type
const getInsightIcon = (type: InsightItem['type'], impact?: InsightItem['impact']) => {
  switch (type) {
    case 'trend':
      return impact === 'negative' 
        ? <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" /> 
        : <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
    case 'alert':
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    case 'suggestion':
      return <LightBulbIcon className="h-5 w-5 text-blue-500" />;
    case 'achievement':
      return <SparklesIcon className="h-5 w-5 text-purple-500" />;
    default:
      return <LightBulbIcon className="h-5 w-5 text-blue-500" />;
  }
};

// Helper to determine background color for an insight
const getInsightBackgroundColor = (
  type: InsightItem['type'], 
  impact: InsightItem['impact'], 
  isDarkMode: boolean
): string => {
  switch (type) {
    case 'trend':
      if (impact === 'positive') return isDarkMode ? 'bg-green-900/20' : 'bg-green-50';
      if (impact === 'negative') return isDarkMode ? 'bg-red-900/20' : 'bg-red-50';
      return isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
    case 'alert':
      return isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50';
    case 'suggestion':
      return isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50';
    case 'achievement':
      return isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50';
    default:
      return isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
  }
};

// Format relative time (today, yesterday, X days ago)
const getRelativeDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const insightDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (insightDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (insightDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    const diffTime = Math.abs(today.getTime() - insightDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  }
};

export const InsightsWidget: React.FC<InsightsWidgetProps> = ({
  insights = [],
  isLoading = false,
  onInsightClick,
  onViewAll,
  maxItems = 3,
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  const displayInsights = insights.slice(0, maxItems);
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <Card.Header>
          <div className="animate-pulse h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/5"></div>
        </Card.Header>
        <Card.Body>
          <div className="animate-pulse space-y-4">
            {[...Array(maxItems)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                </div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  // Empty state
  if (displayInsights.length === 0) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <Card.Header>
          <h2 className="text-xl font-semibold">Insights</h2>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <LightBulbIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No insights available yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              As you use the app more, we'll provide personalized financial insights here
            </p>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Insights</h2>
        {insights.length > maxItems && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {insights.length - maxItems} more available
          </span>
        )}
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer>
          <div className="space-y-4">
            {displayInsights.map((insight) => (
              <div 
                key={insight.id}
                className={`
                  p-4 rounded-lg 
                  ${getInsightBackgroundColor(insight.type, insight.impact, isDarkMode)}
                  ${onInsightClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}
                `}
                onClick={() => onInsightClick && onInsightClick(insight)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getInsightIcon(insight.type, insight.impact)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {getRelativeDate(insight.date)}
                      </div>
                      
                      {!insight.seen && (
                        <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium">
                          New
                        </span>
                      )}
                      
                      {insight.priority === 'high' && (
                        <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium">
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </Card.Body>
      
      {onViewAll && insights.length > 0 && (
        <Card.Footer className="text-center">
          <Button
            variant="text"
            size="sm"
            onClick={onViewAll}
            rightIcon={<ChevronRightIcon className="h-4 w-4" />}
          >
            View All Insights
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}; 