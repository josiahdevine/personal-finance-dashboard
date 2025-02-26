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
    const { token } = useContext(AuthContext);
    const [linkToken, setLinkToken] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState({});
    const [showManualAccountModal, setShowManualAccountModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccountType, setSelectedAccountType] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('1Y');
    const [selectedChartView, setSelectedChartView] = useState('NET_WORTH');
    const [manualAccounts, setManualAccounts] = useState({
        assets: [],
        liabilities: []
    });
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [plaidAccountSettings, setPlaidAccountSettings] = useState({});
    
    // Use refs for data that doesn't need to trigger re-renders
    const balanceHistoryRef = useRef(null);
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
        if (!token) return;
        
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
    }, [token, selectedTimeRange, fetchBalanceHistory]);

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

    // Initialize Plaid Link
    const config = {
        token: linkToken,
        onSuccess: (public_token, metadata) => {
            console.log('Plaid Link success:', { public_token, metadata });
            exchangePublicToken(public_token, metadata);
        },
        onExit: (err, metadata) => {
            console.log('Plaid Link exit:', { err, metadata });
            if (err) {
                toast.error(`Error connecting to bank: ${err.message || 'Unknown error'}`);
            }
        },
        onEvent: (eventName, metadata) => {
            console.log('Plaid Link event:', eventName, metadata);
        }
    };

    const { open, ready } = usePlaidLink(config);

    // Debug log for auth token and component state
    useEffect(() => {
        const info = {
            isAuthenticated: !!token,
            tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
            linkToken: linkToken ? 'present' : 'none',
            ready: !!ready,
            loading,
            accountsCount: accounts.length
        };
        console.log('Debug info:', info);
        setDebugInfo(info);
        
        if (!token) {
            console.error('No authentication token found');
            toast.error('Please log in to connect accounts');
        }
    }, [token, linkToken, ready, loading, accounts]);

    // Effect to initialize component
    useEffect(() => {
        const initializeComponent = async () => {
            console.log('Component mounted, checking link token...');
            console.log('Current state:', {
                token: !!token,
                linkToken: !!linkToken,
                ready: !!ready,
                loading,
                accountsCount: accounts.length
            });
            
            if (!token) {
                console.error('No auth token available');
                setLoading(false);
                return;
            }

            try {
                if (!linkToken) {
                    console.log('No link token found, creating one...');
                    await createLinkToken();
                }
                await fetchAccounts();
            } catch (error) {
                console.error('Error initializing component:', error);
                toast.error('Error initializing Plaid connection');
            }
        };

        initializeComponent();
    }, [token, linkToken]); // Run when token or linkToken changes

    // Fetch accounts and balances
    const fetchAccounts = async () => {
        if (!token) {
            console.error('No token available for fetching accounts');
            setLoading(false);
            return;
        }

        try {
            console.log('Fetching accounts...');
            const response = await fetch('/api/plaid/accounts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Accounts fetched:', data);
                setAccounts(data.items || []);
                setBalances(data.balances || []);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to fetch accounts:', errorData);
                toast.error('Failed to fetch accounts');
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('Error fetching accounts');
        } finally {
            setLoading(false);
        }
    };

    // Create Plaid Link token
    const createLinkToken = async () => {
        if (!token) {
            console.error('No token available for creating link token');
            toast.error('Please log in to connect accounts');
            return;
        }

        try {
            console.log('Creating link token...');
            
            // Check for sandbox/development mode
            const isDevOrSandbox = window.location.hostname === 'localhost' || 
                                  window.location.hostname === '127.0.0.1' || 
                                  window.location.search.includes('sandbox=true');
            
            if (isDevOrSandbox) {
                console.log('Using Plaid sandbox mode');
                // Hardcoded sandbox link token - in a real app, this would come from your backend
                // This is a placeholder token format that mimics Plaid's token format
                const sandboxLinkToken = 'link-sandbox-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
                setLinkToken(sandboxLinkToken);
                toast.info('Using Plaid sandbox environment');
                return sandboxLinkToken;
            }
            
            const response = await fetch('/api/plaid/create-link-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to create link token:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseText: errorText
                });
                
                // Try to parse error response
                try {
                    const errorData = JSON.parse(errorText);
                    toast.error(`Failed to create link token: ${errorData.error || errorData.message || response.statusText}`);
                } catch (e) {
                    toast.error(`Failed to create link token: ${response.statusText}`);
                }
                
                // Fall back to sandbox mode if API fails
                if (isDevOrSandbox) {
                    console.log('Falling back to sandbox mode after API failure');
                    const sandboxLinkToken = 'link-sandbox-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
                    setLinkToken(sandboxLinkToken);
                    toast.info('Using Plaid sandbox mode due to API failure');
                    return sandboxLinkToken;
                }
                return null;
            }

            const responseData = await response.json();
            console.log('Link token created:', responseData);
            
            if (responseData.link_token) {
                setLinkToken(responseData.link_token);
                return responseData.link_token;
            } else {
                console.error('No link_token in response:', responseData);
                toast.error('Invalid response from server');
                return null;
            }
        } catch (error) {
            console.error('Error creating link token:', error);
            toast.error(`Error creating link token: ${error.message}`);
            
            // Fallback to sandbox mode in case of any error
            const isDevOrSandbox = window.location.hostname === 'localhost' || 
                                  window.location.hostname === '127.0.0.1' || 
                                  window.location.search.includes('sandbox=true');
                                  
            if (isDevOrSandbox) {
                console.log('Falling back to sandbox mode after error');
                const sandboxLinkToken = 'link-sandbox-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
                setLinkToken(sandboxLinkToken);
                toast.info('Using Plaid sandbox mode');
                return sandboxLinkToken;
            }
            return null;
        }
    };

    // Exchange public token
    const exchangePublicToken = async (publicToken, metadata) => {
        try {
            console.log('Exchanging public token:', publicToken);
            console.log('Metadata:', metadata);
            
            // Check for sandbox/development mode
            const isDevOrSandbox = window.location.hostname === 'localhost' || 
                                  window.location.hostname === '127.0.0.1' || 
                                  window.location.search.includes('sandbox=true');
            
            if (isDevOrSandbox) {
                console.log('Using sandbox mode for token exchange');
                
                // Extract information from metadata
                const institutionName = metadata?.institution?.name || 'Sandbox Bank';
                const institutionId = metadata?.institution?.institution_id || 'ins_sandbox';
                const accountsData = metadata?.accounts || [];
                
                // If no accounts in metadata, create mock accounts
                const mockAccounts = accountsData.length > 0 ? 
                    accountsData.map(account => ({
                        account_id: account.id || `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        account_name: account.name || `${institutionName} ${account.subtype || 'Account'}`,
                        account_type: account.subtype || 'checking',
                        current_balance: account.balances?.current || Math.floor(Math.random() * 10000) + 1000,
                        available_balance: account.balances?.available,
                        institution_name: institutionName,
                        institution_id: institutionId,
                        mask: account.mask || '1234'
                    })) : 
                    // Create default mock accounts if none provided
                    [
                        {
                            account_id: `mock-checking-${Date.now()}`,
                            account_name: `${institutionName} Checking`,
                            account_type: 'checking',
                            current_balance: 5432.10,
                            available_balance: 5400.00,
                            institution_name: institutionName,
                            institution_id: institutionId,
                            mask: '1234'
                        },
                        {
                            account_id: `mock-savings-${Date.now()}`,
                            account_name: `${institutionName} Savings`,
                            account_type: 'savings',
                            current_balance: 12345.67,
                            available_balance: 12345.67,
                            institution_name: institutionName,
                            institution_id: institutionId,
                            mask: '5678'
                        }
                    ];
                
                // Add to state - ensure we're not duplicating accounts
                const existingIds = accounts.map(a => a.account_id);
                const newAccounts = mockAccounts.filter(a => !existingIds.includes(a.account_id));
                
                setAccounts(prev => [...prev, ...newAccounts]);
                setBalances(prev => [...prev, ...newAccounts]);
                
                // Also update balance history for charts
                const today = new Date();
                const mockHistory = [];
                
                // Generate 12 months of mock history
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(today);
                    date.setMonth(date.getMonth() - i);
                    
                    // Start with the current balance and work backwards with random fluctuations
                    const totalBalance = newAccounts.reduce((sum, acc) => sum + acc.current_balance, 0);
                    const randomFactor = 0.9 + (Math.random() * 0.2); // Random factor between 0.9 and 1.1
                    const historicalBalance = Math.round(totalBalance * Math.pow(randomFactor, i) * 100) / 100;
                    
                    mockHistory.push({
                        date: date.toISOString().split('T')[0],
                        netWorth: historicalBalance,
                        assets: historicalBalance > 0 ? historicalBalance : 0,
                        liabilities: historicalBalance < 0 ? Math.abs(historicalBalance) : 0
                    });
                }
                
                // Only update history if it's not already set
                if (!balanceHistoryRef.current || balanceHistoryRef.current.length === 0) {
                    balanceHistoryRef.current = mockHistory;
                } else {
                    // Merge with existing history
                    const lastDate = new Date(balanceHistoryRef.current[balanceHistoryRef.current.length - 1].date);
                    const newHistory = balanceHistoryRef.current.slice();
                    
                    // Update the latest entry with the new balance
                    if (newHistory.length > 0) {
                        const latestEntry = newHistory[newHistory.length - 1];
                        latestEntry.netWorth += newAccounts.reduce((sum, acc) => sum + acc.current_balance, 0);
                        latestEntry.assets += newAccounts.reduce((sum, acc) => sum + (acc.current_balance > 0 ? acc.current_balance : 0), 0);
                        latestEntry.liabilities += newAccounts.reduce((sum, acc) => sum + (acc.current_balance < 0 ? Math.abs(acc.current_balance) : 0), 0);
                    }
                    
                    balanceHistoryRef.current = newHistory;
                }
                
                toast.success(`Successfully connected to ${institutionName}`);
                return;
            }
            
            // Real API call for production
            const response = await fetch('/api/plaid/exchange-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    public_token: publicToken,
                    institution: metadata?.institution?.name,
                    institution_id: metadata?.institution?.institution_id,
                    accounts: metadata?.accounts
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Exchange token failed:', errorData);
                toast.error(`Failed to exchange token: ${errorData.error || errorData.message || response.statusText}`);
                
                // Fall back to sandbox mode if in development
                if (isDevOrSandbox) {
                    handleSandboxFallback(metadata);
                }
                return;
            }

            const data = await response.json();
            console.log('Exchange token successful:', data);
            toast.success('Account connected successfully');
            
            // Refresh accounts after connecting
            fetchAccounts();
        } catch (error) {
            console.error('Error exchanging token:', error);
            toast.error(`Error exchanging token: ${error.message}`);
            
            // Fallback for local development
            const isDevOrSandbox = window.location.hostname === 'localhost' || 
                                 window.location.hostname === '127.0.0.1' || 
                                 window.location.search.includes('sandbox=true');
                                 
            if (isDevOrSandbox && metadata) {
                handleSandboxFallback(metadata);
            }
        }
    };

    // Helper function for sandbox fallback
    const handleSandboxFallback = (metadata) => {
        const institutionName = metadata?.institution?.name || 'Sandbox Bank';
        console.log('Using sandbox fallback for', institutionName);
        
        // Create mock accounts
        const mockAccounts = [
            {
                account_id: `mock-checking-${Date.now()}`,
                account_name: `${institutionName} Checking`,
                account_type: 'checking',
                current_balance: 5432.10,
                institution_name: institutionName
            },
            {
                account_id: `mock-savings-${Date.now()}`,
                account_name: `${institutionName} Savings`,
                account_type: 'savings',
                current_balance: 12345.67,
                institution_name: institutionName
            }
        ];
        
        setAccounts(prev => [...prev, ...mockAccounts]);
        setBalances(prev => [...prev, ...mockAccounts]);
        toast.success(`Successfully connected to ${institutionName} (Sandbox)`);
    };

    // Sync account balances
    const syncBalances = async () => {
        if (!token) {
            toast.warning('Please log in to sync balances');
            return;
        }

        setLoading(true);
        try {
            // Check if we're in local development
            const isLocalDevelopment = window.location.hostname === 'localhost';
            
            if (isLocalDevelopment) {
                console.log('Using mock sync for local development');
                
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Update balances with random changes
                const updatedBalances = balances.map(account => {
                    // Random balance change between -5% and +5%
                    const changePercent = (Math.random() * 0.1) - 0.05;
                    const newBalance = account.current_balance * (1 + changePercent);
                    
                    return {
                        ...account,
                        current_balance: Math.round(newBalance * 100) / 100, // Round to 2 decimal places
                        last_updated: new Date().toISOString()
                    };
                });
                
                setBalances(updatedBalances);
                toast.success('Balances updated successfully');
                return;
            }
            
            const response = await fetch('/api/plaid/sync-balances', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Balance sync failed:', response.status, errorText);
                toast.error(`Failed to sync balances: ${response.statusText}`);
                return;
            }

            const data = await response.json();
            console.log('Balance sync successful:', data);
            
            if (data.accounts) {
                setBalances(data.accounts);
                toast.success('Balances updated successfully');
            } else {
                toast.info('No changes in account balances');
            }
            
            // Refresh accounts to get latest data
            fetchAccounts();
        } catch (error) {
            console.error('Error syncing balances:', error);
            toast.error(`Error syncing balances: ${error.message}`);
            
            // Fallback for local development
            if (window.location.hostname === 'localhost') {
                // Simulate updating balances
                const updatedBalances = balances.map(account => ({
                    ...account,
                    current_balance: Math.round(account.current_balance * 1.01), // 1% increase
                    last_updated: new Date().toISOString()
                }));
                
                setBalances(updatedBalances);
                toast.success('Balances updated successfully (Mock)');
            }
        } finally {
            setLoading(false);
        }
    };

    // Log when the link token changes
    useEffect(() => {
        console.log('Link token updated:', linkToken);
    }, [linkToken]);

    // Log when ready status changes
    useEffect(() => {
        console.log('Plaid Link ready status:', ready);
    }, [ready]);

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
                    'Authorization': `Bearer ${token}`,
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
                    'Authorization': `Bearer ${token}`,
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
                    'Authorization': `Bearer ${token}`
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

    const handleLinkButtonClick = () => {
        if (!token) {
            toast.warning('Please log in to connect accounts');
            return;
        }
        
        // Show user feedback immediately
        toast.info('Preparing Plaid connection...');
        
        createLinkToken().then((newLinkToken) => {
            if (newLinkToken) {
                console.log('Link token created, opening Plaid');
                // Short delay to ensure UI is updated
                setTimeout(() => {
                    if (ready) {
                        open();
                    } else {
                        toast.warning('Plaid Link is not ready yet, please try again in a moment');
                    }
                }, 500);
            } else {
                toast.error('Failed to initialize Plaid connection');
            }
        });
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
                        disabled={!token || loading}
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
                                        ))}
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