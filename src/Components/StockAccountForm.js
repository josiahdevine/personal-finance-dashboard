import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const StockAccountForm = ({ onSubmit, onCancel }) => {
    const { token } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        shares: '',
        costBasis: '',
        purchaseDate: '',
        dividendYield: '',
        notes: ''
    });

    const [priceInfo, setPriceInfo] = useState({
        price: null,
        source: null,
        timestamp: null,
        isLoading: false,
        error: null,
        lastRefreshAttempt: null
    });

    // Rate limit tracking
    const REFRESH_COOLDOWN = 15000; // 15 seconds cooldown
    const canRefresh = !priceInfo.lastRefreshAttempt || 
                      (Date.now() - priceInfo.lastRefreshAttempt) > REFRESH_COOLDOWN;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // If symbol is changed and is 1-5 characters, fetch current price
        if (name === 'symbol' && value.length >= 1 && value.length <= 5) {
            fetchStockPrice(value);
        }
    };

    const fetchStockPrice = async (symbol, isManualRefresh = false) => {
        if (isManualRefresh && !canRefresh) {
            toast.warning(`Please wait ${Math.ceil((REFRESH_COOLDOWN - (Date.now() - priceInfo.lastRefreshAttempt)) / 1000)} seconds before refreshing again`);
            return;
        }

        if (!token) {
            toast.error('Please log in to fetch stock prices');
            return;
        }

        setPriceInfo(prev => ({ 
            ...prev, 
            isLoading: true, 
            error: null,
            lastRefreshAttempt: isManualRefresh ? Date.now() : prev.lastRefreshAttempt 
        }));

        try {
            const response = await fetch(`/api/stocks/price/${symbol}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch stock price');
            }

            setPriceInfo({
                price: data.price,
                source: data.source,
                timestamp: new Date(data.timestamp),
                isLoading: false,
                error: null,
                lastRefreshAttempt: isManualRefresh ? Date.now() : priceInfo.lastRefreshAttempt
            });

            if (isManualRefresh) {
                toast.success('Stock price refreshed successfully');
            }
        } catch (error) {
            console.error('Error fetching stock price:', error);
            setPriceInfo(prev => ({
                ...prev,
                isLoading: false,
                error: error.message,
                lastRefreshAttempt: isManualRefresh ? Date.now() : prev.lastRefreshAttempt
            }));
            
            toast.error(error.message || 'Error fetching stock price');
        }
    };

    const handleRefresh = () => {
        if (formData.symbol) {
            fetchStockPrice(formData.symbol, true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.symbol || !formData.shares) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!priceInfo.price) {
            toast.error('Unable to get current stock price');
            return;
        }

        const totalValue = priceInfo.price * parseFloat(formData.shares);

        const accountData = {
            name: formData.name,
            type: 'STOCKS',
            category: 'ASSETS',
            subcategory: 'INVESTMENTS',
            balance: totalValue,
            additional_details: {
                symbol: formData.symbol.toUpperCase(),
                shares: parseFloat(formData.shares),
                costBasis: parseFloat(formData.costBasis) || null,
                purchaseDate: formData.purchaseDate || null,
                dividendYield: parseFloat(formData.dividendYield) || null,
                currentPrice: priceInfo.price,
                priceLastUpdated: priceInfo.timestamp,
                notes: formData.notes
            }
        };

        onSubmit(accountData);
    };

    // Format the timestamp in a user-friendly way
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    // Get appropriate message for price source
    const getPriceSourceMessage = () => {
        if (priceInfo.error) return `Error: ${priceInfo.error}`;
        if (!priceInfo.source) return '';
        switch (priceInfo.source) {
            case 'api':
                return 'Real-time price from Alpha Vantage';
            case 'cache':
                return 'Cached price from last update';
            case 'cache (rate limited)':
                return 'Cached price (rate limit reached)';
            case 'cache (API error)':
                return 'Cached price (API unavailable)';
            default:
                return `Price from ${priceInfo.source}`;
        }
    };

    const testRateLimiting = async () => {
        const symbol = 'AAPL';
        console.log('Starting rate limit test...');
        
        for (let i = 0; i < 6; i++) {
            console.log(`Request ${i + 1}`);
            try {
                const response = await fetch(`/api/stocks/price/${symbol}`);
                const data = await response.json();
                console.log(`Response ${i + 1}:`, data);
                toast.info(`Request ${i + 1}: ${data.source}`);
            } catch (error) {
                console.error(`Error on request ${i + 1}:`, error);
                toast.error(`Error on request ${i + 1}: ${error.message}`);
            }
            // Wait 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={testRateLimiting}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                >
                    Test Rate Limiting
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Account Name *
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., AAPL Investment"
                        required
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Stock Symbol *
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            name="symbol"
                            value={formData.symbol}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="e.g., AAPL"
                            required
                        />
                        {formData.symbol && (
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={!canRefresh || priceInfo.isLoading}
                                className={`mt-1 px-3 py-2 text-sm font-medium rounded-md ${
                                    canRefresh && !priceInfo.isLoading
                                        ? 'text-white bg-blue-600 hover:bg-blue-700'
                                        : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                                }`}
                                title={!canRefresh ? 'Please wait before refreshing again' : ''}
                            >
                                {priceInfo.isLoading ? 'Loading...' : 'Refresh'}
                            </button>
                        )}
                    </div>
                </label>
                {priceInfo.isLoading && (
                    <p className="text-sm text-gray-500">Fetching current price...</p>
                )}
                {priceInfo.price && (
                    <div className="mt-2 text-sm">
                        <p className="text-gray-900">
                            Current Price: ${priceInfo.price.toFixed(2)}
                        </p>
                        <p className={`${priceInfo.error ? 'text-red-500' : 'text-gray-500'}`}>
                            {getPriceSourceMessage()}
                        </p>
                        <p className="text-gray-400 text-xs">
                            Last updated: {formatTimestamp(priceInfo.timestamp)}
                        </p>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Number of Shares *
                    <input
                        type="number"
                        name="shares"
                        value={formData.shares}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Number of shares"
                        step="0.000001"
                        required
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Cost Basis (per share)
                    <input
                        type="number"
                        name="costBasis"
                        value={formData.costBasis}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Purchase price per share"
                        step="0.01"
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Purchase Date
                    <input
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Dividend Yield (%)
                    <input
                        type="number"
                        name="dividendYield"
                        value={formData.dividendYield}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Annual dividend yield"
                        step="0.01"
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Notes
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows="3"
                        placeholder="Additional notes about this investment"
                    />
                </label>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Add Stock Account
                </button>
            </div>
        </form>
    );
};

export default StockAccountForm; 