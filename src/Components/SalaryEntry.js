import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const SalaryEntry = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const { token } = useContext(AuthContext);
    const [salaryData, setSalaryData] = useState({
        company: '',
        position: '',
        salary_amount: '',
        date_of_change: '',
        notes: '',
        bonus_amount: '',
        commission_amount: ''
    });
    const [salaryHistory, setSalaryHistory] = useState([]);

    useEffect(() => {
        fetchSalaryHistory();
    }, []);

    const fetchSalaryHistory = async () => {
        try {
            const response = await fetch('/api/salary/salary-entries', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSalaryHistory(data);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to fetch salary history');
            }
        } catch (error) {
            console.error('Error fetching salary history:', error);
            toast.error('Error fetching salary history');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formattedData = {
                ...salaryData,
                salary_amount: parseFloat(salaryData.salary_amount),
                bonus_amount: parseFloat(salaryData.bonus_amount) || 0,
                commission_amount: parseFloat(salaryData.commission_amount) || 0
            };

            console.log('Submitting salary entry:', formattedData);

            const response = await fetch('/api/salary/salary-entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formattedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.message || 'Failed to add salary entry');
            }

            const data = await response.json();
            console.log('Server response:', data);

            toast.success('Salary entry added successfully');
            setSalaryData({
                company: '',
                position: '',
                salary_amount: '',
                date_of_change: '',
                notes: '',
                bonus_amount: '',
                commission_amount: ''
            });
            fetchSalaryHistory();
            setIsFormVisible(false);
        } catch (error) {
            console.error('Error adding salary entry:', error);
            toast.error(error.message || 'Error adding salary entry');
        }
    };

    const handleChange = (e) => {
        setSalaryData({
            ...salaryData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="p-4">
            <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                {isFormVisible ? 'Hide Salary Entry' : 'New Salary Entry'}
            </button>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Company:
                            <input
                                type="text"
                                name="company"
                                value={salaryData.company}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Position:
                            <input
                                type="text"
                                name="position"
                                value={salaryData.position}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Salary Amount:
                            <input
                                type="number"
                                name="salary_amount"
                                value={salaryData.salary_amount}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Date of Change:
                            <input
                                type="date"
                                name="date_of_change"
                                value={salaryData.date_of_change}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Notes:
                            <textarea
                                name="notes"
                                value={salaryData.notes}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Bonus Amount:
                            <input
                                type="number"
                                name="bonus_amount"
                                value={salaryData.bonus_amount}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Commission Amount:
                            <input
                                type="number"
                                name="commission_amount"
                                value={salaryData.commission_amount}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Add Salary Entry
                    </button>
                </form>
            )}

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Salary History</h2>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {salaryHistory.map((entry, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">{entry.company}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{entry.position}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">${entry.salary_amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(entry.date_of_change).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">${entry.bonus_amount?.toLocaleString() || '0'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">${entry.commission_amount?.toLocaleString() || '0'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{entry.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalaryEntry; 