import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthMenu: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {currentUser ? (
        <>
          <Link
            to="/dashboard"
            className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Get Started
          </Link>
        </>
      )}
    </div>
  );
};

export default AuthMenu; 