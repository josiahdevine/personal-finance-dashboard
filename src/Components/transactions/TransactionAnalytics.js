import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../services/liveApi';
import {
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineDocumentDownload,
  HiOutlineCalendar,
  HiOutlineChartPie
} from '../../utils/iconMapping';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import { getChartInstance } from '../../utils/chartConfig';
import { Button } from '../ui';

// Ensure ChartJS is initialized
getChartInstance();

const TransactionAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    categoryBreakdown: [],
    monthlySpending: [],
    totalIncome: 0,
    totalExpenses: 0
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactionsAnalytics();
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics');
      toast.error('Failed to load transaction analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600" role="alert" aria-live="polite">
        <HiOutlineExclamationCircle className="h-12 w-12 mx-auto mb-4" aria-hidden="true" />
        <p>{error}</p>
        <Button
          onClick={fetchAnalytics}
          variant="primary"
          className="mt-4"
        >
          <HiOutlineRefresh className="mr-2" aria-hidden="true" />
          Try Again
        </Button>
      </div>
    );
  }

  const categoryChartData = {
    labels: analytics.categoryBreakdown.map(item => item.category),
    datasets: [{
      data: analytics.categoryBreakdown.map(item => item.amount),
      backgroundColor: [
        '#3B82F6', // blue-500
        '#10B981', // emerald-500
        '#F59E0B', // amber-500
        '#EF4444', // red-500
        '#8B5CF6', // violet-500
        '#EC4899', // pink-500
        '#6366F1', // indigo-500
        '#F97316', // orange-500
      ],
      borderWidth: 1
    }]
  };

  const monthlyChartData = {
    labels: analytics.monthlySpending.map(item => item.month),
    datasets: [{
      label: 'Monthly Spending',
      data: analytics.monthlySpending.map(item => item.amount),
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      borderWidth: 1
    }]
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow" role="region" aria-label="Income Summary">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Income</h3>
          <p className="text-3xl font-bold text-green-600" aria-live="polite">
            ${analytics.totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow" role="region" aria-label="Expenses Summary">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600" aria-live="polite">
            ${analytics.totalExpenses.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow" role="region" aria-label="Category Spending Chart">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
        <div className="h-64">
          <Doughnut
            data={categoryChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right'
                }
              },
              accessibility: {
                enabled: true,
                description: 'Doughnut chart showing spending breakdown by category'
              }
            }}
            aria-label="Category spending breakdown"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow" role="region" aria-label="Monthly Spending Chart">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Spending Trend</h3>
        <div className="h-64">
          <Bar
            data={monthlyChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              },
              accessibility: {
                enabled: true,
                description: 'Bar chart showing monthly spending trends'
              }
            }}
            aria-label="Monthly spending trends"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionAnalytics; 