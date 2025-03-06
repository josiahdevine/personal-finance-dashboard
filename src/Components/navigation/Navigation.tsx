import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react';

type IconComponent = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>;

interface NavigationItem {
  name: string;
  href: string;
  icon: IconComponent;
}

interface NavigationProps {
  items: NavigationItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ items, activeTab, onTabChange }) => {
  const router = useRouter();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = activeTab ? activeTab === item.name.toLowerCase() : router.pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => onTabChange?.(item.name.toLowerCase())}
            className={`
              group flex items-center px-3 py-2 text-sm font-medium rounded-md
              ${isActive
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <item.icon
              className={`
                flex-shrink-0 -ml-1 mr-3 h-6 w-6
                ${isActive
                  ? 'text-indigo-600'
                  : 'text-gray-400 group-hover:text-gray-500'
                }
              `}
              aria-hidden="true"
            />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation; 