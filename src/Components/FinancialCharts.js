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
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/liveApi';
import { currencyFormatter } from '../utils/formatters';
import { log, logError } from '../utils/logger';
import LoadingSpinner from './ui/LoadingSpinner';

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
  Tooltip,
  Legend,
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
        
        switch (activeChart) {
          case 'netWorth':
            log('FinancialCharts', 'Fetching net worth data', { timeRange });
            const balances = await apiService.getBalanceHistory(timeRange);
            
            // Process balances data
            const dates = balances.map(item => new Date(item.date).toLocaleDateString());
            const netWorthValues = balances.map(item => item.netWorth);
            const assetValues = balances.map(item => item.assets);
            const liabilityValues = balances.map(item => item.liabilities);
            
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
          
          case 'cashFlow':
            log('FinancialCharts', 'Fetching cash flow data', { timeRange });
            const cashFlow = await apiService.getCashFlowData(timeRange);
            
            // Process cash flow data
            const cashFlowLabels = cashFlow.map(item => item.month);
            const incomeData = cashFlow.map(item => item.income);
            const expenseData = cashFlow.map(item => Math.abs(item.expenses));
            const savingsData = cashFlow.map(item => item.income - Math.abs(item.expenses));
            
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
          
          case 'spending':
            log('FinancialCharts', 'Fetching spending data', { timeRange });
            const spending = await apiService.getSpendingByCategory(timeRange);
            
            // Process spending data
            const categories = spending.map(item => item.category);
            const amounts = spending.map(item => Math.abs(item.amount));
            const backgroundColors = spending.map((_, index) => {
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
          
          case 'goals':
            log('FinancialCharts', 'Fetching goals data');
            const goals = await apiService.getFinancialGoals();
            
            // Process goals data
            const goalNames = goals.map(goal => goal.name);
            const targetAmounts = goals.map(goal => goal.target_amount);
            const currentAmounts = goals.map(goal => goal.current_amount);
            const percentComplete = goals.map(goal => 
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
          
          default:
            throw new Error(`Unknown chart type: ${activeChart}`);
        }
        
        setChartData(data);
      } catch (err) {
        logError('FinancialCharts', 'Error fetching chart data:', err);
        setError('Failed to load chart data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, [currentUser, activeChart, timeRange, isMobile]);

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
            <p className="font-medium">{error}</p>
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

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Financial Insights</h2>
        
        {/* Time Range Selector - Desktop */}
        {!isMobile && (
          <div className="flex space-x-1">
            {timeRanges.map(range => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  timeRange === range.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
        
        {/* Time Range Selector - Mobile (Dropdown) */}
        {isMobile && (
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-gray-300 rounded p-1 bg-white"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        )}
      </div>
      
      {/* Chart Type Selection */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {chartTypes.map(chart => (
            <button
              key={chart.value}
              onClick={() => setActiveChart(chart.value)}
              className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                activeChart === chart.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{chart.icon}</span>
              <span className="whitespace-nowrap">{chart.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart Display Area */}
      <div 
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Swipe instructions for mobile */}
        {isMobile && (
          <div className="absolute top-2 right-2 z-10 bg-gray-800 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
            Swipe to change charts
          </div>
        )}
        
        {renderChart()}
      </div>
      
      {/* Chart Description */}
      <div className="mt-4 text-sm text-gray-600">
        {activeChart === 'netWorth' && (
          <p>This chart shows your net worth trend over time, including assets and liabilities.</p>
        )}
        {activeChart === 'cashFlow' && (
          <p>This chart displays your monthly income, expenses, and resulting savings.</p>
        )}
        {activeChart === 'spending' && (
          <p>This chart breaks down your spending by category to show where your money goes.</p>
        )}
        {activeChart === 'goals' && (
          <p>This chart shows your progress towards financial goals.</p>
        )}
      </div>
    </div>
  );
};

export default FinancialCharts; 