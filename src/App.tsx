import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import PricingPage from './pages/PricingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import PrivateRoute from './components/PrivateRoute';
import PublicNavbar from './components/navigation/PublicNavbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <HelmetProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <PublicNavbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard/*"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </HelmetProvider>
    </Router>
  );
}

export default App; 