import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/shadcn-avatar';
import { AnimatedCard } from '../ui/animated-card';
import { cn } from '../../lib/utils';

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  avatarUrl: string;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  name,
  title,
  avatarUrl,
  className,
}) => {
  return (
    <AnimatedCard className={cn("h-full", className)}>
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="flex items-start mb-4">
            <span className="text-4xl leading-none text-primary opacity-30">"</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{quote}</p>
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}; 