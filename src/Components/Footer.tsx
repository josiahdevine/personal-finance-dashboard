import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-white">
              FinanceDash
            </Link>
            <p className="mt-4 text-base text-gray-300">
              Take control of your financial future with our comprehensive personal finance dashboard.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Product
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/pricing" className="text-base text-gray-300 hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-base text-gray-300 hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-base text-gray-300 hover:text-white">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/contact" className="text-base text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-base text-gray-300 hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-300 hover:text-white">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} FinanceDash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 