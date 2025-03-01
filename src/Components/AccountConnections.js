import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import StockAccountForm from './StockAccountForm';
import BankAccountForm from './BankAccountForm';
import RealEstateForm from './RealEstateForm';
import EditAccountModal from './EditAccountModal';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { usePlaid } from '../contexts/PlaidContext';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Add account types constant
const ACCOUNT_TYPES = {
    ASSETS: {
        LIQUID: {
            CHECKING: 'Checking Account',
            SAVINGS: 'Savings Account',
            MONEY_MARKET: 'Money Market Account',
            CD: 'Certificate of Deposit',
            CASH: 'Cash',
        },
        INVESTMENTS: {
            STOCKS: 'Individual Stocks',
            BONDS: 'Bonds',
            MUTUAL_FUNDS: 'Mutual Funds',
            ETF: 'ETFs',
            IRA: 'IRA',
            ROTH_IRA: 'Roth IRA',
            FOUR_01K: '401(k)',
            FOUR_03B: '403(b)',
            HSA: 'Health Savings Account',
            CRYPTO: 'Cryptocurrency',
        },
        REAL_ESTATE: {
            PRIMARY_HOME: 'Primary Residence',
            INVESTMENT_PROPERTY: 'Investment Property',
            RENTAL_PROPERTY: 'Rental Property',
            LAND: 'Land',
        },
        VEHICLES: {
            CAR: 'Car',
            BOAT: 'Boat',
            RV: 'RV',
            MOTORCYCLE: 'Motorcycle',
        },
        OTHER: {
            COLLECTIBLES: 'Collectibles',
            ART: 'Art',
            JEWELRY: 'Jewelry',
            BUSINESS: 'Business Ownership',
        },
    },
    LIABILITIES: {
        MORTGAGES: {
            PRIMARY_MORTGAGE: 'Primary Mortgage',
            SECOND_MORTGAGE: 'Second Mortgage',
            HELOC: 'Home Equity Line of Credit',
            INVESTMENT_PROPERTY_LOAN: 'Investment Property Loan',
        },
        LOANS: {
            AUTO_LOAN: 'Auto Loan',
            STUDENT_LOAN: 'Student Loan',
            PERSONAL_LOAN: 'Personal Loan',
            BUSINESS_LOAN: 'Business Loan',
        },
        CREDIT: {
            CREDIT_CARD: 'Credit Card',
            STORE_CARD: 'Store Credit Card',
            CREDIT_LINE: 'Line of Credit',
        },
        OTHER: {
            MEDICAL_DEBT: 'Medical Debt',
            TAX_DEBT: 'Tax Debt',
            OTHER_DEBT: 'Other Debt',
        },
    },
};

const TIME_RANGES = {
    '1M': '1 Month',
    '3M': '3 Months',
    '6M': '6 Months',
    '1Y': '1 Year',
    '5Y': '5 Years',
    'ALL': 'All Time'
};

const CHART_VIEWS = {
    NET_WORTH: 'Net Worth',
    PERCENT_CHANGE: 'Percent Change',
    CONTRIBUTION: 'Contribution Breakdown'
};

