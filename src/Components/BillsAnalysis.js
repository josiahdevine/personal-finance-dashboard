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
import axios from 'axios';
import { HiUpload } from 'react-icons/hi';

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
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [timeframe, setTimeframe] = useState('month');
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [timeframe]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/transactions/spending-summary?timeframe=${timeframe}`);
            setTransactions(response.data.categories);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadStatus('Uploading...');
            const response = await axios.post('/api/transactions/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadStatus(`Successfully imported ${response.data.imported} transactions`);
            fetchTransactions();
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('Error uploading file');
        }
    };

    const chartData = {
        labels: transactions.map(t => t.category),
        datasets: [{
            label: 'Spending by Category',
            data: transactions.map(t => t.amount),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
        }]
    };

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

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Spending Breakdown</h3>
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.category}
                                    className="flex justify-between items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setSelectedCategory(transaction.category)}
                                >
                                    <div>
                                        <h4 className="font-medium">{transaction.category}</h4>
                                        <p className="text-sm text-gray-500">
                                            {transaction.count} transactions
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            ${transaction.amount.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {transaction.percentage}% of total
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default BillsAnalysis; 