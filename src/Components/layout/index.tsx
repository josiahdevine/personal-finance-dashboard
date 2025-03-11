import React, { useState } from 'react';
import useDeviceDetect from '../../utils/useDeviceDetect';
import { Navigation } from '../../components/navigation/Navigation';
import {
  HomeIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  FlagIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  LinkIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const navigationItems = [
  { id: 'overview', title: 'Overview', path: '/dashboard', icon: <HomeIcon /> },
  { id: 'bills', title: 'Bills', path: '/dashboard/bills', icon: <CreditCardIcon /> },
  { id: 'salary', title: 'Salary Journal', path: '/dashboard/salary', icon: <CurrencyDollarIcon /> },
  { id: 'transactions', title: 'Transactions', path: '/dashboard/transactions', icon: <ReceiptRefundIcon /> },
  { id: 'goals', title: 'Goals', path: '/dashboard/goals', icon: <FlagIcon /> },
  { id: 'analytics', title: 'Analytics', path: '/dashboard/analytics', icon: <ChartBarIcon /> },
  { id: 'subscriptions', title: 'Subscriptions', path: '/dashboard/subscriptions', icon: <ClockIcon /> },
  { id: 'investments', title: 'Investments', path: '/dashboard/investments', icon: <ArrowTrendingUpIcon /> },
  { id: 'plaid', title: 'Plaid Integration', path: '/dashboard/plaid', icon: <LinkIcon /> },
  { id: 'ask-ai', title: 'Ask AI', path: '/dashboard/ask-ai', icon: <ChatBubbleLeftRightIcon /> }
];

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component that wraps the application content
 * Provides responsive layout adjustments based on device type
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMobile, isTablet, isLandscape } = useDeviceDetect();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Determine appropriate padding based on device type
  const containerPadding = isMobile
    ? 'px-4'
    : isTablet
      ? 'px-6'
      : 'px-8';

  // Use smaller padding for mobile in landscape orientation
  const verticalPadding = (isMobile && isLandscape) ? 'py-3' : 'py-6';

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${containerPadding}`}>
      <Navigation 
        items={navigationItems}
        showMobileMenu={showMobileMenu}
        onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        onNavItemClick={() => setShowMobileMenu(false)}
      />
      <main className={`container mx-auto ${verticalPadding}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;