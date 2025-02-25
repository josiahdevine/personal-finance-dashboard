import React, { useState, useEffect } from 'react';
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
import { HiUpload, HiPlus, HiTrash, HiPencil, HiX } from 'react-icons/hi';
import api from '../services/api';
import { toast } from 'react-toastify';
import { log, logError } from '../utils/logger';
import { parse } from 'papaparse';
import { useAuth } from '../contexts/AuthContext';
import { usePlaid } from '../contexts/PlaidContext';

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
    const [importType, setImportType] = useState('excel');
    const [isImporting, setIsImporting] = useState(false);
    const [plaidTransactions, setPlaidTransactions] = useState([]);
    const [selectedTransactions, setSelectedTransactions] = useState({});
    const [mappingConfig, setMappingConfig] = useState({
        date: 'date',
        description: 'description',
        amount: 'amount',
        category: 'category'
    });
    const [filePreview, setFilePreview] = useState([]);

    // Define fetchTransactions with useCallback before using it in useEffect
    const fetchTransactions = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            log('BillsAnalysis', 'Fetching transaction data');
            
            // Try to fetch from local storage first for faster loading
            const storedExpenses = localStorage.getItem('monthlyExpenses');
            if (storedExpenses) {
                try {
                    const parsedExpenses = JSON.parse(storedExpenses);
                    if (Array.isArray(parsedExpenses) && parsedExpenses.length > 0) {
                        log('BillsAnalysis', 'Using stored expenses data');
                        setExpenses(parsedExpenses);
                        
                        // Process expenses into transaction format for the chart
                        const expensesByCategory = {};
                        parsedExpenses.forEach(expense => {
                            const category = expense.category || 'Uncategorized';
                            if (!expensesByCategory[category]) {
                                expensesByCategory[category] = 0;
                            }
                            expensesByCategory[category] += Number(expense.amount) || 0;
                        });
                        
                        const formattedTransactions = Object.entries(expensesByCategory).map(
                            ([category, amount]) => ({ category, amount })
                        );
                        
                        setTransactions(formattedTransactions);
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    logError('BillsAnalysis', 'Error parsing stored expenses', error);
                }
            }
            
            // If local storage fails or is empty, then try the API
            try {
            // Use our API service instead of axios directly
            const response = await api.get(`/api/transactions/spending-summary`, {
                params: { timeframe }
            });
            
            // Safely handle the response data with better error handling
            if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
                setTransactions(response.data.categories);
            } else if (response.data && Array.isArray(response.data)) {
                // If the API directly returns an array instead of an object with categories
                setTransactions(response.data);
            } else if (response.data && typeof response.data === 'object') {
                // Try to extract data from various possible response formats
                const possibleArrays = [
                    response.data.categories,
                    response.data.transactions,
                    response.data.data?.categories,
                    response.data.data?.transactions,
                    response.data.data
                ];
                
                // Find the first valid array
                const validArray = possibleArrays.find(arr => Array.isArray(arr) && arr.length > 0);
                
                if (validArray) {
                    setTransactions(validArray);
                } else {
                    // Create mock data when we can't find valid data
                        log('BillsAnalysis', 'Could not find valid transaction data in response, using mock data');
                        setTransactions([
                            { category: 'Housing', amount: 1500 },
                            { category: 'Food', amount: 800 },
                            { category: 'Transportation', amount: 400 },
                            { category: 'Entertainment', amount: 300 },
                            { category: 'Other', amount: 500 }
                        ]);
                        setError('Using mock data due to unexpected API response format');
                    }
                } else {
                    log('BillsAnalysis', 'Unexpected API response format, using mock data');
                    // Provide mock data instead of empty array
                    setTransactions([
                        { category: 'Housing', amount: 1500 },
                        { category: 'Food', amount: 800 },
                        { category: 'Transportation', amount: 400 },
                        { category: 'Entertainment', amount: 300 },
                        { category: 'Other', amount: 500 }
                    ]);
                    setError('Using mock data due to unexpected API response');
                }
            } catch (apiError) {
                logError('BillsAnalysis', 'Error fetching transactions from API', apiError);
                setError('Failed to load transactions data. Using mock data instead.');
                // Provide mock data on error
                setTransactions([
                    { category: 'Housing', amount: 1500 },
                    { category: 'Food', amount: 800 },
                    { category: 'Transportation', amount: 400 },
                    { category: 'Entertainment', amount: 300 },
                    { category: 'Other', amount: 500 }
                ]);
            }
        } catch (error) {
            logError('BillsAnalysis', 'Critical error in fetchTransactions', error);
            setError('Failed to load transactions data. Using mock data instead.');
            // Provide mock data on error
            setTransactions([
                { category: 'Housing', amount: 1500 },
                { category: 'Food', amount: 800 },
                { category: 'Transportation', amount: 400 },
                { category: 'Entertainment', amount: 300 },
                { category: 'Other', amount: 500 }
            ]);
        } finally {
            setLoading(false);
        }
    }, [timeframe]);

    // Now use fetchTransactions in useEffect
    useEffect(() => {
        log('BillsAnalysis', 'Component mounted or timeframe changed');
        fetchTransactions();
        
        return () => {
            log('BillsAnalysis', 'Component unmounting');
        };
    }, [timeframe, fetchTransactions]);

    // Fetch Plaid transactions if connected
    useEffect(() => {
        if (isPlaidConnected) {
            fetchPlaidTransactions();
        }
    }, [isPlaidConnected]);

    const fetchPlaidTransactions = async () => {
        try {
            setIsImporting(true);
            const transactions = await getTransactions();
            setPlaidTransactions(transactions);
        } catch (error) {
            logError('BillsAnalysis', 'Error fetching Plaid transactions', error);
            toast.error('Failed to fetch Plaid transactions');
        } finally {
            setIsImporting(false);
        }
    };

    // Enhanced file upload handler that supports Excel/CSV
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsImporting(true);
        setUploadStatus('Processing file...');

        try {
            log('BillsAnalysis', 'Processing uploaded file', { fileName: file.name });
            
            // Parse CSV file
            parse(file, {
                header: true,
                complete: (results) => {
                    const { data, errors, meta } = results;
                    
                    if (errors.length > 0) {
                        logError('BillsAnalysis', 'CSV parsing errors', errors);
                        toast.error('Error parsing CSV file');
                        setUploadStatus('Error parsing file');
                        setIsImporting(false);
                        return;
                    }
                    
                    // Display preview of imported data
                    setFilePreview(data.slice(0, 5));
                    
                    // Auto-detect column mappings
                    const headers = meta.fields || [];
                    const detectedMapping = {
                        date: headers.find(h => /date|time/i.test(h)) || mappingConfig.date,
                        description: headers.find(h => /desc|name|memo/i.test(h)) || mappingConfig.description,
                        amount: headers.find(h => /amount|sum|value/i.test(h)) || mappingConfig.amount,
                        category: headers.find(h => /category|type|group/i.test(h)) || mappingConfig.category
                    };
                    
                    setMappingConfig(detectedMapping);
                    
                    // Convert to expenses format
                    const importedExpenses = data
                        .filter(row => row[detectedMapping.amount] && !isNaN(parseFloat(row[detectedMapping.amount])))
                        .map(row => ({
                            id: Date.now() + Math.random().toString(36).substring(2, 10),
                            name: row[detectedMapping.description] || 'Imported Expense',
                            amount: Math.abs(parseFloat(row[detectedMapping.amount])),
                            category: row[detectedMapping.category] || 'Uncategorized',
                            date: row[detectedMapping.date] || new Date().toISOString(),
                            createdAt: new Date().toISOString(),
                            isImported: true
                        }));
                    
                    // Update expenses
                    setExpenses(prev => [...importedExpenses, ...prev]);
                    
                    // Save to localStorage
                    const allExpenses = [...importedExpenses, ...expenses];
                    localStorage.setItem('monthlyExpenses', JSON.stringify(allExpenses));
                    
                    // Call parent callback if provided
                    if (onExpensesUpdated) {
                        onExpensesUpdated(allExpenses);
                    }
                    
                    // Refresh transactions data
                    fetchTransactions();
                    
                    setUploadStatus(`Successfully imported ${importedExpenses.length} expenses`);
                    toast.success(`Successfully imported ${importedExpenses.length} expenses`);
                    setIsImporting(false);
                },
                error: (error) => {
                    logError('BillsAnalysis', 'CSV parsing error', error);
                    toast.error('Error parsing file');
                    setUploadStatus('Error parsing file');
                    setIsImporting(false);
                }
            });
        } catch (error) {
            logError('BillsAnalysis', 'Error processing file', error);
            setUploadStatus('Error processing file');
            toast.error('Failed to process file');
            setIsImporting(false);
        }
    };

    // Import transactions from Plaid
    const handlePlaidImport = () => {
        if (plaidTransactions.length === 0) {
            toast.error('No Plaid transactions available');
            return;
        }

        try {
            const selectedItems = Object.entries(selectedTransactions)
                .filter(([_, isSelected]) => isSelected)
                .map(([id]) => plaidTransactions.find(t => t.transaction_id === id))
                .filter(Boolean);

            if (selectedItems.length === 0) {
                toast.warning('No transactions selected');
                return;
            }

            // Convert Plaid transactions to expenses
            const importedExpenses = selectedItems.map(transaction => ({
                id: transaction.transaction_id,
                name: transaction.name,
                amount: Math.abs(transaction.amount),
                category: transaction.category?.[0] || 'Uncategorized',
                date: transaction.date || new Date().toISOString(),
                createdAt: new Date().toISOString(),
                recurring: false,
                isImported: true,
                source: 'plaid'
            }));

            // Update expenses
            setExpenses(prev => [...importedExpenses, ...prev]);
            
            // Save to localStorage
            const allExpenses = [...importedExpenses, ...expenses];
            localStorage.setItem('monthlyExpenses', JSON.stringify(allExpenses));
            
            // Call parent callback if provided
            if (onExpensesUpdated) {
                onExpensesUpdated(allExpenses);
            }
            
            // Refresh transactions data
            fetchTransactions();
            
            setShowImportOptions(false);
            toast.success(`Successfully imported ${importedExpenses.length} transactions from Plaid`);
        } catch (error) {
            logError('BillsAnalysis', 'Error importing Plaid transactions', error);
            toast.error('Failed to import Plaid transactions');
        }
    };

    // Toggle transaction selection
    const toggleTransactionSelection = (transactionId) => {
        setSelectedTransactions(prev => ({
            ...prev,
            [transactionId]: !prev[transactionId]
        }));
    };

    // Toggle all transactions
    const toggleAllTransactions = () => {
        const allSelected = plaidTransactions.every(t => selectedTransactions[t.transaction_id]);
        
        if (allSelected) {
            // Unselect all
            setSelectedTransactions({});
        } else {
            // Select all
            const newSelection = {};
            plaidTransactions.forEach(t => {
                newSelection[t.transaction_id] = true;
            });
            setSelectedTransactions(newSelection);
        }
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

    // Add a render function for import options
    const renderImportOptions = () => {
        if (!showImportOptions) return null;

        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Import Expenses</h2>
                    <button 
                        onClick={() => setShowImportOptions(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <HiX className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <div className="flex space-x-4 mb-4">
                        <button
                            onClick={() => setImportType('excel')}
                            className={`px-4 py-2 rounded-md ${importType === 'excel' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Excel/CSV
                        </button>
                        <button
                            onClick={() => setImportType('plaid')}
                            className={`px-4 py-2 rounded-md ${importType === 'plaid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            disabled={!isPlaidConnected}
                        >
                            Plaid Transactions
                        </button>
                    </div>

                    {importType === 'excel' ? (
                        <div>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Upload a CSV file with your expense data.</p>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                            </div>

                            {filePreview.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-medium mb-2">Preview:</h3>
                                    <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    {Object.keys(filePreview[0] || {}).map(header => (
                                                        <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filePreview.map((row, i) => (
                                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        {Object.values(row).map((cell, j) => (
                                                            <td key={j} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {isImporting ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                                </div>
                            ) : plaidTransactions.length > 0 ? (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">Select transactions to import:</h3>
                                        <button
                                            onClick={toggleAllTransactions}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            {plaidTransactions.every(t => selectedTransactions[t.transaction_id]) 
                                                ? 'Unselect All' 
                                                : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 rounded-md overflow-hidden max-h-80 overflow-y-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left w-8">
                                                        <input 
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            checked={plaidTransactions.length > 0 && plaidTransactions.every(t => selectedTransactions[t.transaction_id])}
                                                            onChange={toggleAllTransactions}
                                                        />
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {plaidTransactions.map(transaction => (
                                                    <tr 
                                                        key={transaction.transaction_id}
                                                        className={`hover:bg-gray-50 ${selectedTransactions[transaction.transaction_id] ? 'bg-blue-50' : ''}`}
                                                        onClick={() => toggleTransactionSelection(transaction.transaction_id)}
                                                    >
                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                            <input 
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                checked={!!selectedTransactions[transaction.transaction_id]}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleTransactionSelection(transaction.transaction_id);
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            {transaction.date}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                            {transaction.name}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            {transaction.category?.[0] || 'Uncategorized'}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right">
                                                            <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                                                                ${Math.abs(transaction.amount).toFixed(2)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handlePlaidImport}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            disabled={Object.values(selectedTransactions).filter(Boolean).length === 0}
                                        >
                                            Import Selected
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 mb-4">No Plaid transactions available.</p>
                                    <button
                                        onClick={fetchPlaidTransactions}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Refresh Transactions
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
                <p className="font-semibold">Error loading transactions data</p>
                <p className="text-sm mt-1">{error}</p>
                <button 
                    onClick={fetchTransactions} 
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-x-4">
                    <select
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                    >
                        <option value="month">This Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
                
                <div className="flex space-x-4">
                    <button
                        onClick={() => setShowAddExpenseForm(true)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        <HiPlus className="mr-2" />
                        Add Expense
                    </button>
                
                    <button
                        onClick={() => setShowImportOptions(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <HiUpload className="mr-2" />
                        Import Expenses
                    </button>
                </div>
            </div>

            {/* Import Options Dialog */}
            {renderImportOptions()}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
                            <div className="h-80">
                        <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

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