import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiCalendar, FiCreditCard, FiTarget, FiDollarSign, FiActivity, FiEdit, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const UserProfile = () => {
  const { currentUser, getIdToken, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    joinDate: null,
    lastLogin: null,
    accountsConnected: 0,
    goalsCreated: 0,
    salaryEntriesCount: 0,
    transactionsImported: 0
  });
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Set initial display name
    setDisplayName(currentUser.displayName || '');

    // Fetch user stats
    const fetchUserStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getIdToken();
        const apiUrl = process.env.REACT_APP_API_URL;

        // This would be your actual user stats endpoint
        const response = await axios.get(
          `${apiUrl}/api/user/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data) {
          setUserStats({
            joinDate: response.data.joinDate || new Date(currentUser.metadata.creationTime),
            lastLogin: response.data.lastLogin || new Date(currentUser.metadata.lastSignInTime),
            accountsConnected: response.data.accountsConnected || 0,
            goalsCreated: response.data.goalsCreated || 0,
            salaryEntriesCount: response.data.salaryEntriesCount || 0,
            transactionsImported: response.data.transactionsImported || 0
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setError('Failed to load your profile data. Please try again later.');
        
        // Still set the user metadata we have from auth
        setUserStats(prevStats => ({
          ...prevStats,
          joinDate: new Date(currentUser.metadata.creationTime),
          lastLogin: new Date(currentUser.metadata.lastSignInTime)
        }));
        
        setLoading(false);
      }
    };

    fetchUserStats();

    // For development demo purposes, set sample data
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        setUserStats({
          joinDate: new Date(currentUser.metadata.creationTime),
          lastLogin: new Date(currentUser.metadata.lastSignInTime),
          accountsConnected: 3,
          goalsCreated: 5,
          salaryEntriesCount: 12,
          transactionsImported: 254
        });
        setLoading(false);
      }, 1000);
    }
  }, [currentUser, getIdToken, navigate]);

  const handleUpdateProfile = async () => {
    try {
      // Update display name in Firebase
      await currentUser.updateProfile({
        displayName: displayName
      });

      // TODO: Update any additional profile info in your database
      // This would call your API to update the user profile

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Account Information</h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiEdit />
              </button>
            </div>

            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiUser className="text-blue-500 text-xl" />
              </div>
              {isEditing ? (
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="displayName">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">Display Name</p>
                  <p className="font-medium">{currentUser.displayName || 'Not set'}</p>
                </div>
              )}
            </div>

            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiMail className="text-blue-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiCalendar className="text-blue-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{loading ? 'Loading...' : formatDate(userStats.joinDate)}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiActivity className="text-blue-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium">{loading ? 'Loading...' : formatDate(userStats.lastLogin)}</p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/settings/password')}
                className="w-full text-left py-2 px-4 rounded hover:bg-gray-100 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={() => navigate('/settings/notifications')}
                className="w-full text-left py-2 px-4 rounded hover:bg-gray-100 transition-colors"
              >
                Notification Preferences
              </button>
              <button
                onClick={() => navigate('/settings/privacy')}
                className="w-full text-left py-2 px-4 rounded hover:bg-gray-100 transition-colors"
              >
                Privacy Settings
              </button>
              <hr className="my-2" />
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-4 rounded text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Dashboard Statistics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FiCreditCard className="text-green-500 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Financial Accounts Connected</p>
                  <p className="text-2xl font-bold">
                    {loading ? 'Loading...' : userStats.accountsConnected}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <FiTarget className="text-purple-500 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Financial Goals Created</p>
                  <p className="text-2xl font-bold">
                    {loading ? 'Loading...' : userStats.goalsCreated}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FiDollarSign className="text-blue-500 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salary Entries Recorded</p>
                  <p className="text-2xl font-bold">
                    {loading ? 'Loading...' : userStats.salaryEntriesCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <FiActivity className="text-yellow-500 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transactions Imported</p>
                  <p className="text-2xl font-bold">
                    {loading ? 'Loading...' : userStats.transactionsImported}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/connect-accounts')}
                className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <FiCreditCard className="mr-2" /> Connect Account
              </button>
              <button
                onClick={() => navigate('/goals/new')}
                className="bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600 transition-colors flex items-center justify-center"
              >
                <FiTarget className="mr-2" /> Create New Goal
              </button>
              <button
                onClick={() => navigate('/salary/new')}
                className="bg-purple-500 text-white px-4 py-3 rounded hover:bg-purple-600 transition-colors flex items-center justify-center"
              >
                <FiDollarSign className="mr-2" /> Add Salary Entry
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-700 text-white px-4 py-3 rounded hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                <FiActivity className="mr-2" /> View Dashboard
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account Details</h2>
            <p className="text-gray-500 mb-4">
              Your Personal Finance Dashboard account is configured for US-based financial tracking.
              All financial calculations use US tax regulations and the currency is set to USD.
            </p>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Account Type</h3>
              <p className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block">
                Personal (US)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 