// Add this new component at the top level of the file, before AccountConnections
const ChartContainer = ({ data, options, type }) => {
    const chartRef = useRef(null);
    const containerRef = useRef(null);
    const prevDataRef = useRef(null);

    // Only update chart when data actually changes
    useEffect(() => {
        if (!containerRef.current || !chartRef.current) return;
        
        const hasDataChanged = JSON.stringify(prevDataRef.current) !== JSON.stringify(data);
        if (!hasDataChanged) return;

        prevDataRef.current = data;
        
        // Debounce the update to prevent too frequent redraws
        const timeoutId = setTimeout(() => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.update('none'); // Disable animations for performance
            }
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [data]);

    // Cleanup chart instance on unmount
    useEffect(() => {
        return () => {
            if (chartRef.current && chartRef.current.destroy) {
                chartRef.current.destroy();
            }
        };
    }, []);

    if (!data || !data.datasets || data.datasets.length === 0 || !data.labels || data.labels.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    const ChartComponent = type === 'Bar' ? Bar : type === 'Doughnut' ? Doughnut : Line;

    return (
        <div ref={containerRef} className="relative h-full w-full">
            <ChartComponent
                ref={chartRef}
                data={data}
                options={{
                    ...options,
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: false, // Disable animations for better performance
                    devicePixelRatio: 1, // Reduce canvas resolution for better performance
                }}
            />
        </div>
    );
};

const NetWorthChart = ({ data, onHover }) => {
    const options = {
        responsive: true,
        interaction: {
            intersect: false,
            mode: 'index',
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Net Worth Over Time'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(value);
                    }
                }
            }
        },
        onHover: (event, elements) => {
            if (elements && elements.length > 0) {
                const dataIndex = elements[0].index;
                const value = data.datasets[0].data[dataIndex];
                const date = data.labels[dataIndex];
                onHover({ value, date });
            }
        }
    };

    return (
        <div className="h-64">
            <Line data={data} options={options} />
        </div>
    );
};

