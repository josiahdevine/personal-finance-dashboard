import React from 'react';
import { 
  ResponsiveContainer, 
  ResponsiveGrid, 
  ResponsiveFlex 
} from '../components/layout/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { DataTable, Column } from '../components/common/DataTable';
import { TransactionList } from '../components/features/transactions/TransactionList';
import { Button } from '../components/common/Button';
import { Text } from '../components/common/Text';
import { Heading } from '../components/common/Heading';
import { useTheme } from '../contexts/ThemeContext';
import {
  ChartPieIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface DemoSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const DemoSection: React.FC<DemoSectionProps> = ({ title, description, children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <section className="mb-10">
      <Heading level={2} size="xl" className="mb-2">
        {title}
      </Heading>
      <Text size="base" className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {description}
      </Text>
      {children}
    </section>
  );
};

// Define the type for table data
interface StockData {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change: number;
}

const ResponsiveDemo: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const tableData = [
    { id: 1, name: 'Apple Inc.', symbol: 'AAPL', price: 178.72, change: 0.52 },
    { id: 2, name: 'Microsoft Corp.', symbol: 'MSFT', price: 290.17, change: -0.56 },
    { id: 3, name: 'Amazon.com Inc.', symbol: 'AMZN', price: 135.07, change: 1.09 },
    { id: 4, name: 'Alphabet Inc.', symbol: 'GOOGL', price: 122.67, change: 0.78 },
    { id: 5, name: 'Meta Platforms Inc.', symbol: 'META', price: 301.26, change: -1.24 },
  ];
  
  const tableColumns: Column<StockData>[] = [
    {
      id: 'name',
      header: 'Company',
      accessor: 'name',
      sortable: true,
    },
    {
      id: 'symbol',
      header: 'Symbol',
      accessor: 'symbol',
      sortable: true,
    },
    {
      id: 'price',
      header: 'Price',
      accessor: 'price',
      cell: (value: number) => `$${value.toFixed(2)}`,
      sortable: true,
      align: 'right',
    },
    {
      id: 'change',
      header: 'Change',
      accessor: 'change',
      cell: (value: number) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </span>
      ),
      sortable: true,
      align: 'right',
    },
  ];
  
  return (
    <ResponsiveContainer 
      maxWidth={{ base: '100%', lg: '7xl' }}
      margin={{ base: '0', sm: '0 auto' }}
      padding={{ base: '4', md: '6', lg: '8' }}
    >
      <header className="mb-12">
        <Heading level={1} size="3xl" className="mb-2">
          Responsive Design System Demo
        </Heading>
        <Text size="lg" className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          This page demonstrates the responsive components and utilities in our design system
        </Text>
        <Button onClick={toggleTheme} variant="secondary">
          Toggle Theme
        </Button>
      </header>
      
      <DemoSection
        title="Responsive Containers"
        description="Components that adapt their layout based on screen size"
      >
        <Card className="mb-6">
          <Card.Header>
            <Heading level={3} size="lg">Responsive Container Demo</Heading>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer 
              display={{ base: 'block', md: 'flex' }}
              gap="4"
              padding="4"
              bgColor={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
              className="rounded-md"
            >
              <div className={`flex-1 p-4 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                <Text>This container changes from block to flex layout at medium screens</Text>
              </div>
              <div className={`flex-1 p-4 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                <Text>Try resizing your browser window to see it in action</Text>
              </div>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </DemoSection>
      
      <DemoSection
        title="Responsive Grid"
        description="Grid layout that changes columns based on screen size"
      >
        <ResponsiveGrid 
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
          gap="6"
          className="mb-6"
        >
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Card.Body>
                <Text align="center">Grid Item {i}</Text>
              </Card.Body>
            </Card>
          ))}
        </ResponsiveGrid>
      </DemoSection>
      
      <DemoSection
        title="Responsive Flex"
        description="Flex container that changes direction based on screen size"
      >
        <ResponsiveFlex 
          direction={{ base: 'col', md: 'row' }}
          gap="4"
          className="mb-6"
        >
          <Card className="flex-1">
            <Card.Body>
              <Text>Flex Item 1</Text>
            </Card.Body>
          </Card>
          <Card className="flex-1">
            <Card.Body>
              <Text>Flex Item 2</Text>
            </Card.Body>
          </Card>
          <Card className="flex-1">
            <Card.Body>
              <Text>Flex Item 3</Text>
            </Card.Body>
          </Card>
        </ResponsiveFlex>
      </DemoSection>
      
      <DemoSection
        title="Responsive Components"
        description="UI components that adapt to different screen sizes"
      >
        <ResponsiveGrid 
          columns={{ base: 1, sm: 2, lg: 4 }}
          gap="6"
          className="mb-6"
        >
          <StatCard
            title="Total Balance"
            value={42950.16}
            formatter={(val) => `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            trend={8.2}
            trendLabel="vs last month"
            icon={<BanknotesIcon className="h-6 w-6" />}
            iconBackground="primary"
          />
          
          <StatCard
            title="Income"
            value={8425.50}
            formatter={(val) => `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            trend={12.5}
            trendLabel="vs last month"
            icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
            iconBackground="success"
          />
          
          <StatCard
            title="Expenses"
            value={3827.33}
            formatter={(val) => `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            trend={-4.8}
            trendLabel="vs last month"
            icon={<CreditCardIcon className="h-6 w-6" />}
            iconBackground="danger"
          />
          
          <StatCard
            title="Investments"
            value={21580.70}
            formatter={(val) => `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            trend={5.3}
            trendLabel="vs last month"
            icon={<ChartPieIcon className="h-6 w-6" />}
            iconBackground="info"
          />
        </ResponsiveGrid>
        
        <Card className="mb-6">
          <Card.Header>
            <Heading level={3} size="lg">DataTable Component</Heading>
          </Card.Header>
          <Card.Body>
            <DataTable
              data={tableData}
              columns={tableColumns}
              zebra
              responsive
            />
          </Card.Body>
        </Card>
        
        <ResponsiveContainer 
          hideBelow="lg"
          className="mb-6"
        >
          <Card>
            <Card.Header>
              <Heading level={3} size="lg">Desktop-Only Component</Heading>
            </Card.Header>
            <Card.Body>
              <Text>This component is only visible on large screens (lg and above)</Text>
            </Card.Body>
          </Card>
        </ResponsiveContainer>
        
        <ResponsiveContainer 
          hideAbove="md"
          className="mb-6"
        >
          <Card>
            <Card.Header>
              <Heading level={3} size="lg">Mobile-Only Component</Heading>
            </Card.Header>
            <Card.Body>
              <Text>This component is only visible on small screens (below md)</Text>
            </Card.Body>
          </Card>
        </ResponsiveContainer>
      </DemoSection>
      
      <DemoSection
        title="Transaction List"
        description="Enhanced Transaction List component with responsive design"
      >
        <TransactionList />
      </DemoSection>
    </ResponsiveContainer>
  );
};

export default ResponsiveDemo; 