import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

// BreadcrumbItem component properties
export interface BreadcrumbItemProps {
  href?: string;
  current?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Define a BreadcrumbItem component for JSX usage
export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ 
  href, 
  current, 
  className, 
  children 
}) => {
  const content = (
    <div className={cn(
      "flex items-center",
      current ? "text-gray-900 font-medium" : "text-gray-500",
      className
    )}>
      {children}
    </div>
  );

  if (href && !current) {
    return (
      <Link 
        to={href} 
        className="hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1"
      >
        {content}
      </Link>
    );
  }

  return (
    <span aria-current={current ? "page" : undefined}>{content}</span>
  );
};

// Original BreadcrumbItem type for the items array
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

// Original BreadcrumbProps
export interface BreadcrumbProps {
  items?: BreadcrumbItem[];  // Make items optional to allow for JSX children
  children?: React.ReactNode; // Add support for children
  className?: string;
  separator?: React.ReactNode;
  homeHref?: string;
  showHomeIcon?: boolean;
  maxItems?: number;
  testId?: string;
}

/**
 * Breadcrumb component for navigation hierarchy
 * 
 * Features:
 * - Customizable separators
 * - Optional home icon
 * - Truncation for deep paths
 * - Accessible navigation with proper ARIA attributes
 * - Responsive design
 * - Support for both items array and JSX children
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  children,
  className,
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />,
  homeHref = '/',
  showHomeIcon = true,
  maxItems = 0,
  testId = 'breadcrumb-nav',
}) => {
  // Handle truncation for deep paths
  const displayedItems = React.useMemo(() => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    // Keep first and last items, replace middle with ellipsis
    const firstItem = items[0];
    const lastItems = items.slice(-Math.floor(maxItems / 2));
    const ellipsisItem: BreadcrumbItem = {
      label: '...',
      href: undefined,
    };

    return [firstItem, ellipsisItem, ...lastItems];
  }, [items, maxItems]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex', className)}
      data-testid={testId}
    >
      {/* If we have JSX children, use those instead of items array */}
      {children ? (
        <ol className="flex items-center space-x-2 text-sm">
          {showHomeIcon && (
            <li className="inline-flex items-center">
              <Link
                to={homeHref}
                className="inline-flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Link>
              <span className="mx-2 text-gray-400" aria-hidden="true">
                {separator}
              </span>
            </li>
          )}
          
          {/* Map children to add separators */}
          {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return null;
            
            const isLast = index === React.Children.count(children) - 1;
            
            return (
              <li key={index} className="inline-flex items-center">
                {child}
                {!isLast && (
                  <span className="mx-2 text-gray-400" aria-hidden="true">
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <ol className="flex items-center space-x-2 text-sm">
          {showHomeIcon && (
            <li className="inline-flex items-center">
              <Link
                to={homeHref}
                className="inline-flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Link>
              <span className="mx-2 text-gray-400" aria-hidden="true">
                {separator}
              </span>
            </li>
          )}

          {displayedItems.map((item, index) => {
            const isLast = index === displayedItems.length - 1;
            const isEllipsis = item.label === '...';

            return (
              <li key={`${item.label}-${index}`} className="inline-flex items-center">
                {item.href && !isLast ? (
                  <>
                    <Link
                      to={item.href}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1"
                    >
                      {item.icon && <span className="mr-1">{item.icon}</span>}
                      {item.label}
                    </Link>
                    {!isLast && (
                      <span className="mx-2 text-gray-400" aria-hidden="true">
                        {separator}
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    className={cn(
                      "px-1",
                      isLast
                        ? "font-medium text-gray-900"
                        : isEllipsis
                        ? "text-gray-500"
                        : "text-gray-500"
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
};

export default Breadcrumb; 