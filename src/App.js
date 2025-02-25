import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlaidProvider } from './contexts/PlaidContext';
import Login from './Components/Login';
import Register from './Components/Register';
import Dashboard from './Components/Dashboard';
import AskAI from './Components/AskAI';
import LandingPage from './pages/LandingPage';
import Header from './Components/Header';
import './App.css';

// Protected Route component
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

// HeaderWithAuth component to conditionally render Header
const HeaderWithAuth = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Header /> : null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlaidProvider>
          <HeaderWithAuth />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/ask-ai"
              element={
                <PrivateRoute>
                  <AskAI />
                </PrivateRoute>
              }
            />
          </Routes>
        </PlaidProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;