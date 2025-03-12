import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/shadcn-avatar";
import {
  ChevronLeft,
  LayoutDashboard,
  CreditCard,
  Wallet,
  Clock,
  BarChart3,
  Bell,
  Settings,
  PieChart,
  Menu
} from "lucide-react";
import { User } from '../../types/user';
import { BaseComponentProps } from '../../types/components';

// Navigation item type definition
interface NavigationItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number | string;
  onClick?: () => void;
}

// Define the navigation sections
interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export interface EnhancedSidebarProps extends BaseComponentProps {
  collapsed?: boolean;
  onToggle?: () => void;
  user?: User | null;
  mobile?: boolean;
}

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  collapsed = false,
  onToggle,
  className = '',
  user,
  mobile = false
}) => {
  const location = useLocation();
  const [isMobileView, setIsMobileView] = useState(mobile);
  const [isOpen, setIsOpen] = useState(false);

  // Function to get user initials for the avatar
  const getUserInitials = () => {
    if (!user?.displayName) return '?';
    
    const names = user.displayName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  // Check if a link is active
  const _isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/dashboard';
  };

  // Default navigation items
  const navigationSections: NavigationSection[] = [
    {
      title: 'Main',
      items: [
        {
          title: 'Dashboard',
          path: '/dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: 'Transactions',
          path: '/dashboard/transactions',
          icon: <CreditCard className="h-5 w-5" />,
        },
        {
          title: 'Accounts',
          path: '/dashboard/accounts',
          icon: <Wallet className="h-5 w-5" />,
        },
      ],
    },
    {
      title: 'Analysis',
      items: [
        {
          title: 'Budget',
          path: '/dashboard/budget',
          icon: <Clock className="h-5 w-5" />,
        },
        {
          title: 'Reports',
          path: '/dashboard/reports',
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: 'Analytics',
          path: '/dashboard/analytics',
          icon: <PieChart className="h-5 w-5" />,
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Notifications',
          path: '/dashboard/notifications',
          icon: <Bell className="h-5 w-5" />,
          badge: 3,
        },
        {
          title: 'Settings',
          path: '/dashboard/settings',
          icon: <Settings className="h-5 w-5" />,
        },
      ],
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobileView(mobileView);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // For mobile view, use Sheet component
  if (isMobileView) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn("h-10 w-10", className)}
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-4 border-b">
              <div className="flex items-center justify-start">
                <div className="w-8 h-8 mr-2">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
                    <path d="M22 12H10C9.44772 12 9 12.4477 9 13V19C9 19.5523 9.44772 20 10 20H22C22.5523 20 23 19.5523 23 19V13C23 12.4477 22.5523 12 22 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17C16.5523 17 17 16.5523 17 16C17 15.4477 16.5523 15 16 15C15.4477 15 15 15.4477 15 16C15 16.5523 15.4477 17 16 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20 12V10C20 9.46957 19.7893 8.96086 19.4142 8.58579C19.0391 8.21071 18.5304 8 18 8H14C13.4696 8 12.9609 8.21071 12.5858 8.58579C12.2107 8.96086 12 9.46957 12 10V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 20V22C12 22.5304 12.2107 23.0391 12.5858 23.4142C12.9609 23.7893 13.4696 24 14 24H18C18.5304 24 19.0391 23.7893 19.4142 23.4142C19.7893 23.0391 20 22.5304 20 22V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-bold text-lg">FinanceDash</span>
              </div>
            </div>
            <ScrollArea className="flex-1 px-2">
              <div className="py-4">
                {navigationSections.map((section, index) => (
                  <div key={index} className="mb-6">
                    <div className="text-xs uppercase font-medium text-muted-foreground px-4 mb-2">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <NavLink
                          key={itemIndex}
                          to={item.path}
                          onClick={() => {
                            setIsOpen(false);
                            item.onClick?.();
                          }}
                          className={({ isActive }) => 
                            cn(
                              "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                              (isActive || _isActive(item.path)) ? 
                                "bg-primary text-primary-foreground" : 
                                "hover:bg-accent hover:text-accent-foreground"
                            )
                          }
                        >
                          <div className="mr-2">
                            {item.icon}
                          </div>
                          <span>{item.title}</span>
                          {item.badge && (
                            <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                              {item.badge}
                            </div>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {user && (
              <div className="border-t p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {user.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} /> 
                    ) : (
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{user.displayName || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop view, use standard sidebar
  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
    >
      <div className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center justify-start">
          <div className="w-8 h-8 mr-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
              <path d="M22 12H10C9.44772 12 9 12.4477 9 13V19C9 19.5523 9.44772 20 10 20H22C22.5523 20 23 19.5523 23 19V13C23 12.4477 22.5523 12 22 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 17C16.5523 17 17 16.5523 17 16C17 15.4477 16.5523 15 16 15C15.4477 15 15 15.4477 15 16C15 16.5523 15.4477 17 16 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 12V10C20 9.46957 19.7893 8.96086 19.4142 8.58579C19.0391 8.21071 18.5304 8 18 8H14C13.4696 8 12.9609 8.21071 12.5858 8.58579C12.2107 8.96086 12 9.46957 12 10V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 20V22C12 22.5304 12.2107 23.0391 12.5858 23.4142C12.9609 23.7893 13.4696 24 14 24H18C18.5304 24 19.0391 23.7893 19.4142 23.4142C19.7893 23.0391 20 22.5304 20 22V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {!collapsed && <span className="font-bold text-lg">FinanceDash</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="ml-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft 
            className={cn(
              "h-4 w-4 transition-transform duration-300", 
              collapsed && "rotate-180"
            )} 
          />
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="py-4">
          {navigationSections.map((section, index) => (
            <div key={index} className="mb-6">
              {!collapsed && (
                <div className="text-xs uppercase font-medium text-muted-foreground px-4 mb-2">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <NavLink
                    key={itemIndex}
                    to={item.path}
                    onClick={item.onClick}
                    title={collapsed ? item.title : undefined}
                    className={({ isActive }) => 
                      cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        collapsed ? "justify-center" : "",
                        (isActive || _isActive(item.path)) ? 
                          "bg-primary text-primary-foreground" : 
                          "hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    <div className={collapsed ? "" : "mr-2"}>
                      {item.icon}
                    </div>
                    {!collapsed && <span>{item.title}</span>}
                    {!collapsed && item.badge && (
                      <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                        {item.badge}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {user && (
        <>
          <Separator />
          <div className="p-4">
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              <Avatar className="h-9 w-9">
                {user.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} /> 
                ) : (
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                )}
              </Avatar>
              {!collapsed && (
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{user.displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedSidebar;
