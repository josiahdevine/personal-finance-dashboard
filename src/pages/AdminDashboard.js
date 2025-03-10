import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SystemHealthStatus from '../components/SystemHealthStatus';
import { 
  HiOutlineUserGroup,
  HiOutlineDatabase,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineDocumentReport,
  HiOutlineRefresh
} from '../utils/iconMapping';
import axios from 'axios';

const AdminDashboard = () => {
  const { currentUser, getIdToken, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: { count: 0, loading: true, error: null },
    plaidConnections: { count: 0, loading: true, error: null },
    transactions: { count: 0, loading: true, error: null },
    salaryEntries: { count: 0, loading: true, error: null },
    goals: { count: 0, loading: true, error: null },
  });

  // Check if user is admin, if not redirect to home
  useEffect(() => {
    if (currentUser) {
      if (!isAdmin) {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  }, [currentUser, isAdmin, navigate]);

  // Fetch admin statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser || !isAdmin) return;

      try {
        const token = await getIdToken();
        const apiUrl = process.env.REACT_APP_API_URL;

        // This would be your actual admin stats endpoint
        // For demo purposes, we're simulating the data
        const response = await axios.get(
          `${apiUrl}/api/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data) {
          setStats({
            users: { 
              count: response.data.users || 0, 
              loading: false, 
              error: null 
            },
            plaidConnections: { 
              count: response.data.plaidConnections || 0, 
              loading: false, 
              error: null 
            },
            transactions: { 
              count: response.data.transactions || 0, 
              loading: false, 
              error: null 
            },
            salaryEntries: { 
              count: response.data.salaryEntries || 0, 
              loading: false, 
              error: null 
            },
            goals: { 
              count: response.data.goals || 0, 
              loading: false, 
              error: null 
            },
          });
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        
        // Update stats with error states
        setStats(prevStats => ({
          users: { 
            ...prevStats.users, 
            loading: false, 
            error: 'Failed to load user stats' 
          },
          plaidConnections: { 
            ...prevStats.plaidConnections, 
            loading: false, 
            error: 'Failed to load connection stats' 
          },
          transactions: { 
            ...prevStats.transactions, 
            loading: false, 
            error: 'Failed to load transaction stats' 
          },
          salaryEntries: { 
            ...prevStats.salaryEntries, 
            loading: false, 
            error: 'Failed to load salary stats' 
          },
          goals: { 
            ...prevStats.goals, 
            loading: false, 
            error: 'Failed to load goal stats' 
          },
        }));
      }
    };

    fetchStats();
  }, [currentUser, isAdmin, getIdToken]);

  // This is just for demonstration purposes until the real admin API is implemented
  useEffect(() => {
    // Simulate data for demo
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        setStats({
          users: { count: 235, loading: false, error: null },
          plaidConnections: { count: 187, loading: false, error: null },
          transactions: { count: 5641, loading: false, error: null },
          salaryEntries: { count: 782, loading: false, error: null },
          goals: { count: 429, loading: false, error: null },
        });
      }, 1500);
    }
  }, []);

  const StatCard = ({ title, count, loading, error, icon }) => {
    return (
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 text-sm">{title}</h3>
            {loading ? (
              <div className="flex items-center mt-1">
                <HiOutlineRefresh className="animate-spin text-blue-500 mr-2" />
                <span>Loading...</span>
              </div>
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : (
              <p className="text-2xl font-bold">{count.toLocaleString()}</p>
            )}
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            {icon}
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
          title="Total Users" 
          count={stats.users.count} 
          loading={stats.users.loading} 
          error={stats.users.error} 
          icon={<HiOutlineUserGroup className="text-blue-500 text-xl" />} 
        />
        <StatCard 
          title="Plaid Connections" 
          count={stats.plaidConnections.count} 
          loading={stats.plaidConnections.loading} 
          error={stats.plaidConnections.error} 
          icon={<HiOutlineDatabase className="text-blue-500 text-xl" />} 
        />
        <StatCard 
          title="Transactions" 
          count={stats.transactions.count} 
          loading={stats.transactions.loading} 
          error={stats.transactions.error} 
          icon={<HiOutlineDocumentReport className="text-blue-500 text-xl" />} 
        />
        <StatCard 
          title="Salary Entries" 
          count={stats.salaryEntries.count} 
          loading={stats.salaryEntries.loading} 
          error={stats.salaryEntries.error} 
          icon={<HiOutlineDatabase className="text-blue-500 text-xl" />} 
        />
        <StatCard 
          title="Financial Goals" 
          count={stats.goals.count} 
          loading={stats.goals.loading} 
          error={stats.goals.error} 
          icon={<HiOutlineCog className="text-blue-500 text-xl" />} 
        />
      </div>

      {/* System Health Status */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <SystemHealthStatus />
      </div>

      {/* Admin Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </button>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              onClick={() => navigate('/admin/database')}
            >
              Database Management
            </button>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              onClick={() => navigate('/admin/settings')}
            >
              System Settings
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Log (Placeholder) */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 italic">Activity log will be implemented in a future update.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
