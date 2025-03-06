import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PortfolioService } from '../services/PortfolioService';
import type { Portfolio } from '../types/models';

export function usePortfolio() {
  const auth = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!auth.state.user) {
        setPortfolio(null);
        setLoading(false);
        return;
      }

      try {
        const data = await PortfolioService.getPortfolio(auth.state.user.id);
        setPortfolio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [auth.state.user]);

  return {
    portfolio,
    loading,
    error,
  };
} 