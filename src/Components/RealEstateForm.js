import React, { useState } from 'react';
import { toast } from 'react-toastify';

const RealEstateForm = ({ onSubmit, onCancel, accountType }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        currentValue: '',
        purchasePrice: '',
        purchaseDate: '',
        monthlyRent: '',
        monthlyExpenses: '',
        mortgagePayment: '',
        propertyTax: '',
        insuranceCost: '',
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
        
        if (!formData.name || !formData.currentValue || !formData.address) {
            toast.error('Please fill in all required fields');
            return;
        }

        const accountData = {
            name: formData.name,
            type: accountType,
            category: 'ASSETS',
            subcategory: 'REAL_ESTATE',
            balance: parseFloat(formData.currentValue),
            includeInTotal: formData.includeInTotal,
            additional_details: {
                address: formData.address,
                purchasePrice: parseFloat(formData.purchasePrice) || 0,
                purchaseDate: formData.purchaseDate,
                monthlyRent: parseFloat(formData.monthlyRent) || 0,
                monthlyExpenses: parseFloat(formData.monthlyExpenses) || 0,
                mortgagePayment: parseFloat(formData.mortgagePayment) || 0,
                propertyTax: parseFloat(formData.propertyTax) || 0,
                insuranceCost: parseFloat(formData.insuranceCost) || 0,
                notes: formData.notes
            }
        };

        onSubmit(accountData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Property Name *
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., Primary Residence"
                        required
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Property Address *
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows="2"
                        placeholder="Full property address"
                        required
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Current Value *
                    <input
                        type="number"
                        name="currentValue"
                        value={formData.currentValue}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Current market value"
                        step="0.01"
                        required
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Purchase Price
                    <input
                        type="number"
                        name="purchasePrice"
                        value={formData.purchasePrice}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Original purchase price"
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
                    Monthly Rent Income
                    <input
                        type="number"
                        name="monthlyRent"
                        value={formData.monthlyRent}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Monthly rental income"
                        step="0.01"
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Monthly Expenses
                    <input
                        type="number"
                        name="monthlyExpenses"
                        value={formData.monthlyExpenses}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Monthly maintenance, utilities, etc."
                        step="0.01"
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Monthly Mortgage Payment
                    <input
                        type="number"
                        name="mortgagePayment"
                        value={formData.mortgagePayment}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Monthly mortgage payment"
                        step="0.01"
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Annual Property Tax
                    <input
                        type="number"
                        name="propertyTax"
                        value={formData.propertyTax}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Annual property tax"
                        step="0.01"
                    />
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Annual Insurance Cost
                    <input
                        type="number"
                        name="insuranceCost"
                        value={formData.insuranceCost}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Annual insurance cost"
                        step="0.01"
                    />
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
                        placeholder="Additional notes about this property"
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
                    Add Property
                </button>
            </div>
        </form>
    );
};

export default RealEstateForm; 