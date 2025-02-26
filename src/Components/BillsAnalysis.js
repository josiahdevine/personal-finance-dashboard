import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { HiOutlineExclamationCircle, HiUpload, HiPlus, HiTrash, HiPencil, HiX, HiLink } from 'react-icons/hi';
import api from '../services/api';
import { toast } from 'react-toastify';
import { log, logError } from '../utils/logger';
import { parse } from 'papaparse';
import { useAuth } from '../contexts/AuthContext';
import { usePlaid } from '../contexts/PlaidContext';
import { usePlaidLink } from '../contexts/PlaidLinkContext';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function BillsAnalysis({ onExpenseAdded, onExpenseDeleted, onExpensesUpdated }) {
    const { currentUser } = useAuth();
    const { getTransactions, isPlaidConnected } = usePlaid();
    const { createLinkToken, handleLinkSuccess, linkToken, isLinkReady, isLoading: isPlaidLoading } = usePlaidLink();
    const [transactions, setTransactions] = useState([]);
    const [timeframe, setTimeframe] = useState('month');
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [error, setError] = useState(null);
    const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
    const [newExpense, setNewExpense] = useState({
        name: '',
        category: '',
        amount: '',
        dueDate: '',
        recurring: false,
        frequency: 'monthly'
    });
    const [editingExpense, setEditingExpense] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [showImportOptions, setShowImportOptions] = useState(false);
    const [manualImportData, setManualImportData] = useState([]);
    const [isProcessingCsvFile, setIsProcessingCsvFile] = useState(false);
    const [mockData, setMockData] = useState(null);

    // Use mock data for development or when Plaid connection fails
    const generateMockData = useCallback(() => {
        return [
            {
                id: 'mock-bill-1',
                name: 'Netflix Subscription',
                amount: 14.99,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'Entertainment',
                recurring: true,
                frequency: 'monthly',
                paymentChannel: 'online',
                pending: false
            },
            {
                id: 'mock-bill-2',
                name: 'Rent Payment',
                amount: 1500,
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'Housing',
                recurring: true,
                frequency: 'monthly',
                paymentChannel: 'other',
                pending: false
            },
            {
                id: 'mock-bill-3',
                name: 'Electric Bill',
                amount: 85.42,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'Utilities',
                recurring: true,
                frequency: 'monthly',
                paymentChannel: 'online',
                pending: false
            },
            {
                id: 'mock-bill-4',
                name: 'Cell Phone Bill',
                amount: 75.00,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'Utilities',
                recurring: true,
                frequency: 'monthly',
                paymentChannel: 'online',
                pending: false
            },
            {
                id: 'mock-bill-5',
                name: 'Gym Membership',
                amount: 45.99,
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'Health & Fitness',
                recurring: true,
                frequency: 'monthly',
                paymentChannel: 'online',
                pending: false
            },
            {
                id: 'mock-bill-6',
                name: 'Internet Service',
                amount: 65.00,
                date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'Utilities',
                recurring: true,
                frequency: 'monthly',
                paymentChannel: 'online',
                pending: false
            },
            {
                id: 'mock-bill-7',
                name: 'Car Insurance',
                amount: 120.50,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'Insurance',
                recurring: true,
                frequency: 'monthly',
                paymentChannel: 'online',
                pending: false
            },
            {
                id: 'mock-bill-8',
                name: 'Spotify Premium',
                amount: 9.99,
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'Entertainment',
                recurring: true,
                frequency: 'monthly',
                paymentChannel: 'online',
                pending: false
            }
        ];
    }, []);

    // Fetch transactions from Plaid or local storage
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let transactionData;
            
            // First try to get transactions from Plaid
            if (isPlaidConnected) {
                try {
                    log('Fetching transactions from Plaid');
                    transactionData = await getTransactions();
                    log('Transactions fetched:', transactionData.length);
                } catch (plaidError) {
                    logError('Error fetching from Plaid, falling back to local', plaidError);
                    // If Plaid fails, try local storage
                    const storedData = localStorage.getItem('bills_transactions');
                    if (storedData) {
                        transactionData = JSON.parse(storedData);
                        toast.info('Using locally stored transaction data');
                    } else {
                        // If no local data, use mock data
                        transactionData = generateMockData();
                        setMockData(transactionData);
                        toast.info('Using sample transaction data for demonstration');
                    }
                }
            } else {
                // If Plaid is not connected, try local storage
                const storedData = localStorage.getItem('bills_transactions');
                if (storedData) {
                    transactionData = JSON.parse(storedData);
                    log('Using local storage data');
                } else {
                    // If no local data, use mock data
                    transactionData = generateMockData();
                    setMockData(transactionData);
                    toast.info('Using sample transaction data for demonstration');
                }
            }
            
            // Filter and process transactions to identify bills
            const billsOnly = transactionData.filter(transaction => 
                isBill(transaction)
            );
            
            log('Bills found:', billsOnly.length);
            setTransactions(billsOnly);
            
            // Save to local storage for offline use
            localStorage.setItem('bills_transactions', JSON.stringify(transactionData));
        } catch (error) {
            logError('Error fetching transactions:', error);
            setError('Failed to fetch transactions. Please try again later.');
            
            // Use mock data if all else fails
            const mockTransactions = generateMockData();
            setTransactions(mockTransactions);
            setMockData(mockTransactions);
            toast.info('Using sample transaction data for demonstration');
        } finally {
            setLoading(false);
        }
    }, [getTransactions, isPlaidConnected]);

    useEffect(() => {
        if (currentUser) {
            fetchTransactions();
        }
    }, [currentUser, fetchTransactions]);

    // Initialize Plaid Link when needed
    const openPlaidLink = useCallback(async () => {
        try {
            setLoading(true);
            
            // Create link token if not already created
            if (!linkToken) {
                await createLinkToken();
            }
            
            setLoading(false);
        } catch (error) {
            logError('Error initializing Plaid Link:', error);
            setError('Failed to initialize Plaid Link. Please try again later.');
            setLoading(false);
        }
    }, [createLinkToken, linkToken]);

    // Determine if a transaction is a bill based on categories and other attributes
    const isBill = (transaction) => {
        // List of categories typically associated with bills
        const billCategories = [
            'Rent',
            'Mortgage',
            'Utilities',
            'Internet',
            'Phone',
            'Cable',
            'Insurance',
            'Subscriptions',
            'Loan Payment',
            'Memberships'
        ];

        // Check if the transaction category is in our bill categories list
        const isInBillCategory = transaction.category && 
            billCategories.some(cat => 
                transaction.category.toLowerCase().includes(cat.toLowerCase())
            );
            
        // Check for recurring transactions (could be a bill)
        const isRecurring = transaction.recurring === true;
        
        // Most bills are payments, not deposits
        const isPayment = transaction.amount > 0;
        
        return (isInBillCategory || isRecurring) && isPayment;
    };

    // Handle CSV file upload for manual import
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        setIsProcessingCsvFile(true);
        setUploadStatus('Reading file...');
        
        // Parse CSV file
        parse(file, {
            header: true,
            complete: async (results) => {
                try {
                    setUploadStatus('Processing transactions...');
                    
                    // Process the CSV data
                    if (results.data && results.data.length > 0) {
                        // Extract data from CSV format
                        const processedData = results.data.map((row, index) => ({
                            id: `manual-${Date.now()}-${index}`,
                            name: row.description || row.name || row.merchant || '',
                            amount: parseFloat(row.amount || 0),
                            date: row.date || new Date().toISOString(),
                            category: row.category || 'Uncategorized',
                            pending: false,
                        }));
                        
                        setManualImportData(processedData);
                        setUploadStatus('Data processed. Now categorizing with AI...');
                        
                        // Use Gemini API to categorize and classify bills
                        try {
                            // This would typically be an API call to your backend with Gemini integration
                            // For now, we'll simulate the process
                            setTimeout(() => {
                                const categorizedData = processedData.map(transaction => {
                                    // Determine if this is likely a bill based on name
                                    const commonBillKeywords = [
                                        'bill', 'payment', 'subscription', 'monthly', 'utility', 'insurance',
                                        'rent', 'mortgage', 'phone', 'internet', 'electricity', 'gas', 'water'
                                    ];
                                    
                                    const isBill = commonBillKeywords.some(keyword => 
                                        transaction.name.toLowerCase().includes(keyword)
                                    );
                                    
                                    // Categorize based on name
                                    let category = 'Uncategorized';
                                    
                                    if (transaction.name.match(/rent|mortgage|housing|apartment|condo/i)) {
                                        category = 'Housing';
                                    } else if (transaction.name.match(/netflix|spotify|hulu|disney|subscription|entertainment/i)) {
                                        category = 'Entertainment';
                                    } else if (transaction.name.match(/electricity|water|gas|utility|utilities|power|electric/i)) {
                                        category = 'Utilities';
                                    } else if (transaction.name.match(/phone|mobile|wireless|verizon|att|t-mobile|sprint/i)) {
                                        category = 'Phone';
                                    } else if (transaction.name.match(/insurance|geico|statefarm|allstate|progressive/i)) {
                                        category = 'Insurance';
                                    } else if (transaction.name.match(/internet|cable|comcast|xfinity|spectrum|cox/i)) {
                                        category = 'Internet';
                                    }
                                    
                                    // Make sure bill amounts are positive (expenses)
                                    const amount = Math.abs(transaction.amount);
                                    
                                    return {
                                        ...transaction,
                                        category,
                                        recurring: isBill,
                                        amount
                                    };
                                });
                                
                                // Filter to only include bills
                                const billsOnly = categorizedData.filter(transaction => transaction.recurring);
                                
                                // Add to existing transactions
                                setTransactions(prevTransactions => [...prevTransactions, ...billsOnly]);
                                
                                // Save to local storage
                                const allTransactions = [...(JSON.parse(localStorage.getItem('bills_transactions') || '[]')), ...categorizedData];
                                localStorage.setItem('bills_transactions', JSON.stringify(allTransactions));
                                
                                setUploadStatus('');
                                setIsProcessingCsvFile(false);
                                setShowImportOptions(false);
                                
                                toast.success(`Successfully imported ${billsOnly.length} bills`);
                            }, 2000); // Simulate API delay
                        } catch (error) {
                            logError('Error categorizing with AI:', error);
                            setUploadStatus('');
                            setIsProcessingCsvFile(false);
                            toast.error('Error categorizing transactions');
                        }
                    } else {
                        setUploadStatus('No data found in file');
                        setTimeout(() => setUploadStatus(''), 3000);
                        setIsProcessingCsvFile(false);
                    }
                } catch (error) {
                    logError('Error processing file:', error);
                    setUploadStatus('Error processing file');
                    setTimeout(() => setUploadStatus(''), 3000);
                    setIsProcessingCsvFile(false);
                }
            },
            error: (error) => {
                logError('Error parsing CSV:', error);
                setUploadStatus('Error parsing file');
                setTimeout(() => setUploadStatus(''), 3000);
                setIsProcessingCsvFile(false);
            }
        });
    };

    // Retry fetching transactions
    const handleRetryFetch = () => {
        fetchTransactions();
    };

    // Safely prepare chart data, handling potential missing or malformed data
    const prepareChartData = () => {
        try {
            if (!Array.isArray(transactions) || transactions.length === 0) {
                return {
                    labels: [],
                    datasets: [{
                        label: 'Spending by Category',
                        data: [],
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1
                    }]
                };
            }

            return {
                labels: transactions.map(t => t.category || t.name || 'Unknown'),
                datasets: [{
                    label: 'Spending by Category',
                    data: transactions.map(t => typeof t.amount === 'number' ? t.amount : 0),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            };
        } catch (err) {
            logError('BillsAnalysis', 'Error preparing chart data', err);
            return {
                labels: [],
                datasets: [{
                    label: 'Spending by Category',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            };
        }
    };

    const chartData = prepareChartData();

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Spending by Category'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `$${value.toLocaleString()}`
                }
            }
        }
    };
    
    // Handle adding new expense
    const handleAddExpense = () => {
        if (!newExpense.name || !newExpense.amount) {
            toast.error('Name and amount are required');
            return;
        }
        
        try {
            const amount = parseFloat(newExpense.amount);
            if (isNaN(amount)) {
                toast.error('Amount must be a valid number');
                return;
            }
            
            const expense = {
                id: Date.now().toString(),
                ...newExpense,
                amount,
                createdAt: new Date().toISOString()
            };
            
            // Update local state
            const updatedExpenses = [...expenses, expense];
            setExpenses(updatedExpenses);
            
            // Save to localStorage
            localStorage.setItem('monthlyExpenses', JSON.stringify(updatedExpenses));
            
            // Call parent callback if provided
            if (onExpenseAdded) {
                onExpenseAdded(expense);
            }
            
            // Reset form
            setNewExpense({
                name: '',
                category: '',
                amount: '',
                dueDate: '',
                recurring: false,
                frequency: 'monthly'
            });
            setShowAddExpenseForm(false);
            
            // Refresh transactions data
            fetchTransactions();
            
            toast.success('Expense added successfully');
        } catch (error) {
            logError('BillsAnalysis', 'Error adding expense', error);
            toast.error('Failed to add expense');
        }
    };
    
    // Handle deleting an expense
    const handleDeleteExpense = (id) => {
        try {
            const updatedExpenses = expenses.filter(expense => expense.id !== id);
            setExpenses(updatedExpenses);
            
            // Save to localStorage
            localStorage.setItem('monthlyExpenses', JSON.stringify(updatedExpenses));
            
            // Call parent callback if provided
            if (onExpenseDeleted) {
                onExpenseDeleted(id);
            }
            
            // Refresh transactions data
            fetchTransactions();
            
            toast.success('Expense deleted successfully');
        } catch (error) {
            logError('BillsAnalysis', 'Error deleting expense', error);
            toast.error('Failed to delete expense');
        }
    };
    
    // Handle editing an expense
    const handleEditExpense = () => {
        if (!editingExpense || !editingExpense.name || !editingExpense.amount) {
            toast.error('Name and amount are required');
            return;
        }
        
        try {
            const amount = parseFloat(editingExpense.amount);
            if (isNaN(amount)) {
                toast.error('Amount must be a valid number');
                return;
            }
            
            const updatedExpense = {
                ...editingExpense,
                amount,
                updatedAt: new Date().toISOString()
            };
            
            const updatedExpenses = expenses.map(expense => 
                expense.id === updatedExpense.id ? updatedExpense : expense
            );
            
            setExpenses(updatedExpenses);
            
            // Save to localStorage
            localStorage.setItem('monthlyExpenses', JSON.stringify(updatedExpenses));
            
            // Call parent callback if provided
            if (onExpenseAdded) {
                onExpenseAdded(updatedExpense);
            }
            
            // Reset editing state
            setEditingExpense(null);
            
            // Refresh transactions data
            fetchTransactions();
            
            toast.success('Expense updated successfully');
        } catch (error) {
            logError('BillsAnalysis', 'Error updating expense', error);
            toast.error('Failed to update expense');
        }
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Bills Analysis</h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowAddExpenseForm(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <HiPlus className="mr-2" /> Add Expense
                        </button>
                        <button
                            onClick={() => setShowImportOptions(true)}
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            <HiUpload className="mr-2" /> Import
                        </button>
                    </div>
                </div>

                {/* Show error message with connect accounts option */}
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <HiOutlineExclamationCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                            {!isPlaidConnected && (
                                <div className="mt-2">
                                    <button
                                        onClick={openPlaidLink}
                                        className="text-sm text-red-700 font-medium underline"
                                    >
                                        Connect your accounts to get started
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Show connect accounts section if no Plaid connected */}
                {!isPlaidConnected && !mockData && (
                    <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-200">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <HiLink className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-blue-800">Connect Your Accounts</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>Connect your bank accounts to automatically track your bills and recurring payments.</p>
                                    <button 
                                        onClick={openPlaidLink}
                                        disabled={loading || isPlaidLoading}
                                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {loading || isPlaidLoading ? 'Connecting...' : 'Connect Accounts'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Import Options Dialog */}
                {showImportOptions && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h3 className="text-lg font-medium mb-3">Import Options</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-2">Import from CSV</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Upload a CSV file of your transactions and we'll automatically identify bills.
                                </p>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    disabled={isProcessingCsvFile}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-medium
                                        file:bg-indigo-50 file:text-indigo-700
                                        hover:file:bg-indigo-100"
                                />
                                {uploadStatus && (
                                    <p className="mt-2 text-sm text-indigo-600">{uploadStatus}</p>
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Connect Bank (Recommended)</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Securely connect your bank accounts to automatically track bills.
                                </p>
                                <button
                                    onClick={openPlaidLink}
                                    disabled={loading || isPlaidLoading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {loading || isPlaidLoading ? 'Connecting...' : 'Connect Bank'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Content for error state */}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Bills Analysis</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowAddExpenseForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <HiPlus className="mr-2" /> Add Expense
                    </button>
                    <button
                        onClick={() => setShowImportOptions(true)}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        <HiUpload className="mr-2" /> Import
                    </button>
                </div>
            </div>

            {/* Show error message if any */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <HiOutlineExclamationCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Show connect accounts section if no Plaid connected */}
            {!isPlaidConnected && !mockData && (
                <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-200">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <HiLink className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-blue-800">Connect Your Accounts</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>Connect your bank accounts to automatically track your bills and recurring payments.</p>
                                <button 
                                    onClick={openPlaidLink}
                                    disabled={loading || isPlaidLoading}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {loading || isPlaidLoading ? 'Connecting...' : 'Connect Accounts'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show import options if requested */}
            {showImportOptions && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-medium mb-3">Import Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium mb-2">Import from CSV</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Upload a CSV file of your transactions and we'll automatically identify bills.
                            </p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                disabled={isProcessingCsvFile}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-medium
                                    file:bg-indigo-50 file:text-indigo-700
                                    hover:file:bg-indigo-100"
                            />
                            {uploadStatus && (
                                <p className="mt-2 text-sm text-indigo-600">{uploadStatus}</p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Connect Bank (Recommended)</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Securely connect your bank accounts to automatically track bills.
                            </p>
                            <button
                                onClick={openPlaidLink}
                                disabled={loading || isPlaidLoading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {loading || isPlaidLoading ? 'Connecting...' : 'Connect Bank'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Chart section */}
                    <div className="lg:col-span-3">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
                            <div className="h-80">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Expenses section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow-md h-full">
                            <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
                            
                            {/* Add Expense Form */}
                            {showAddExpenseForm && (
                                <div className="bg-gray-50 p-4 rounded-md mb-4">
                                    <h3 className="font-medium mb-3">Add New Expense</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={newExpense.name}
                                                onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category</label>
                                            <select
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={newExpense.category}
                                                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                                            >
                                                <option value="">Select category</option>
                                                <option value="Housing">Housing</option>
                                                <option value="Food">Food</option>
                                                <option value="Transportation">Transportation</option>
                                                <option value="Entertainment">Entertainment</option>
                                                <option value="Utilities">Utilities</option>
                                                <option value="Insurance">Insurance</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Debt">Debt</option>
                                                <option value="Subscriptions">Subscriptions</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                                            <input
                                                type="number"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={newExpense.amount}
                                                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                            <input
                                                type="date"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={newExpense.dueDate}
                                                onChange={(e) => setNewExpense({...newExpense, dueDate: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="recurring"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                checked={newExpense.recurring}
                                                onChange={(e) => setNewExpense({...newExpense, recurring: e.target.checked})}
                                            />
                                            <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                                                Recurring Expense
                                            </label>
                                        </div>
                                        {newExpense.recurring && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                                                <select
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    value={newExpense.frequency}
                                                    onChange={(e) => setNewExpense({...newExpense, frequency: e.target.value})}
                                                >
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="annually">Annually</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex justify-end space-x-3 pt-2">
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                                onClick={() => setShowAddExpenseForm(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                onClick={handleAddExpense}
                                            >
                                                Add Expense
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Edit Expense Form */}
                            {editingExpense && (
                                <div className="bg-gray-50 p-4 rounded-md mb-4">
                                    <h3 className="font-medium mb-3">Edit Expense</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={editingExpense.name}
                                                onChange={(e) => setEditingExpense({...editingExpense, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category</label>
                                            <select
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={editingExpense.category}
                                                onChange={(e) => setEditingExpense({...editingExpense, category: e.target.value})}
                                            >
                                                <option value="">Select category</option>
                                                <option value="Housing">Housing</option>
                                                <option value="Food">Food</option>
                                                <option value="Transportation">Transportation</option>
                                                <option value="Entertainment">Entertainment</option>
                                                <option value="Utilities">Utilities</option>
                                                <option value="Insurance">Insurance</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Debt">Debt</option>
                                                <option value="Subscriptions">Subscriptions</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                                            <input
                                                type="number"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={editingExpense.amount}
                                                onChange={(e) => setEditingExpense({...editingExpense, amount: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                            <input
                                                type="date"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={editingExpense.dueDate}
                                                onChange={(e) => setEditingExpense({...editingExpense, dueDate: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="edit-recurring"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                checked={editingExpense.recurring}
                                                onChange={(e) => setEditingExpense({...editingExpense, recurring: e.target.checked})}
                                            />
                                            <label htmlFor="edit-recurring" className="ml-2 block text-sm text-gray-700">
                                                Recurring Expense
                                            </label>
                                        </div>
                                        {editingExpense.recurring && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                                                <select
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    value={editingExpense.frequency}
                                                    onChange={(e) => setEditingExpense({...editingExpense, frequency: e.target.value})}
                                                >
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="annually">Annually</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex justify-end space-x-3 pt-2">
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                                onClick={() => setEditingExpense(null)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                onClick={handleEditExpense}
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Expense List */}
                            {expenses.length > 0 ? (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {expenses.map(expense => (
                                        <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                            <div>
                                                <h3 className="font-medium">{expense.name}</h3>
                                                <div className="text-sm text-gray-500 flex flex-col">
                                                    <span>Category: {expense.category || 'Uncategorized'}</span>
                                                    {expense.recurring && (
                                                        <span>
                                                            {expense.frequency.charAt(0).toUpperCase() + expense.frequency.slice(1)} payment
                                                        </span>
                                                    )}
                                                    {expense.dueDate && (
                                                        <span>Due: {new Date(expense.dueDate).toLocaleDateString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="font-semibold">${parseFloat(expense.amount).toFixed(2)}</span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => setEditingExpense(expense)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <HiPencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <HiTrash className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    <p>No expenses added yet</p>
                                    <button
                                        onClick={() => setShowAddExpenseForm(true)}
                                        className="mt-2 text-blue-600 hover:text-blue-800"
                                    >
                                        Add your first expense
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BillsAnalysis; 