const AccountConnections = () => {
    const { currentUser } = useAuth();
    const { 
        createLinkToken, 
        plaidConfig,
        exchangePublicToken,
        accounts,
        loading: plaidLoading,
        error: plaidError
    } = usePlaid();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});
    const [balances, setBalances] = useState([]);
    const [showManualAccountModal, setShowManualAccountModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTimeRange, setSelectedTimeRange] = useState('1M');
    const [balanceHistory, setBalanceHistory] = useState([]);
    const balanceHistoryRef = useRef([]);
    const [selectedChartView, setSelectedChartView] = useState('NET_WORTH');
    const [manualAccounts, setManualAccounts] = useState({
        assets: [],
        liabilities: []
    });
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [plaidAccountSettings, setPlaidAccountSettings] = useState({});
    
    // Use refs for data that doesn't need to trigger re-renders
    const hoveredNetWorthRef = useRef(null);

    // Memoize expensive calculations
    const netWorthData = useMemo(() => {
        if (!balanceHistoryRef.current) return null;
        return prepareNetWorthData(balanceHistoryRef.current);
    }, [balanceHistoryRef.current]);

    const percentChangeData = useMemo(() => {
        if (!balances.length) return null;
        return preparePercentChangeData(balances);
    }, [balances]);

    const contributionData = useMemo(() => {
        if (!balances.length) return null;
        return prepareContributionData(balances);
    }, [balances]);

    // Debounced search term
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch data with debouncing and caching
    const fetchBalanceHistory = useCallback(async () => {
        try {
            const response = await axios.get('/api/plaid/balance-history');
            const history = response.data;
            balanceHistoryRef.current = history;
            
            // Set initial net worth
            if (history.length > 0) {
                hoveredNetWorthRef.current = {
                    value: history[history.length - 1].netWorth,
                    date: new Date(history[history.length - 1].date).toLocaleDateString()
                };
            }
        } catch (error) {
            console.error('Error fetching balance history:', error);
            toast.error('Failed to fetch balance history');
        }
    }, []);

    // Effect to fetch balance history with proper cleanup
    useEffect(() => {
        if (!currentUser) return;
        
        let isMounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                await fetchBalanceHistory();
                if (!isMounted) return;
            } catch (error) {
                if (!isMounted) return;
                console.error('Error:', error);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [currentUser, selectedTimeRange, fetchBalanceHistory]);

    // Custom hook for search term debouncing
    function useDebounce(value, delay) {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);

        return debouncedValue;
    }

    // Initialize Plaid when component mounts
    useEffect(() => {
        if (currentUser) {
            createLinkToken();
        }
    }, [currentUser, createLinkToken]);

    const { open, ready } = usePlaidLink(plaidConfig || {});

    // Debug log for component state
    useEffect(() => {
        const info = {
            isAuthenticated: !!currentUser,
            ready: !!ready,
            loading,
            accountsCount: accounts.length,
            hasPlaidConfig: !!plaidConfig
        };
        console.log('Debug info:', info);
        setDebugInfo(info);
        
        if (!currentUser) {
            console.error('No authentication token found');
            toast.error('Please log in to connect accounts');
        }
    }, [currentUser, ready, loading, accounts, plaidConfig]);

    // Fetch accounts and balances
    const fetchAccounts = async () => {
        if (!currentUser) {
            console.error('No token available for fetching accounts');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/plaid/accounts', {
                headers: {
                    'Authorization': `Bearer ${currentUser}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch accounts');
            }

            const data = await response.json();
            setAccounts(data);
            await fetchBalanceHistory();
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('Failed to fetch accounts');
        } finally {
            setLoading(false);
        }
    };

    // Exchange public token for access token
    const handleExchangeToken = async (publicToken, metadata) => {
        if (!currentUser) {
            toast.error('Please log in to connect accounts');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/plaid/exchange-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ public_token: publicToken })
            });

            if (!response.ok) {
                throw new Error('Failed to exchange token');
            }

            toast.success('Account connected successfully!');
            await fetchAccounts();
        } catch (error) {
            console.error('Error exchanging token:', error);
            toast.error('Failed to connect account');
        } finally {
            setLoading(false);
        }
    };

    // Sync account balances
    const syncBalances = async () => {
        if (!currentUser) {
            toast.warning('Please log in to sync balances');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/plaid/sync-balances', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to sync balances');
            }

            await fetchAccounts();
            toast.success('Balances synced successfully');
        } catch (error) {
            console.error('Error syncing balances:', error);
            toast.error('Failed to sync balances');
        } finally {
            setLoading(false);
        }
    };

    // Handle manual account submission
    const handleManualAccountSubmit = async (accountData) => {
        try {
            setLoading(true);
            const response = await fetch('/api/accounts/manual', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(accountData)
            });

            if (!response.ok) {
                throw new Error('Failed to add manual account');
            }

            await fetchAccounts();
            setShowManualAccountModal(false);
            toast.success('Manual account added successfully');
        } catch (error) {
            console.error('Error adding manual account:', error);
            toast.error('Failed to add manual account');
        } finally {
            setLoading(false);
        }
    };

    // Handle account update
    const handleAccountUpdate = async (accountId, updates) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/accounts/${accountId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${currentUser}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Failed to update account');
            }

            await fetchAccounts();
            toast.success('Account updated successfully');
        } catch (error) {
            console.error('Error updating account:', error);
            toast.error('Failed to update account');
        } finally {
            setLoading(false);
        }
    };

    // Handle account deletion
    const handleAccountDelete = async (accountId) => {
        if (!window.confirm('Are you sure you want to delete this account?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/accounts/${accountId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            await fetchAccounts();
            toast.success('Account deleted successfully');
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

    const handleLinkButtonClick = () => {
        if (!currentUser) {
            toast.warning('Please log in to connect accounts');
            return;
        }
        if (ready) {
            open();
        } else {
            toast.warning('Plaid Link is not ready yet');
        }
    };

    // Function to sort accounts by velocity
    const sortAccountsByVelocity = (accounts) => {
        const velocityOrder = {
            'checking': 1,
            'savings': 2,
            'cash management': 3,
            'investment': 4,
            'credit card': 5,
            'loan': 6,
        };

        return accounts.sort((a, b) => {
            const typeA = a.account_type.toLowerCase();
            const typeB = b.account_type.toLowerCase();
            
            const orderA = Object.entries(velocityOrder).find(([key]) => typeA.includes(key))?.[1] || 999;
            const orderB = Object.entries(velocityOrder).find(([key]) => typeB.includes(key))?.[1] || 999;
            
            return orderA - orderB;
        });
    };

    // Function to calculate total assets and liabilities
    const calculateTotals = () => {
        let assets = 0;
        let liabilities = 0;

        // Calculate totals from Plaid accounts
        balances.forEach(balance => {
            const accountId = balance.account_id;
            const isVisible = plaidAccountSettings[accountId]?.isVisible ?? true;
            
            if (isVisible) {
                const amount = parseFloat(balance.current_balance) || 0;
                const isLiability = balance.account_type.toLowerCase().includes('loan') || 
                                  balance.account_type.toLowerCase().includes('credit');
                
                if (isLiability) {
                    liabilities += Math.abs(amount);
                } else {
                    assets += amount;
                }
            }
        });

        // Add manual assets
        manualAccounts.assets.forEach(account => {
            if (account.includeInTotal) {
                assets += parseFloat(account.balance) || 0;
            }
        });

        // Add manual liabilities
        manualAccounts.liabilities.forEach(account => {
            if (account.includeInTotal) {
                liabilities += Math.abs(parseFloat(account.balance) || 0);
            }
        });

        return {
            assets,
            liabilities,
            netWorth: assets - liabilities
        };
    };

    // Update prepareNetWorthData function to use balance history
    const prepareNetWorthData = () => {
        if (!balanceHistoryRef.current) return null;

        return {
            labels: balanceHistoryRef.current.map(entry => new Date(entry.date).toLocaleDateString()),
            datasets: [
                {
                    label: 'Net Worth',
                    data: balanceHistoryRef.current.map(entry => entry.netWorth),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Assets',
                    data: balanceHistoryRef.current.map(entry => entry.total_assets),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.5)',
                    fill: true
                },
                {
                    label: 'Liabilities',
                    data: balanceHistoryRef.current.map(entry => entry.total_liabilities),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    fill: true
                }
            ]
        };
    };

    // Calculate percentage change between two values
    const calculatePercentChange = (currentValue, previousValue) => {
        if (!previousValue) return 0;
        return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    };

    // Prepare percentage change data
    const preparePercentChangeData = (balanceData) => {
        const netWorthByDate = {};
        let previousValue = null;
        const percentChanges = [];
        const dates = [];

        balanceData.forEach(balance => {
            const date = new Date(balance.timestamp).toLocaleDateString();
            if (!netWorthByDate[date]) {
                netWorthByDate[date] = 0;
            }
            netWorthByDate[date] += balance.current_balance || 0;
        });

        Object.entries(netWorthByDate).forEach(([date, value]) => {
            const percentChange = calculatePercentChange(value, previousValue);
            if (previousValue !== null) {
                dates.push(date);
                percentChanges.push(percentChange);
            }
            previousValue = value;
        });

        return {
            labels: dates,
            datasets: [{
                label: 'Percent Change',
                data: percentChanges,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: percentChanges.map(value => 
                    value >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                ),
                borderWidth: 1,
                type: 'bar'
            }]
        };
    };

    // Prepare contribution breakdown data
    const prepareContributionData = (balanceData) => {
        const contributionsByType = {};
        const latestDate = new Date(Math.max(...balanceData.map(b => new Date(b.timestamp))));

        balanceData
            .filter(b => new Date(b.timestamp).toDateString() === latestDate.toDateString())
            .forEach(balance => {
                const type = balance.account_type;
                if (!contributionsByType[type]) {
                    contributionsByType[type] = 0;
                }
                contributionsByType[type] += balance.current_balance || 0;
            });

        return {
            labels: Object.keys(contributionsByType),
            datasets: [{
                data: Object.values(contributionsByType),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ]
            }]
        };
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Handle account type selection
    const handleAccountTypeSelect = (type) => {
        setSelectedAccountType(type);
        setShowAccountForm(true);
    };

    // Handle form submission
    const handleAccountSubmit = async (accountData) => {
        try {
            const response = await fetch('/api/manual-accounts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(accountData)
            });

            if (response.ok) {
                const newAccount = await response.json();
                // Update the appropriate list based on category
                if (accountData.category === 'ASSETS') {
                    setManualAccounts(prev => ({
                        ...prev,
                        assets: [...prev.assets, newAccount]
                    }));
                } else {
                    setManualAccounts(prev => ({
                        ...prev,
                        liabilities: [...prev.liabilities, newAccount]
                    }));
                }
                toast.success('Account added successfully');
                setShowManualAccountModal(false);
                setSelectedAccountType(null);
                setShowAccountForm(false);
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to add account');
            }
        } catch (error) {
            console.error('Error adding account:', error);
            toast.error('Error adding account');
        }
    };

    // Handle form cancellation
    const handleFormCancel = () => {
        setShowAccountForm(false);
        setSelectedAccountType(null);
    };

    // Add cleanup effect for charts
    useEffect(() => {
        return () => {
            // Destroy all chart instances when component unmounts
            const charts = ChartJS.instances;
            Object.keys(charts).forEach(key => {
                if (charts[key] && charts[key].destroy) {
                    charts[key].destroy();
                }
            });
        };
    }, []); // Only run on unmount

    // Add function to handle editing a manual account
    const handleEditAccount = async (updatedAccount) => {
        try {
            const response = await fetch(`/api/manual-accounts/${updatedAccount.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${currentUser}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedAccount)
            });

            if (response.ok) {
                const updated = await response.json();
                setManualAccounts(prev => ({
                    assets: prev.assets.map(acc => 
                        acc.id === updated.id ? updated : acc
                    ),
                    liabilities: prev.liabilities.map(acc => 
                        acc.id === updated.id ? updated : acc
                    )
                }));
                toast.success('Account updated successfully');
                setEditingAccount(null);
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to update account');
            }
        } catch (error) {
            console.error('Error updating account:', error);
            toast.error('Error updating account');
        }
    };

    // Add function to handle deleting a manual account
    const handleDeleteAccount = async (accountId) => {
        try {
            const response = await fetch(`/api/manual-accounts/${accountId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser}`
                }
            });

            if (response.ok) {
                setManualAccounts(prev => ({
                    assets: prev.assets.filter(acc => acc.id !== accountId),
                    liabilities: prev.liabilities.filter(acc => acc.id !== accountId)
                }));
                toast.success('Account deleted successfully');
                setEditingAccount(null);
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Error deleting account');
        }
    };

    // Add function to toggle Plaid account visibility
    const togglePlaidAccountVisibility = (accountId) => {
        setPlaidAccountSettings(prev => ({
            ...prev,
            [accountId]: {
                ...prev[accountId],
                isVisible: !prev[accountId]?.isVisible
            }
        }));
    };

    // Update the Plaid accounts table to include visibility toggle
    const renderPlaidAccountsTable = () => (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Linked Via Plaid</h2>
            </div>
            {loading ? (
                <div className="p-6 text-center text-gray-500">Loading accounts...</div>
            ) : accounts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                    No accounts connected via Plaid. Click "Connect Via Plaid" to get started.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Include</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortAccountsByVelocity(balances).map((balance, index) => (
                                <tr key={index} className={`hover:bg-gray-50 ${
                                    plaidAccountSettings[balance.account_id]?.isVisible === false ? 'opacity-50' : ''
                                }`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{balance.institution_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{balance.account_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{balance.account_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(balance.current_balance)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={plaidAccountSettings[balance.account_id]?.isVisible ?? true}
                                                onChange={() => togglePlaidAccountVisibility(balance.account_id)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    // Update manual accounts tables to include edit button and visibility indicator
    const renderManualAccountsTable = (accounts, title) => (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <h2 className="text-xl font-bold p-4 bg-gray-50">{title}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Include</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(accounts) && accounts.length > 0 ? (
                            accounts.map((account, index) => (
                                <tr key={index} className={`hover:bg-gray-50 ${
                                    !account.includeInTotal ? 'opacity-50' : ''
                                }`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(account.balance)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={account.includeInTotal}
                                                onChange={() => handleEditAccount({
                                                    ...account,
                                                    includeInTotal: !account.includeInTotal
                                                })}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => setEditingAccount(account)}
                                            className="text-blue-500 hover:text-blue-700 mr-2"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No accounts found. Connect an account to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Add new function to get current net worth value
    const getCurrentNetWorth = () => {
        const totals = calculateTotals();
        return totals.netWorth;
    };

    // Update the Net Worth Display section
    const renderNetWorthDisplay = () => {
        const totals = calculateTotals();
        return (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-600">Total Assets</h3>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.assets)}</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-600">Total Liabilities</h3>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.liabilities)}</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-600">Net Worth</h3>
                        <p className={`text-2xl font-bold ${totals.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(totals.netWorth)}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // Update the feature request section to be more compact
    const renderFeatureRequest = () => (
        <div className="flex items-center">
            <button
                className="group relative inline-flex items-center"
                onClick={() => window.location.href = '/contact'}
            >
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">?</span>
                </div>
                <span className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                    Don't see a feature you would use? Request it here!
                </span>
            </button>
        </div>
    );

    // Add this section to your JSX where you want the chart to appear
    const renderNetWorthSection = () => {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Net Worth Trend</h2>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">
                            {hoveredNetWorthRef.current?.date || 'Current'}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                            {hoveredNetWorthRef.current ? formatCurrency(hoveredNetWorthRef.current.value) : 'Loading...'}
                        </p>
                    </div>
                </div>
                {balanceHistoryRef.current ? (
                    <NetWorthChart 
                        data={balanceHistoryRef.current} 
                        onHover={(value) => {
                            hoveredNetWorthRef.current = value;
                        }}
                    />
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>
        );
    };

    const processLinkedAccounts = (linkedAccounts) => {
        if (!Array.isArray(linkedAccounts) || !Array.isArray(accounts)) {
            return [];
        }
        const existingIds = accounts.map(a => a.account_id);
        return linkedAccounts.filter(a => !existingIds.includes(a.account_id));
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Account Connections</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Connect your financial accounts to track your net worth and financial goals.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:flex sm:items-center sm:space-x-4">
                    <button
                        onClick={() => setShowManualAccountModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Manually Add Account
                    </button>
                    <button
                        onClick={handleLinkButtonClick}
                        disabled={!currentUser || loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        Connect Via Plaid
                    </button>
                    <button
                        onClick={syncBalances}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                        Sync Balances
                    </button>
                    {renderFeatureRequest()}
                </div>
            </div>

            {/* Net Worth Chart */}
            {balanceHistoryRef.current && balanceHistoryRef.current.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Portfolio Analysis</h2>
                            <div className="flex space-x-2">
                                {/* Time Range Selector */}
                                <div className="flex space-x-2 mr-4">
                                    {Object.entries(TIME_RANGES).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedTimeRange(key)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                                selectedTimeRange === key
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Chart View Selector */}
                                <div className="flex space-x-2">
                                    {Object.entries(CHART_VIEWS).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedChartView(key)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                                selectedChartView === key
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Chart Display */}
                        <div className="h-96">
                            {selectedChartView === 'NET_WORTH' && (
                                <ChartContainer
                                    type="Line"
                                    data={netWorthData}
                                    options={{
                                        scales: {
                                            y: {
                                                beginAtZero: false,
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.1)',
                                                },
                                                ticks: {
                                                    callback: (value) => formatCurrency(value)
                                                }
                                            }
                                        },
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: (context) => {
                                                        return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            )}

                            {selectedChartView === 'PERCENT_CHANGE' && balances.length > 0 && (
                                <ChartContainer
                                    type="Bar"
                                    data={percentChangeData}
                                    options={{
                                        scales: {
                                            y: {
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.1)',
                                                },
                                                ticks: {
                                                    callback: (value) => `${value.toFixed(2)}%`
                                                }
                                            }
                                        },
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: (context) => {
                                                        return `Change: ${context.raw.toFixed(2)}%`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            )}

                            {selectedChartView === 'CONTRIBUTION' && balances.length > 0 && (
                                <ChartContainer
                                    type="Doughnut"
                                    data={contributionData}
                                    options={{
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: (context) => {
                                                        const value = context.raw;
                                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                        const percentage = ((value / total) * 100).toFixed(1);
                                                        return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Net Worth Display */}
            {renderNetWorthDisplay()}

            {/* Net Worth Trend Section */}
            {renderNetWorthSection()}

            {/* Plaid Accounts Table */}
            {renderPlaidAccountsTable()}

            {/* Manual Accounts Tables */}
            {manualAccounts.assets.length > 0 && renderManualAccountsTable(manualAccounts.assets, 'Assets')}
            {manualAccounts.liabilities.length > 0 && renderManualAccountsTable(manualAccounts.liabilities, 'Liabilities')}

            {/* Manual Account Modal */}
            {showManualAccountModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Add Account</h3>
                                <button 
                                    onClick={() => {
                                        setShowManualAccountModal(false);
                                        setSelectedAccountType(null);
                                        setShowAccountForm(false);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ×
                                </button>
                            </div>

                            {!showAccountForm ? (
                                <>
                                    {/* Search Bar */}
                                    <div className="relative mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search account types..."
                                            className="w-full px-4 py-2 border rounded-lg"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" />
                                    </div>

                                    {/* Account Type List */}
                                    <div className="overflow-y-auto max-h-96">
                                        {Object.entries(ACCOUNT_TYPES).map(([category, subcategories]) => (
                                            <div key={category} className="mb-4">
                                                <h4 className="font-bold text-gray-700 mb-2">{category}</h4>
                                                {Object.entries(subcategories).map(([subcat, types]) => (
                                                    <div key={subcat} className="ml-4 mb-2">
                                                        <h5 className="font-semibold text-gray-600 mb-1">{subcat}</h5>
                                                        {Object.entries(types)
                                                            .filter(([_, name]) => 
                                                                name.toLowerCase().includes(searchTerm.toLowerCase())
                                                            )
                                                            .map(([type, name]) => (
                                                                <button
                                                                    key={type}
                                                                    onClick={() => handleAccountTypeSelect(type)}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                                                >
                                                                    {name}
                                                                </button>
                                                            ))
                                                        }
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full">
                                    {selectedAccountType === 'STOCKS' && (
                                        <StockAccountForm
                                            onSubmit={handleAccountSubmit}
                                            onCancel={handleFormCancel}
                                        />
                                    )}
                                    {(selectedAccountType === 'CHECKING' || 
                                      selectedAccountType === 'SAVINGS' || 
                                      selectedAccountType === 'MONEY_MARKET' || 
                                      selectedAccountType === 'CD') && (
                                        <BankAccountForm
                                            onSubmit={handleAccountSubmit}
                                            onCancel={handleFormCancel}
                                            accountType={selectedAccountType}
                                        />
                                    )}
                                    {(selectedAccountType === 'PRIMARY_HOME' || 
                                      selectedAccountType === 'INVESTMENT_PROPERTY' || 
                                      selectedAccountType === 'RENTAL_PROPERTY' || 
                                      selectedAccountType === 'LAND') && (
                                        <RealEstateForm
                                            onSubmit={handleAccountSubmit}
                                            onCancel={handleFormCancel}
                                            accountType={selectedAccountType}
                                        />
                                    )}
                                    {/* Add more account type forms here */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Account Modal */}
            {editingAccount && (
                <EditAccountModal
                    account={editingAccount}
                    onSave={handleEditAccount}
                    onCancel={() => setEditingAccount(null)}
                    onDelete={handleDeleteAccount}
                />
            )}
        </div>
    );
};

export default AccountConnections;