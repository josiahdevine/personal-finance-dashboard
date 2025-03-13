import { User } from "../../types/index";
import { NavigationSection } from "../../components/navigation/Sidebar";
import { LayoutDashboard, Wallet, PieChart, CreditCard, Bell, User as UserIcon } from "lucide-react";
import React from 'react';

/**
 * Mock user data for testing navigation components
 */
export const mockUser: User = {
  uid: "test-user-id",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: "https://example.com/avatar.png",
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Mock navigation sections for testing sidebar navigation
 */
export const mockNavigationSections: NavigationSection[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: React.createElement(LayoutDashboard, { className: "h-5 w-5" }),
      },
      {
        title: "Transactions",
        path: "/dashboard/transactions",
        icon: React.createElement(Wallet, { className: "h-5 w-5" }),
        badge: 5
      },
      {
        title: "Analytics",
        path: "/dashboard/analytics",
        icon: React.createElement(PieChart, { className: "h-5 w-5" }),
      }
    ]
  },
  {
    title: "Account",
    items: [
      {
        title: "Bills & Expenses",
        path: "/dashboard/bills",
        icon: React.createElement(CreditCard, { className: "h-5 w-5" }),
      },
      {
        title: "Notifications",
        path: "/dashboard/notifications",
        icon: React.createElement(Bell, { className: "h-5 w-5" }),
        badge: 3
      },
      {
        title: "Profile",
        path: "/profile",
        icon: React.createElement(UserIcon, { className: "h-5 w-5" }),
      }
    ]
  }
];

/**
 * Mock command groups for testing CommandMenu
 */
export const mockCommandGroups = [
  {
    heading: "Navigation",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        icon: React.createElement(LayoutDashboard, { className: "h-4 w-4" }),
        url: "/dashboard",
        keywords: ["dashboard", "home", "main"],
      },
      {
        id: "transactions",
        name: "Transactions",
        icon: React.createElement(Wallet, { className: "h-4 w-4" }),
        url: "/dashboard/transactions",
        keywords: ["transactions", "payments", "money"],
        shortcut: "T",
      }
    ]
  },
  {
    heading: "Account",
    items: [
      {
        id: "profile",
        name: "Profile",
        icon: React.createElement(UserIcon, { className: "h-4 w-4" }),
        url: "/profile",
        keywords: ["profile", "account", "settings"],
        shortcut: "P",
      }
    ]
  }
];

/**
 * Mock props for ThemeProvider tests
 */
export const mockThemeContext = {
  theme: "light",
  toggleTheme: jest.fn(),
  setTheme: jest.fn()
};

/**
 * Mock props for Auth Provider tests
 */
export const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn()
}; 