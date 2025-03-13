import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from '../navigation/Navbar';
import { Sidebar, NavigationSection } from '../navigation/Sidebar';
import { CommandMenu } from '../navigation/CommandMenu';
import { cn } from '../../lib/utils';
import type { User } from '../../types';
import type { User as ModelUser } from '../../types/models';

// Import icons
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Clock,
  BarChart3,
  Bell,
  Settings,
  PieChart,
  Building,
  HelpCircle,
} from 'lucide-react';

export interface DashboardLayoutProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showNavbar?: boolean;
  showSidebar?: boolean;
  showCommandMenu?: boolean;
  className?: string;
  contentClassName?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  showNavbar = true,
  showSidebar = true,
  showCommandMenu = true,
  className,
  contentClassName,
}) => {
  const { currentUser: modelUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Map the model User to the index User
  const currentUser: User | undefined = modelUser ? {
    uid: modelUser.id,
    email: modelUser.email,
    displayName: modelUser.name || '',
    photoURL: modelUser.photoURL,
    emailVerified: true,
    createdAt: modelUser.createdAt,
    updatedAt: modelUser.updatedAt,
  } : undefined;

  // Navbar expects a ModelUser, so convert back for the Navbar component
  const navbarUser: ModelUser | undefined = currentUser ? {
    id: currentUser.uid,
    email: currentUser.email,
    name: currentUser.displayName,
    photoURL: currentUser.photoURL,
    createdAt: currentUser.createdAt,
    updatedAt: currentUser.updatedAt,
  } : undefined;

  // Default navigation sections for the sidebar
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
          badge: 2,
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
        {
          title: 'Help & Support',
          path: '/dashboard/help',
          icon: <HelpCircle className="h-5 w-5" />,
        },
      ],
    },
  ];

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      {/* Global command menu */}
      {showCommandMenu && <CommandMenu />}
      
      {/* Navbar */}
      {showNavbar && (
        <Navbar
          user={navbarUser}
          showThemeToggle={true}
          showSearchCommand={true}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="sticky top-0 z-40"
        />
      )}
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {showSidebar && (
          <div className={cn(
            "h-[calc(100vh-4rem)] sticky top-16 left-0 z-30",
            sidebarCollapsed ? "w-[70px]" : "w-64"
          )}>
            <Sidebar
              user={currentUser}
              sections={navigationSections}
              state={sidebarCollapsed ? 'collapsed' : 'expanded'}
              onToggle={handleSidebarToggle}
              mobile={isMobile}
              isFixed={false}
            />
          </div>
        )}
        
        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300 overflow-auto",
            contentClassName
          )}
        >
          <div className="p-4 md:p-6 max-w-7xl mx-auto h-full">
            {/* Add title and subtitle if provided */}
            {(title || subtitle) && (
              <div className="mb-6">
                {title && <h1 className="text-2xl font-bold">{title}</h1>}
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
              </div>
            )}
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;