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
import { HiUpload } from 'react-icons/hi';
import api from '../services/api';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function BillsAnalysis() {
    const [transactions, setTransactions] = useState([]);
    const [timeframe, setTimeframe] = useState('month');
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [error, setError] = useState(null);

    // Define fetchTransactions with useCallback before using it in useEffect
    const fetchTransactions = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
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
                    console.warn('Could not find valid transaction data in response, using mock data');
                    setTransactions([
                        { name: 'Housing', amount: 1500 },
                        { name: 'Food', amount: 800 },
                        { name: 'Transportation', amount: 400 },
                        { name: 'Entertainment', amount: 300 },
                        { name: 'Other', amount: 500 }
                    ]);
                    setError('Using mock data due to unexpected API response format');
                }
            } else {
                console.warn('Unexpected API response format:', response.data);
                // Provide mock data instead of empty array
                setTransactions([
                    { name: 'Housing', amount: 1500 },
                    { name: 'Food', amount: 800 },
                    { name: 'Transportation', amount: 400 },
                    { name: 'Entertainment', amount: 300 },
                    { name: 'Other', amount: 500 }
                ]);
                setError('Using mock data due to unexpected API response');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Failed to load transactions data. Using mock data instead.');
            // Provide mock data on error
            setTransactions([
                { name: 'Housing', amount: 1500 },
                { name: 'Food', amount: 800 },
                { name: 'Transportation', amount: 400 },
                { name: 'Entertainment', amount: 300 },
                { name: 'Other', amount: 500 }
            ]);
        } finally {
            setLoading(false);
        }
    }, [timeframe]);

    // Now use fetchTransactions in useEffect
    useEffect(() => {
        fetchTransactions();
    }, [timeframe, fetchTransactions]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadStatus('Uploading...');
            const response = await api.post('/api/transactions/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadStatus(`Successfully imported ${response.data.imported || 0} transactions`);
            toast.success('Transaction data imported successfully');
            fetchTransactions();
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('Error uploading file');
            toast.error('Failed to import transaction data');
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
                labels: transactions.map(t => t.category || 'Unknown'),
                datasets: [{
                    label: 'Spending by Category',
                    data: transactions.map(t => typeof t.amount === 'number' ? t.amount : 0),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            };
        } catch (err) {
            console.error('Error preparing chart data:', err);
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
                
                <div className="relative">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                    >
                        <HiUpload className="mr-2" />
                        Import Transactions
                    </label>
                    {uploadStatus && (
                        <p className="text-sm text-gray-600 mt-1">{uploadStatus}</p>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="h-64">
                        <Bar data={chartData} options={chartOptions} />
                    </div>

                    {Array.isArray(transactions) && transactions.length > 0 ? (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Spending Breakdown</h3>
                            <div className="space-y-4">
                                {transactions.map((transaction, index) => (
                                    <div
                                        key={transaction.category || index}
                                        className="flex justify-between items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => console.log(`Selected category: ${transaction.category || 'Unknown'}`)}
                                    >
                                        <div>
                                            <h4 className="font-medium">{transaction.category || 'Unknown'}</h4>
                                            <p className="text-sm text-gray-500">
                                                {typeof transaction.count === 'number' ? transaction.count : 0} transactions
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                ${typeof transaction.amount === 'number' ? transaction.amount.toLocaleString() : '0'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {typeof transaction.percentage === 'number' ? transaction.percentage : 0}% of total
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 text-center text-gray-500">
                            <p>No transaction data available for the selected period.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default BillsAnalysis; 