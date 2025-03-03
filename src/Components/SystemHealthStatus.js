import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineInformationCircle
} from '../utils/iconMapping';
import { Button } from '../Components/ui';
import axios from 'axios';

const SystemHealthStatus = () => {
  const { currentUser, getIdToken } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [showKnownIssues, setShowKnownIssues] = useState(false);

  // Known issues list - will be updated as issues are resolved
  const knownIssues = [
    {
      id: 'ask-ai-logout',
      title: 'Ask AI Authentication Issue',
      description: 'Users may be forcibly logged out when using the Ask AI feature. Our team is actively working on fixing this issue.',
      status: 'critical',
      lastUpdated: '2025-03-13'
    },
    {
      id: 'api-inconsistency',
      title: 'API Response Inconsistency',
      description: 'Some API endpoints may return inconsistent responses. Please refresh or try again if you encounter errors.',
      status: 'major',
      lastUpdated: '2025-03-13'
    },
    {
      id: 'rate-limiting',
      title: 'Financial Provider Rate Limiting',
      description: 'Users with many financial accounts may experience rate limiting issues when fetching transaction data.',
      status: 'minor',
      lastUpdated: '2025-03-13'
    }
  ];

  const fetchHealthStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the current user's ID token
      const token = await getIdToken();
      
      // Make API request to health check endpoint
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/health`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setHealthData(response.data);
      setLastChecked(new Date());
      setLoading(false);
    } catch (err) {
            setError('Failed to fetch system health information');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchHealthStatus();
    }
  }, [currentUser]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  const StatusIcon = ({ status }) => {
    if (status === 'operational' || status === true) {
      return <HiOutlineCheckCircle className="text-green-500 text-xl" />;
    } else if (status === 'degraded' || status === 'minor' || status === 'major') {
      return <HiOutlineExclamationCircle className="text-yellow-500 text-xl" />;
    } else if (status === 'critical') {
      return <HiOutlineXCircle className="text-red-500 text-xl" />;
    } else {
      return <HiOutlineXCircle className="text-red-500 text-xl" />;
    }
  };

  const IssueStatusBadge = ({ status }) => {
    if (status === 'critical') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Critical</span>;
    } else if (status === 'major') {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Major</span>;
    } else if (status === 'minor') {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Minor</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white shadow rounded-lg p-4 my-4">
        <p className="text-gray-500">Please log in to view system health status</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 my-4">
        <div className="flex items-center justify-center">
          <HiOutlineRefresh className="animate-spin text-blue-500 text-xl mr-2" />
          <p>Loading system health information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-4 my-4">
        <div className="flex items-center">
          <HiOutlineXCircle className="text-red-500 text-xl mr-2" />
          <p className="text-red-500">{error}</p>
        </div>
        <Button 
          onClick={fetchHealthStatus}
          variant="primary"
          className="mt-2"
        >
          <HiOutlineRefresh className="mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 my-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">System Health Status</h2>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">
            Last checked: {formatDateTime(lastChecked)}
          </span>
          <Button 
            onClick={fetchHealthStatus}
            variant="outline"
            size="sm"
            className="p-1"
            ariaLabel="Refresh health status"
          >
            <HiOutlineRefresh className="text-blue-500" />
          </Button>
        </div>
      </div>

      {healthData && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center">
            <StatusIcon status={healthData.status} />
            <div className="ml-3">
              <h3 className="font-medium">Overall Status</h3>
              <p className="text-sm text-gray-500 capitalize">{healthData.status}</p>
            </div>
          </div>

          {/* API Status */}
          <div className="flex items-center">
            <StatusIcon status={healthData.api.status} />
            <div className="ml-3">
              <h3 className="font-medium">API</h3>
              <p className="text-sm text-gray-500 capitalize">
                {healthData.api.status} {healthData.api.region && `(${healthData.api.region})`}
              </p>
            </div>
          </div>

          {/* Database Status */}
          <div className="flex items-center">
            <StatusIcon status={healthData.database.connected} />
            <div className="ml-3">
              <h3 className="font-medium">Database</h3>
              <p className="text-sm text-gray-500">
                {healthData.database.connected ? 'Connected' : 'Disconnected'}
                {healthData.database.tables && ` (${healthData.database.tables.length} tables)`}
              </p>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="flex items-center">
            <StatusIcon 
              status={
                healthData.environment.has_firebase_config && 
                healthData.environment.has_plaid_config
              } 
            />
            <div className="ml-3">
              <h3 className="font-medium">Environment Configuration</h3>
              <p className="text-sm text-gray-500">
                {healthData.environment.node_env} mode
              </p>
            </div>
          </div>

          {/* Known Issues Section */}
          <div className="mt-6 border-t pt-4">
            <Button 
              variant="outline"
              onClick={() => setShowKnownIssues(!showKnownIssues)}
              className="w-full flex items-center justify-between py-2"
            >
              <div className="flex items-center">
                <HiOutlineInformationCircle className="text-blue-500 text-xl mr-2" />
                <h3 className="font-medium">Known Issues ({knownIssues.length})</h3>
              </div>
              <span className="text-sm text-blue-500">
                {showKnownIssues ? 'Hide' : 'Show'}
              </span>
            </Button>
            
            {showKnownIssues && (
              <div className="mt-3 space-y-3">
                {knownIssues.map(issue => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{issue.title}</h4>
                      <IssueStatusBadge status={issue.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Last updated: {issue.lastUpdated}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500 mt-4">
            Server timestamp: {formatDateTime(healthData.timestamp)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthStatus; 