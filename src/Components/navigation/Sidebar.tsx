import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cva, type VariantProps } from "class-variance-authority";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/shadcn-avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from '../../lib/utils';
import type { User } from '../../types';
import { BaseComponentProps } from '../../types/components';

// Import icons
import {
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const sidebarVariants = cva(
  "bg-background transition-all duration-300 border-r border-border h-full flex flex-col",
  {
    variants: {
      variant: {
        default: "",
        floating: "rounded-xl shadow-lg m-4 border",
        minimal: "border-0 bg-transparent",
      },
      state: {
        expanded: "w-64",
        collapsed: "w-[70px]",
      },
      position: {
        default: "",
        fixed: "fixed top-16 left-0 h-[calc(100vh-4rem)] z-30",
      }
    },
    defaultVariants: {
      variant: "default",
      state: "expanded",
      position: "default",
    },
  }
);

export interface SidebarProps extends BaseComponentProps, VariantProps<typeof sidebarVariants> {
  user?: User;
  logo?: React.ReactNode;
  sections: NavigationSection[];
  onItemClick?: (item: NavigationItem) => void;
  footer?: React.ReactNode;
  collapsible?: boolean;
  showUserProfile?: boolean;
  isFixed?: boolean;
  mobile?: boolean;
  mobileBreakpoint?: number;
  onToggle?: (isCollapsed: boolean) => void;
  position?: "default" | "fixed";
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(({
  className,
  variant = "default",
  state = "expanded",
  user,
  logo,
  sections,
  onItemClick,
  footer,
  collapsible = true,
  showUserProfile = true,
  isFixed = true,
  mobile = false,
  mobileBreakpoint = 768,
  onToggle,
  position = "fixed",
  ...props
}, ref) => {
  const _location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(state === "collapsed");
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(mobile);

  // Set position fixed if isFixed prop is true
  const effectivePosition = isFixed ? "fixed" : position;

  // Check if mobile on initial render and window resize
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < mobileBreakpoint;
      setIsMobile(isMobileView);
      
      // Notify parent of collapse state changes
      if (onToggle && isMobileView !== isMobile) {
        onToggle(isMobileView ? true : isCollapsed);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint, mobile, onToggle, isMobile, isCollapsed]);

  // Update collapsed state when state prop changes
  useEffect(() => {
    setIsCollapsed(state === 'collapsed');
  }, [state]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) {
      onToggle(!isCollapsed);
    }
  };

  // Define active and hover classes with brand colors instead of purple
  const activeItemClassNames = "text-primary bg-primary/10 dark:bg-primary-dark/10 font-medium";
  const hoverItemClassNames = "hover:text-primary hover:bg-primary/5 dark:hover:bg-primary-dark/5";

  const renderUserProfile = () => {
    if (!showUserProfile || !user) return null;
    
    return (
      <div className={cn(
        "px-4 py-3 flex items-center",
        isCollapsed ? "justify-center" : "justify-start space-x-3"
      )}>
        <Avatar>
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
          <AvatarFallback>
            {user.displayName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {!isCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-medium line-clamp-1">{user.displayName}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{user.email}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSidebarContent = () => (
    <>
      {/* Logo area */}
      <div className={cn(
        "h-16 flex items-center px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {(!isCollapsed || !collapsible) && (
          <div className="flex items-center">
            {logo || <span className="text-lg font-bold">FinanceDash</span>}
          </div>
        )}
        
        {collapsible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>
      
      {/* User profile */}
      {renderUserProfile()}
      
      {/* Navigation sections */}
      <ScrollArea className="flex-1 px-2">
        <div className="py-2">
          {sections.map((section, i) => (
            <div key={`section-${i}`} className="mb-6">
              {!isCollapsed && section.title && (
                <h3 className="mb-2 ml-2 text-xs font-semibold text-muted-foreground">
                  {section.title}
                </h3>
              )}
              
              <ul className="space-y-1">
                {section.items.map((item, j) => (
                  <li key={`item-${i}-${j}`}>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <NavLink
                            to={item.path}
                            className={({ isActive }) => cn(
                              "flex items-center py-2 px-3 text-sm rounded-md transition-colors",
                              isCollapsed ? "justify-center" : "justify-start",
                              hoverItemClassNames,
                              isActive ? activeItemClassNames : "text-muted-foreground"
                            )}
                            onClick={() => onItemClick?.(item)}
                          >
                            <span className="flex-shrink-0">
                              {item.icon}
                            </span>
                            
                            {!isCollapsed && (
                              <span className="ml-3 truncate">{item.title}</span>
                            )}
                            
                            {!isCollapsed && item.badge !== undefined && (
                              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                {item.badge}
                              </span>
                            )}
                          </NavLink>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right">
                            <p>{item.title}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      {footer && (
        <div className={cn(
          "mt-auto px-4 py-4",
          isCollapsed ? "text-center" : ""
        )}>
          {footer}
        </div>
      )}
    </>
  );

  // Conditionally render for mobile or desktop
  return (
    <>
      {/* Mobile View */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="block lg:hidden"
              aria-label="Open sidebar navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px]">
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop View */}
      {!isMobile && (
        <aside 
          className={cn(
            sidebarVariants({ variant, state: isCollapsed ? 'collapsed' : 'expanded', position: effectivePosition }),
            className
          )} 
          ref={ref as React.RefObject<HTMLDivElement>}
          data-testid="sidebar"
          {...props}
        >
          {renderSidebarContent()}
        </aside>
      )}
    </>
  );
});

Sidebar.displayName = "Sidebar"; 