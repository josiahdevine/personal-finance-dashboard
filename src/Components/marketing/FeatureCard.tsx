import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AnimatedCard } from '../ui/animated-card';
import { cn } from '../../lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className,
  children,
}) => {
  return (
    <AnimatedCard className={cn("h-full", className)}>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center space-x-2">
          <div className="flex-shrink-0 mr-2">
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">{description}</p>
          {children}
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}; 