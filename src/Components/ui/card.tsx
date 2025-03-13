import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "",
        outline: "border-2",
        ghost: "border-none shadow-none bg-transparent",
        interactive: "hover:border-primary/50 hover:shadow-md cursor-pointer",
        dashboard: "h-full flex flex-col overflow-hidden",
        feature: "h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300",
      },
      size: {
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
        none: "",
      },
      align: {
        default: "",
        center: "items-center text-center",
        left: "items-start text-left",
        right: "items-end text-right",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      align: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  container?: boolean;
  expanded?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    size, 
    align, 
    asChild = false, 
    expanded,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "div"
    
    return (
      <Comp
        ref={ref}
        className={cn(
          cardVariants({ variant, size, align }),
          expanded && "flex-1",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    separator?: boolean;
    actions?: React.ReactNode;
  }
>(({ className, separator = false, actions, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      separator && "pb-3 border-b",
      className
    )}
    {...props}
  >
    {actions ? (
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">{props.children}</div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    ) : (
      props.children
    )}
  </div>
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: React.ElementType }
>(({ className, as: Component = "h3", ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { expanded?: boolean }
>(({ className, expanded, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "pt-0",
      expanded && "flex-1",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { separator?: boolean }
>(({ className, separator = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-0 pt-4", 
      separator && "border-t mt-2",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Expandable Card
interface ExpandableCardProps extends Omit<CardProps, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  defaultExpanded?: boolean;
  onExpandToggle?: (expanded: boolean) => void;
  headerActions?: React.ReactNode;
}

const ExpandableCard = React.forwardRef<HTMLDivElement, ExpandableCardProps>(
  ({ 
    title, 
    description, 
    defaultExpanded = true, 
    onExpandToggle,
    headerActions,
    children, 
    className,
    ...props 
  }, ref) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded);
    
    const handleToggle = () => {
      const newState = !expanded;
      setExpanded(newState);
      onExpandToggle?.(newState);
    };
    
    return (
      <Card 
        ref={ref} 
        className={className} 
        {...props}
      >
        <CardHeader 
          separator 
          actions={
            <>
              {headerActions}
              <button
                onClick={handleToggle}
                className="p-1 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={expanded ? "Collapse" : "Expand"}
                aria-expanded={expanded}
                tabIndex={0}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </motion.svg>
              </button>
            </>
          }
        >
          {typeof title === 'string' ? <CardTitle>{title}</CardTitle> : title}
          {description && (
            typeof description === 'string' 
              ? <CardDescription>{description}</CardDescription>
              : description
          )}
        </CardHeader>
        
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent>
                {children}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  }
);
ExpandableCard.displayName = "ExpandableCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  ExpandableCard,
  cardVariants,
};
