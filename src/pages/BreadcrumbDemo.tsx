import React from 'react';
import { Breadcrumb } from '../components/navigation';
import { DollarSign, PieChart, Settings, Users } from 'lucide-react';
import Card from '../components/common/Card';

const BreadcrumbDemo: React.FC = () => {
  // Example breadcrumb paths for different scenarios
  const simplePath = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Profile', href: '/dashboard/settings/profile' },
  ];

  const longPath = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Finances', href: '/dashboard/finances' },
    { label: 'Accounts', href: '/dashboard/finances/accounts' },
    { label: 'Savings', href: '/dashboard/finances/accounts/savings' },
    { label: 'Emergency Fund', href: '/dashboard/finances/accounts/savings/emergency' },
    { label: 'Edit', href: '/dashboard/finances/accounts/savings/emergency/edit' },
  ];

  const iconPath = [
    { label: 'Dashboard', href: '/dashboard', icon: <PieChart className="h-4 w-4" /> },
    { label: 'Finances', href: '/dashboard/finances', icon: <DollarSign className="h-4 w-4" /> },
    { label: 'Settings', href: '/dashboard/finances/settings', icon: <Settings className="h-4 w-4" /> },
    { label: 'User Preferences', href: '/dashboard/finances/settings/user', icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Breadcrumb Component Examples</h1>

      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">Simple Breadcrumb</h2>
        </Card.Header>
        <Card.Body>
          <Breadcrumb items={simplePath} />
          <div className="mt-4 text-sm text-gray-500">
            <p>A basic breadcrumb with three levels of navigation.</p>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">Long Path with Truncation</h2>
        </Card.Header>
        <Card.Body>
          <Breadcrumb items={longPath} maxItems={4} />
          <div className="mt-4 text-sm text-gray-500">
            <p>A breadcrumb with truncation for deep navigation paths.</p>
            <p>The <code>maxItems</code> prop limits the number of visible items.</p>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">Breadcrumb with Icons</h2>
        </Card.Header>
        <Card.Body>
          <Breadcrumb items={iconPath} />
          <div className="mt-4 text-sm text-gray-500">
            <p>A breadcrumb with icons for visual cues.</p>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">Custom Separator</h2>
        </Card.Header>
        <Card.Body>
          <Breadcrumb 
            items={simplePath} 
            separator={<span className="text-gray-400 mx-1">/</span>}
          />
          <div className="mt-4 text-sm text-gray-500">
            <p>A breadcrumb with a custom separator.</p>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">Without Home Icon</h2>
        </Card.Header>
        <Card.Body>
          <Breadcrumb items={simplePath} showHomeIcon={false} />
          <div className="mt-4 text-sm text-gray-500">
            <p>A breadcrumb without the home icon.</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BreadcrumbDemo; 