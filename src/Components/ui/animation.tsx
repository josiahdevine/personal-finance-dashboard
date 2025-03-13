import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define animation variants that work with Framer Motion
export type AnimationVariants = {
  initial?: any;
  animate?: any;
  exit?: any;
  hover?: any;
  tap?: any;
  drag?: any;
  [key: string]: any;
};

// Standard animation variants that can be reused across the application
export const fadeIn: AnimationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideUp: AnimationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

export const slideInRight: AnimationVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
};

export const slideInLeft: AnimationVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
};

export const scaleIn: AnimationVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const buttonHover: AnimationVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

export const cardHover: AnimationVariants = {
  hover: { y: -4, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)', transition: { duration: 0.3 } },
  tap: { y: -2, boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)', transition: { duration: 0.1 } },
};

// Create staggered animation for lists of items
export const createStaggerVariants = (staggerDuration = 0.1, childVariants = fadeIn) => {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDuration,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerDuration / 2,
        staggerDirection: -1,
      },
    },
    children: childVariants,
  };
};

// Animation wrapper component props
export type AnimatedProps = {
  children: React.ReactNode;
  variants?: AnimationVariants;
  useAnimatePresence?: boolean;
  presenceKey?: string | number;
  animateOnMount?: boolean;
  isVisible?: boolean;
  delay?: number;
  className?: string;
  testId?: string;
  style?: React.CSSProperties;
  [key: string]: any;
};

// Animated component implementation
export const Animated: React.FC<AnimatedProps> = ({
  children,
  variants = fadeIn,
  useAnimatePresence = false,
  presenceKey,
  animateOnMount = true,
  isVisible = true,
  delay = 0,
  className = '',
  testId,
  ...props
}) => {
  // Create a merged variants object that includes any delay
  const mergedVariants = React.useMemo(() => {
    if (delay === 0) return variants;
    
    return {
      ...variants,
      animate: {
        ...variants.animate,
        transition: {
          ...(variants.animate?.transition || {}),
          delay,
        },
      },
    };
  }, [variants, delay]);

  const motionComponent = (
    <motion.div
      initial={animateOnMount ? variants.initial : false}
      animate={isVisible ? mergedVariants.animate : mergedVariants.initial}
      exit={variants.exit}
      whileHover={variants.hover}
      whileTap={variants.tap}
      whileDrag={variants.drag}
      className={className}
      data-testid={testId}
      {...props}
    >
      {children}
    </motion.div>
  );

  if (useAnimatePresence) {
    return (
      <AnimatePresence mode="wait">
        {isVisible && (
          <React.Fragment key={presenceKey || 'animated-component'}>
            {motionComponent}
          </React.Fragment>
        )}
      </AnimatePresence>
    );
  }

  return motionComponent;
};

// Animation wrapper for lists
export interface AnimatedListProps {
  children: React.ReactNode;
  staggerDuration?: number;
  itemVariants?: AnimationVariants;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  staggerDuration = 0.1,
  itemVariants = fadeIn,
  className = '',
  style,
}) => {
  const staggerVariants = React.useMemo(
    () => createStaggerVariants(staggerDuration, itemVariants),
    [staggerDuration, itemVariants]
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerVariants}
      className={className}
      style={style}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return (
          <motion.div
            key={index}
            variants={staggerVariants.children}
            className={child.props.className}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Button animation wrapper 
export const AnimatedButton: React.FC<AnimatedProps> = (props) => {
  return <Animated variants={{ ...fadeIn, ...buttonHover }} {...props} />;
};

// Card animation wrapper
export const AnimatedCard: React.FC<AnimatedProps> = (props) => {
  return <Animated variants={{ ...fadeIn, ...cardHover }} {...props} />;
}; 