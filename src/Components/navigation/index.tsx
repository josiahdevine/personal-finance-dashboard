import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useDeviceDetect from '../../utils/useDeviceDetect';

const Navigation: React.FC = () => {
  const { isAuthenticated, signOut } = useAuth();
  const { isMobile } = useDeviceDetect();

  return (
    <nav className={`bg-white shadow-sm ${isMobile ? 'px-2' : 'px-4'}`}>
      <div className="container mx-auto py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          Finance Dashboard
        </Link>
        
        <div className="flex space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
              <button 
                onClick={signOut}
                className="text-gray-700 hover:text-indigo-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-indigo-600">
                Login
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-indigo-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 