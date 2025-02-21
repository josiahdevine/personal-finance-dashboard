import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Header from './Components/Header';
import Dashboard from './Components/Dashboard';
import AccountConnections from './Components/AccountConnections';
import SalaryJournal from './Components/SalaryJournal';
import BillsAnalysis from './Components/BillsAnalysis';
import Login from './Components/Login';
import Register from './Components/Register';
import './App.css';

const NavLink = ({ to, children, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`px-4 py-2 rounded-lg transition-all duration-200 block w-full text-left ${
                isActive
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
        >
            {children}
        </Link>
    );
};

const NavigationMenu = ({ isOpen, onClose }) => {
    const location = useLocation();
    
    const menuItems = [
        { path: '/', label: 'Dashboard' },
        { path: '/accounts', label: 'Account Connections' },
        { path: '/bills', label: 'Bills & Spending' },
        { path: '/salary', label: 'Salary Journal' }
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                ></div>
            )}

            {/* Menu */}
            <div className={`
                absolute top-16 left-0 w-64 bg-white shadow-lg rounded-lg py-2 z-50
                transform transition-transform duration-200 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>
        </>
    );
};

const AppContent = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                {isAuthenticated && <Header />}
                
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                {isAuthenticated && (
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                                    >
                                        <Bars3Icon className="h-6 w-6" />
                                    </button>
                                )}
                                <Link to="/" className="flex items-center">
                                    <span className="text-2xl font-bold text-blue-600">Finance Dashboard</span>
                                </Link>
                            </div>

                            {!isAuthenticated && (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/login"
                                        className="text-gray-500 hover:text-gray-900"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    {isAuthenticated && (
                        <NavigationMenu 
                            isOpen={isMenuOpen} 
                            onClose={() => setIsMenuOpen(false)}
                        />
                    )}
                </nav>

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <Routes>
                            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Login />} />
                            <Route path="/accounts" element={isAuthenticated ? <AccountConnections /> : <Login />} />
                            <Route path="/bills" element={isAuthenticated ? <BillsAnalysis /> : <Login />} />
                            <Route path="/salary" element={isAuthenticated ? <SalaryJournal /> : <Login />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                        </Routes>
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-200 mt-auto">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-gray-500 text-sm">
                            © {new Date().getFullYear()} Personal Finance Dashboard. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </Router>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;