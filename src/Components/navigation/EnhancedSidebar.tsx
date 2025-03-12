import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/shadcn-avatar";
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
  Menu,
  ChevronRight,
  Building
} from "lucide-react";
import type { User } from '../../types/models';
import { BaseComponentProps } from '../../types/components';
import { cva } from 'class-variance-authority';

interface NavigationItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export interface EnhancedSidebarProps extends BaseComponentProps {
  user?: User;
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
}

const sidebarVariants = cva(
  "fixed h-[calc(100vh-4rem)] top-16 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
  {
    variants: {
      collapsed: {
        true: `w-[70px]`,
        false: `w-[240px]`,
      },
      mobile: {
        true: "hidden",
        false: "block",
      },
    },
    defaultVariants: {
      collapsed: false,
      mobile: false,
    },
  }
);

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  user,
  className,
  collapsed = false,
  onToggle,
  mobile = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isMobile] = useState(mobile);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
        onToggle?.();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed, onToggle]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
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
          title: 'Bills & Expenses',
          path: '/dashboard/bills',
          icon: <CreditCard className="h-5 w-5" />,
        },
        {
          title: 'Transactions',
          path: '/dashboard/transactions',
          icon: <Wallet className="h-5 w-5" />,
        },
        {
          title: 'Bank Accounts',
          path: '/dashboard/accounts',
          icon: <Building className="h-5 w-5" />,
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          title: 'Analytics',
          path: '/dashboard/analytics',
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: 'Salary Journal',
          path: '/dashboard/salary-journal',
          icon: <Clock className="h-5 w-5" />,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Ask AI',
          path: '/dashboard/ask-ai',
          icon: <PieChart className="h-5 w-5" />,
          badge: 1,
        },
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

  const renderSidebarContent = () => (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {user && (
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
              <Avatar>
                {user.name && (
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              {!isCollapsed && (
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>
          )}
          {!isCollapsed && <span className="font-bold text-lg">FinanceDash</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="hidden md:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-4">
          {navigationSections.map((section, index) => (
            <div key={section.title} className={cn("pb-4", index !== navigationSections.length - 1 && "mb-4")}>
              {!isCollapsed && (
                <h4 className="px-4 mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {section.title}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-gray-600 dark:text-gray-300",
                        isCollapsed && "justify-center"
                      )
                    }
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <>
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed left-4 top-3 z-40"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[240px]">
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className={cn(sidebarVariants({ collapsed: isCollapsed, mobile: isMobile }))}>
      {renderSidebarContent()}
    </aside>
  );
};

export default EnhancedSidebar;
