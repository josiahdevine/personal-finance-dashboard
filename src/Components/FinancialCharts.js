import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title, 
  Tooltip as ChartJSTooltip, 
  Legend as ChartJSLegend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/liveApi';
import { currencyFormatter } from '../utils/formatters';
import { log, logError } from '../utils/logger';
import LoadingSpinner from './ui/LoadingSpinner';
import * as ReCharts from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  ChartJSTooltip,
  ChartJSLegend,
  Filler
);

// Chart theme colors
const chartColors = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
  dark: '#111827',
  light: '#f3f4f6',
  // Pastel variations
  pastelBlue: '#93c5fd',
  pastelPurple: '#c4b5fd',
  pastelGreen: '#a7f3d0',
  pastelRed: '#fca5a5',
  pastelYellow: '#fde68a',
  pastelTeal: '#a5f3fc',
  // Gradient stops
  blueGradient: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.2)'],
  purpleGradient: ['rgba(99, 102, 241, 0.8)', 'rgba(99, 102, 241, 0.2)'],
  greenGradient: ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.2)'],
  redGradient: ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.2)']
};

// Color palette for charts
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#A4DE6C', '#D0ED57', '#FFC658', '#FF6B6B'
];

/**
 * Enhanced Financial Charts Component
 * Provides interactive and responsive financial visualizations
 */
