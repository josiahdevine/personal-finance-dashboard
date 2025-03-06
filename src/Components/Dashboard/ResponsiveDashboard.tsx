import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Overview } from './Overview';
import { MobileOverview } from './MobileOverview';
import { AggregatedAccount } from '../../services/AccountAggregationService';
import { AccountAggregationService } from '../../services/AccountAggregationService';
import { useAuth } from '../../hooks/useAuth';

export const ResponsiveDashboard: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AggregatedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const aggregationService = AccountAggregationService.getInstance();

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const accounts = await aggregationService.getAllAccounts(user.id);
      setAccounts(accounts);
      setError(null);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAccountClick = (account: AggregatedAccount) => {
    // Handle account click - could open a modal or navigate to account details
    console.log('Account clicked:', account);
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return isMobile ? (
    <MobileOverview
      accounts={accounts}
      onAccountClick={handleAccountClick}
      onRefresh={handleRefresh}
    />
  ) : (
    <Overview
      accounts={accounts}
      onAccountClick={handleAccountClick}
      onRefresh={handleRefresh}
    />
  );
}; 