import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { cardVariants } from './card';
import type { VariantProps } from 'class-variance-authority';

export interface AnimatedCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'>,
  VariantProps<typeof cardVariants> {
  animationVariant?: 'fadeIn' | 'scaleIn' | 'slideUp';
  delay?: number;
  expanded?: boolean;
  interactive?: boolean;
}

/**
 * AnimatedCard component
 * 
 * A card component with built-in animations for entrances and interactions.
 * Uses framer-motion for smooth animations and supports multiple animation variants.
 * 
 * @example
 * ```tsx
 * <AnimatedCard 
 *   animationVariant="slideUp" 
 *   delay={0.2} 
 *   interactive
 * >
 *   Card content
 * </AnimatedCard>
 * ```
 */
export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({
    className,
    variant,
    size,
    align,
    expanded,
    animationVariant = 'fadeIn',
    delay = 0,
    interactive = false,
    children,
    ...props
  }, ref) => {
    // Basic animation properties
    let initialAnimation = {};
    let enterAnimation = {};
    
    // Set animation based on variant
    switch (animationVariant) {
      case 'scaleIn':
        initialAnimation = { opacity: 0, scale: 0.95 };
        enterAnimation = { opacity: 1, scale: 1 };
        break;
      case 'slideUp':
        initialAnimation = { opacity: 0, y: 20 };
        enterAnimation = { opacity: 1, y: 0 };
        break;
      default:
        initialAnimation = { opacity: 0 };
        enterAnimation = { opacity: 1 };
    }
    
    // Interactive animation properties (only applied if interactive is true)
    const hoverAnimation = interactive ? {
      y: -4,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
    } : {};
    
    const tapAnimation = interactive ? {
      y: -2,
      boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)'
    } : {};
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, align }),
          expanded && "flex-1",
          className
        )}
        initial={initialAnimation}
        animate={enterAnimation}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        transition={{ duration: 0.3, delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard"; 