const FinancialCharts = () => {
  const { currentUser } = useAuth();
  const [activeChart, setActiveChart] = useState('netWorth');
  const [timeRange, setTimeRange] = useState('3M');
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [touchPosition, setTouchPosition] = useState(null);
  const chartRef = useRef(null);
  const [showManualAccountModal, setShowManualAccountModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    summary: {
      totalSpending: 0,
      totalIncome: 0,
      savingsRate: 0,
      transactionCount: 0,
      averageTransaction: 0
    },
    categoryBreakdown: [],
    monthlyTrends: [],
    topMerchants: []
  });
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false);

  // Check if user has connected accounts
  useEffect(() => {
    const checkConnectedAccounts = async () => {
      try {
        const response = await apiService.getPlaidAccounts();
        setHasConnectedAccounts(response.accounts && response.accounts.length > 0);
      } catch (err) {
        console.error('Error checking connected accounts:', err);
        setHasConnectedAccounts(false);
      }
    };

    if (currentUser) {
      checkConnectedAccounts();
    }
  }, [currentUser]);

  // Handle window resize for responsive charts
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Time range options
  const timeRanges = [
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: 'ALL', label: 'All Time' }
  ];

  // Chart options
  const chartTypes = [
    { 
      value: 'netWorth', 
      label: 'Net Worth',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    { 
      value: 'cashFlow', 
      label: 'Cash Flow',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      value: 'spending', 
      label: 'Spending',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      value: 'goals', 
      label: 'Goals',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        </svg>
      )
    }
  ];

  // Fetch chart data based on active chart and time range
  useEffect(() => {
    const fetchChartData = async () => {
      if (!currentUser) {
        setChartData({});
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        let data;
        let dates, netWorthValues, assetValues, liabilityValues;
        let cashFlowLabels, incomeData, expenseData, savingsData;
        let categories, amounts, backgroundColors;
        let goalNames, targetAmounts, currentAmounts, percentComplete;
        
        switch (activeChart) {
          case 'netWorth': {
            log('FinancialCharts', 'Fetching net worth data', { timeRange });
            const balances = await apiService.getBalanceHistory(timeRange)
              .catch(err => {
                logError('FinancialCharts', 'Error fetching balance history', err);
                // Fallback to mock data in case of error
                return generateMockBalanceData(timeRange);
              });
            
            // Process balances data
            dates = balances.map(item => new Date(item.date).toLocaleDateString());
            netWorthValues = balances.map(item => item.netWorth);
            assetValues = balances.map(item => item.assets);
            liabilityValues = balances.map(item => item.liabilities);
            
            data = {
              labels: dates,
              datasets: [
                {
                  label: 'Net Worth',
                  data: netWorthValues,
                  borderColor: chartColors.primary,
                  backgroundColor: 'transparent',
                  tension: 0.3,
                  pointBackgroundColor: chartColors.primary,
                  pointBorderColor: '#fff',
                  pointRadius: isMobile ? 2 : 4,
                  pointHoverRadius: isMobile ? 4 : 6,
                  pointHoverBackgroundColor: chartColors.primary,
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 2,
                  order: 0
                },
                {
                  label: 'Assets',
                  data: assetValues,
                  borderColor: chartColors.success,
                  borderDash: [5, 5],
                  backgroundColor: 'transparent',
                  tension: 0.3,
                  pointRadius: 0,
                  pointHoverRadius: isMobile ? 3 : 5,
                  pointHoverBackgroundColor: chartColors.success,
                  order: 1
                },
                {
                  label: 'Liabilities',
                  data: liabilityValues,
                  borderColor: chartColors.danger,
                  borderDash: [5, 5],
                  backgroundColor: 'transparent',
                  tension: 0.3,
                  pointRadius: 0,
                  pointHoverRadius: isMobile ? 3 : 5,
                  pointHoverBackgroundColor: chartColors.danger,
                  order: 2
                }
              ]
            };
            break;
          }
          
          case 'cashFlow': {
            log('FinancialCharts', 'Fetching cash flow data', { timeRange });
            const cashFlow = await apiService.getCashFlowData(timeRange);
            
            // Process cash flow data
            cashFlowLabels = cashFlow.map(item => item.month);
            incomeData = cashFlow.map(item => item.income);
            expenseData = cashFlow.map(item => Math.abs(item.expenses));
            savingsData = cashFlow.map(item => item.income - Math.abs(item.expenses));
            
            data = {
              labels: cashFlowLabels,
              datasets: [
                {
                  label: 'Income',
                  data: incomeData,
                  backgroundColor: chartColors.success,
                  order: 1
                },
                {
                  label: 'Expenses',
                  data: expenseData,
                  backgroundColor: chartColors.danger,
                  order: 2
                },
                {
                  type: 'line',
                  label: 'Savings',
                  data: savingsData,
                  borderColor: chartColors.primary,
                  backgroundColor: 'transparent',
                  tension: 0.4,
                  pointBackgroundColor: chartColors.primary,
                  pointBorderColor: '#fff',
                  pointRadius: isMobile ? 3 : 5,
                  yAxisID: 'y1',
                  order: 0
                }
              ]
            };
            break;
          }
          
          case 'spending': {
            log('FinancialCharts', 'Fetching spending data', { timeRange });
            const spending = await apiService.getSpendingByCategory(timeRange);
            
            // Process spending data
            categories = spending.map(item => item.category);
            amounts = spending.map(item => Math.abs(item.amount));
            backgroundColors = spending.map((_, index) => {
              const colorKeys = Object.keys(chartColors).filter(key => !key.includes('Gradient'));
              return chartColors[colorKeys[index % colorKeys.length]];
            });
            
            data = {
              labels: categories,
              datasets: [
                {
                  data: amounts,
                  backgroundColor: backgroundColors,
                  borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                  borderWidth: 1,
                  hoverOffset: 15
                }
              ]
            };
            break;
          }
          
          case 'goals': {
            log('FinancialCharts', 'Fetching goals data');
            const goals = await apiService.getFinancialGoals();
            
            // Process goals data
            goalNames = goals.map(goal => goal.name);
            targetAmounts = goals.map(goal => goal.target_amount);
            currentAmounts = goals.map(goal => goal.current_amount);
            percentComplete = goals.map(goal => 
              (goal.current_amount / goal.target_amount) * 100
            );
            
            data = {
              labels: goalNames,
              datasets: [
                {
                  label: 'Target Amount',
                  data: targetAmounts,
                  backgroundColor: chartColors.pastelBlue,
                  order: 1
                },
                {
                  label: 'Current Amount',
                  data: currentAmounts,
                  backgroundColor: chartColors.primary,
                  order: 2
                }
              ]
            };
            break;
          }
          
          default:
            throw new Error(`Unknown chart type: ${activeChart}`);
        }
        
        setChartData(data);
      } catch (err) {
        logError('FinancialCharts', 'Error fetching chart data', err);
        setError(err);
        
        // Attempt to use fallback data
        try {
          const fallbackData = generateFallbackChartData(activeChart, timeRange);
          setChartData(fallbackData);
          setError(null); // Clear error if fallback data is available
        } catch (fallbackErr) {
          logError('FinancialCharts', 'Error generating fallback data', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, [activeChart, timeRange, currentUser]);

  // Generate chart options based on chart type
  const chartOptions = useMemo(() => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: isMobile ? 'bottom' : 'top',
          labels: {
            boxWidth: isMobile ? 12 : 16,
            padding: isMobile ? 10 : 20,
            font: {
              size: isMobile ? 10 : 12
            }
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += currencyFormatter.format(context.raw);
              return label;
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        x: {
          ticks: {
            maxRotation: isMobile ? 45 : 0,
            minRotation: isMobile ? 45 : 0,
            font: {
              size: isMobile ? 8 : 12
            }
          },
          grid: {
            display: !isMobile
          }
        },
        y: {
          beginAtZero: activeChart !== 'netWorth',
          ticks: {
            callback: function(value) {
              return currencyFormatter.format(value);
            },
            font: {
              size: isMobile ? 8 : 12
            }
          }
        }
      }
    };
    
    switch (activeChart) {
      case 'netWorth':
        return {
          ...baseOptions,
          elements: {
            line: {
              tension: 0.3
            }
          }
        };
      
      case 'cashFlow':
        return {
          ...baseOptions,
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              title: {
                display: !isMobile,
                text: 'Amount ($)'
              }
            },
            y1: {
              position: 'right',
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return currencyFormatter.format(value);
                },
                font: {
                  size: isMobile ? 8 : 12
                }
              },
              title: {
                display: !isMobile,
                text: 'Savings ($)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        };
      
      case 'spending':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: 'right',
              labels: {
                boxWidth: isMobile ? 10 : 12,
                font: {
                  size: isMobile ? 8 : 10
                }
              }
            }
          },
          layout: {
            padding: isMobile ? 5 : 20
          }
        };
      
      case 'goals':
        return {
          ...baseOptions,
          indexAxis: 'y',
          elements: {
            bar: {
              borderWidth: 2,
              borderRadius: 4
            }
          }
        };
      
      default:
        return baseOptions;
    }
  }, [activeChart, isMobile]);

  // Handle touch start for mobile swipe between charts
  const handleTouchStart = (e) => {
    const touchDown = e.touches[0].clientX;
    setTouchPosition(touchDown);
  };

  // Handle touch move for mobile swipe between charts
  const handleTouchMove = (e) => {
    if (touchPosition === null) {
      return;
    }
    
    const currentTouch = e.touches[0].clientX;
    const diff = touchPosition - currentTouch;
    
    // Minimum swipe distance threshold
    const minSwipeDistance = 50;
    
    if (diff > minSwipeDistance) {
      // Swiped left - go to next chart
      const currentIndex = chartTypes.findIndex(ct => ct.value === activeChart);
      const nextIndex = (currentIndex + 1) % chartTypes.length;
      setActiveChart(chartTypes[nextIndex].value);
      if (navigator.vibrate) navigator.vibrate(5);
    } else if (diff < -minSwipeDistance) {
      // Swiped right - go to previous chart
      const currentIndex = chartTypes.findIndex(ct => ct.value === activeChart);
      const prevIndex = (currentIndex - 1 + chartTypes.length) % chartTypes.length;
      setActiveChart(chartTypes[prevIndex].value);
      if (navigator.vibrate) navigator.vibrate(5);
    }
    
    setTouchPosition(null);
  };

  // Render the appropriate chart based on activeChart
  const renderChart = () => {
    if (!currentUser) {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Please sign in to view your financial charts</p>
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Sign In
            </Link>
          </div>
        </div>
      );
    }

    if (!hasConnectedAccounts) {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Connect your accounts to view financial charts</p>
            <div className="space-x-4">
              <Link 
                to="/link-accounts" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Connect Bank Account
              </Link>
              <button
                onClick={() => setShowManualAccountModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Add Manual Account
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex justify-center items-center h-64 bg-red-50 rounded-lg p-4">
          <div className="text-red-500 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error.message}</p>
            <p className="text-sm mt-1">{error.details}</p>
            <button 
              onClick={() => {
                setLoading(true);
                setError(null);
                // Re-trigger the fetchChartData effect
                setTimeRange(prev => prev);
              }}
              className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available for the selected period</p>
        </div>
      );
    }
    
    const ChartHeight = isMobile ? 'h-64' : 'h-80';
    
    switch (activeChart) {
      case 'netWorth':
        return (
          <div className={ChartHeight}>
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        );
      
      case 'cashFlow':
        return (
          <div className={ChartHeight}>
            <Bar ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        );
      
      case 'spending':
        return (
          <div className={ChartHeight}>
            <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        );
      
      case 'goals':
        return (
          <div className={ChartHeight}>
            <Bar ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        );
      
      default:
        return (
          <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Unknown chart type</p>
          </div>
        );
    }
  };

  /**
   * Generate mock balance data for fallback
   * @param {string} timeRange - The time range to generate data for
   * @returns {Array} - Array of balance data points
   */
  const generateMockBalanceData = (timeRange) => {
    const now = new Date();
    const data = [];
    let numPoints;
    
    switch (timeRange) {
      case '1M': numPoints = 30; break;
      case '3M': numPoints = 90; break;
      case '6M': numPoints = 180; break;
      case '1Y': numPoints = 365; break;
      case 'ALL': numPoints = 730; break;
      default: numPoints = 90;
    }
    
    // Generate random but realistic-looking data
    let netWorth = 50000 + Math.random() * 20000;
    let assets = netWorth * 1.5;
    let liabilities = assets - netWorth;
    
    for (let i = 0; i < numPoints; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (numPoints - i));
      
      // Add some random fluctuation
      const fluctuation = (Math.random() - 0.5) * 1000;
      assets += fluctuation * 1.5;
      liabilities += fluctuation * 0.5;
      netWorth = assets - liabilities;
      
      data.push({
        date: date.toISOString().split('T')[0],
        netWorth,
        assets,
        liabilities
      });
    }
    
    return data;
  };
  
  /**
   * Generate fallback chart data when API fails
   * @param {string} chartType - The type of chart
   * @param {string} timeRange - The time range
   * @returns {object} - Chart data object
   */
  const generateFallbackChartData = (chartType, timeRange) => {
    switch (chartType) {
      case 'netWorth': {
        const balances = generateMockBalanceData(timeRange);
        const dates = balances.map(item => new Date(item.date).toLocaleDateString());
        const netWorthValues = balances.map(item => item.netWorth);
        const assetValues = balances.map(item => item.assets);
        const liabilityValues = balances.map(item => item.liabilities);
        
        return {
          labels: dates,
          datasets: [
            {
              label: 'Net Worth (Demo)',
              data: netWorthValues,
              borderColor: chartColors.primary,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: isMobile ? 2 : 4,
              order: 0
            },
            {
              label: 'Assets (Demo)',
              data: assetValues,
              borderColor: chartColors.success,
              borderDash: [5, 5],
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 0,
              order: 1
            },
            {
              label: 'Liabilities (Demo)',
              data: liabilityValues,
              borderColor: chartColors.danger,
              borderDash: [5, 5],
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 0,
              order: 2
            }
          ]
        };
      }
      
      // Add fallback data for other chart types
      // ... (similar implementation for other chart types)
      
      default:
        return {
          labels: ['No Data Available'],
          datasets: [{
            label: 'No Data',
            data: [0],
            backgroundColor: chartColors.light
          }]
        };
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching transactions analytics data...');
        const response = await apiService.getTransactionsAnalytics();
        
        console.log('Analytics data received:', response);
        if (response && response.data) {
          setAnalyticsData(response.data);
        } else {
          // Use fallback data if no response
          setAnalyticsData(generateFallbackData());
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        
        // Check if this is a CORS error
        if (err.isCorsError) {
          setError({
            message: 'Network error: Unable to connect to the analytics service. This may be due to CORS restrictions.',
            details: 'Please check your network connection and ensure the API server is running.'
          });
        } else if (err.response && err.response.status === 401) {
          setError({
            message: 'Authentication required',
            details: 'Please sign in to view your financial analytics.'
          });
        } else if (err.response && err.response.status === 403) {
          setError({
            message: 'Access denied',
            details: 'You do not have permission to access this data.'
          });
        } else {
          setError({
            message: err.response?.data?.error || 'Failed to load financial data',
            details: err.response?.data?.message || err.message || 'An unexpected error occurred'
          });
        }
        
        // Generate fallback data for development/demo purposes
        if (process.env.NODE_ENV !== 'production') {
          console.log('Generating fallback data for development');
          setAnalyticsData(generateFallbackData());
        }
        
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  // Generate fallback data for development/demo purposes
  const generateFallbackData = () => {
    const categories = [
      'Food & Dining', 'Shopping', 'Housing', 'Transportation', 
      'Entertainment', 'Health & Fitness', 'Travel', 'Education'
    ];
    
    const categoryBreakdown = categories.map((category, index) => ({
      category,
      amount: Math.floor(Math.random() * 1000) + 100,
      count: Math.floor(Math.random() * 20) + 1
    }));
    
    const monthlyTrends = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate);
      month.setMonth(currentDate.getMonth() - i);
      
      monthlyTrends.push({
        month: month.toISOString().substring(0, 7), // YYYY-MM format
        spending: Math.floor(Math.random() * 3000) + 1000,
        income: Math.floor(Math.random() * 5000) + 3000
      });
    }
    
    return {
      summary: {
        totalSpending: categoryBreakdown.reduce((sum, item) => sum + item.amount, 0),
        totalIncome: monthlyTrends.reduce((sum, item) => sum + item.income, 0),
        savingsRate: 15,
        transactionCount: 87,
        averageTransaction: 120
      },
      categoryBreakdown,
      monthlyTrends,
      topMerchants: [
        { name: 'Amazon', amount: 450, count: 8 },
        { name: 'Walmart', amount: 325, count: 5 },
        { name: 'Target', amount: 275, count: 4 },
        { name: 'Starbucks', amount: 180, count: 12 },
        { name: 'Uber', amount: 120, count: 6 }
      ]
    };
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format month labels
  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    
    try {
      const date = new Date(monthStr + '-01');
      return date.toLocaleString('default', { month: 'short' });
    } catch (e) {
      console.error('Error formatting month:', e);
      return monthStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Spending</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData?.summary.totalSpending)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData?.summary.totalIncome)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Savings Rate</h3>
          <p className="text-2xl font-bold text-gray-900">{analyticsData?.summary.savingsRate}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Avg. Transaction</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData?.summary.averageTransaction)}</p>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Monthly Income & Spending</h2>
        <div className="h-80">
          <ReCharts.ResponsiveContainer width="100%" height="100%">
            <ReCharts.LineChart
              data={analyticsData?.monthlyTrends}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <ReCharts.CartesianGrid strokeDasharray="3 3" />
              <ReCharts.XAxis 
                dataKey="month" 
                tickFormatter={formatMonth}
                tick={{ fontSize: 12 }}
              />
              <ReCharts.YAxis 
                tickFormatter={(value) => `$${value/1000}k`}
                tick={{ fontSize: 12 }}
              />
              <ReCharts.Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => {
                  try {
                    const date = new Date(label + '-01');
                    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
                  } catch (e) {
                    return label;
                  }
                }}
              />
              <ReCharts.Legend />
              <ReCharts.Line 
                type="monotone" 
                dataKey="income" 
                stroke="#0088FE" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
                name="Income"
              />
              <ReCharts.Line 
                type="monotone" 
                dataKey="spending" 
                stroke="#FF8042" 
                strokeWidth={2}
                name="Spending"
              />
            </ReCharts.LineChart>
          </ReCharts.ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown and Top Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          <div className="h-80">
            <ReCharts.ResponsiveContainer width="100%" height="100%">
              <ReCharts.PieChart>
                <ReCharts.Pie
                  data={analyticsData?.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="category"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData?.categoryBreakdown.map((entry, index) => (
                    <ReCharts.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </ReCharts.Pie>
                <ReCharts.Tooltip formatter={(value) => formatCurrency(value)} />
                <ReCharts.Legend layout="vertical" verticalAlign="middle" align="right" />
              </ReCharts.PieChart>
            </ReCharts.ResponsiveContainer>
          </div>
        </div>

        {/* Top Merchants */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Top Merchants</h2>
          <div className="h-80">
            <ReCharts.ResponsiveContainer width="100%" height="100%">
              <ReCharts.BarChart
                data={analyticsData?.topMerchants}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <ReCharts.CartesianGrid strokeDasharray="3 3" />
                <ReCharts.XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <ReCharts.YAxis type="category" dataKey="name" width={100} />
                <ReCharts.Tooltip formatter={(value) => formatCurrency(value)} />
                <ReCharts.Legend />
                <ReCharts.Bar dataKey="amount" fill="#8884d8" name="Amount Spent">
                  {analyticsData?.topMerchants.map((entry, index) => (
                    <ReCharts.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </ReCharts.Bar>
              </ReCharts.BarChart>
            </ReCharts.ResponsiveContainer>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Warning: Using fallback data
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{error.message}</p>
                <p className="mt-1">{error.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialCharts; 