import React, { useState } from 'react';
import { toast } from 'react-toastify';

const COMPOUND_FREQUENCIES = {
    DAILY: 'Daily',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    ANNUALLY: 'Annually'
};

const BankAccountForm = ({ onSubmit, onCancel, accountType }) => {
    const [formData, setFormData] = useState({
        name: '',
        balance: '',
        interestRate: '',
        compoundFrequency: 'MONTHLY',
        includeInTotal: true,
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.balance) {
            toast.error('Please fill in all required fields');
            return;
        }

        const accountData = {
            name: formData.name,
            type: accountType,
            category: 'ASSETS',
            subcategory: 'LIQUID',
            balance: parseFloat(formData.balance),
            includeInTotal: formData.includeInTotal,
            additional_details: {
                interestRate: parseFloat(formData.interestRate) || 0,
                compoundFrequency: formData.compoundFrequency,
                notes: formData.notes
            }
        };

        onSubmit(accountData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Account Name *
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., Primary Checking"
                        required
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Current Balance *
                    <input
                        type="number"
                        name="balance"
                        value={formData.balance}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Current balance"
                        step="0.01"
                        required
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Interest Rate (% APY)
                    <input
                        type="number"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Annual interest rate"
                        step="0.01"
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Compound Frequency
                    <select
                        name="compoundFrequency"
                        value={formData.compoundFrequency}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        {Object.entries(COMPOUND_FREQUENCIES).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                    <input
                        type="checkbox"
                        name="includeInTotal"
                        checked={formData.includeInTotal}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 mr-2"
                    />
                    Include in Net Worth Calculations
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
                        placeholder="Additional notes about this account"
                    />
                </label>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel} onKeyDown={onCancel} role="button" tabIndex={0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Add Account
                </button>
            </div>
        </form>
    );
};

export default BankAccountForm; 