import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditAccountModal = ({ account, onSave, onCancel, onDelete }) => {
    const [formData, setFormData] = useState({
        name: '',
        balance: '',
        includeInTotal: true,
        notes: '',
        ...account,
        ...account.additional_details
    });

    useEffect(() => {
        setFormData({
            name: account.name,
            balance: account.balance,
            includeInTotal: account.includeInTotal ?? true,
            notes: account.additional_details?.notes || '',
            ...account.additional_details
        });
    }, [account]);

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

        const updatedAccount = {
            ...account,
            name: formData.name,
            balance: parseFloat(formData.balance),
            includeInTotal: formData.includeInTotal,
            additional_details: {
                ...account.additional_details,
                notes: formData.notes
            }
        };

        onSave(updatedAccount);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Edit Account</h3>
                        <button 
                            onClick={onCancel} onKeyDown={onCancel} role="button" tabIndex={0}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    </div>

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
                                    required
                                />
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Balance *
                                <input
                                    type="number"
                                    name="balance"
                                    value={formData.balance}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    step="0.01"
                                    required
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
                                />
                            </label>
                        </div>

                        <div className="flex justify-between space-x-3">
                            <button
                                type="button"
                                onClick={() => onDelete(account.id)} onKeyDown={() => onDelete(account.id)} role="button" tabIndex={0}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete Account
                            </button>
                            <div className="flex space-x-3">
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
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditAccountModal; 