import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { completeAuthMigration } from '../../utils/authUtils';

// Login form validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, loginWithGoogle } = useAuth();
  const [serverError, setServerError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Check for coming from a different domain/deployment
  useEffect(() => {
    const lastDomain = localStorage.getItem('last_domain');
    const currentDomain = window.location.hostname;
    
    if (lastDomain && lastDomain !== currentDomain) {
      toast.info(
        "We've moved to a new platform! Please log in again to continue.",
        { 
          position: "top-center",
          autoClose: 10000 
        }
      );
    }
    
    // Always update the current domain
    localStorage.setItem('last_domain', currentDomain);
    localStorage.setItem('deployment_platform', 'netlify');
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log('Attempting login with email:', values.email);
      
      // Use the login function from AuthContext
      await login(values.email, values.password);
      
      console.log('Login successful');
      
      // Complete migration after successful login
      completeAuthMigration();
      
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      // Special handling for domain-related errors
      if (error.code === 'auth/unauthorized-domain' || 
          error.code === 'auth/invalid-api-key' ||
          error.code === 'auth/invalid-credential') {
        setServerError('Authentication error due to recent platform changes. Please try again or clear your browser cache.');
        toast.error('Authentication configuration error. Please try again.');
      } else {
        setServerError(error.message || 'Failed to log in. Please check your credentials.');
        toast.error(error.message || 'Failed to log in. Please check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Add Google Sign-in handler
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setServerError(null);
      
      console.log('Attempting login with Google');
      
      // Use the loginWithGoogle function from AuthContext
      await loginWithGoogle();
      
      console.log('Google login successful');
      
      // Complete migration after successful login
      completeAuthMigration();
      
      toast.success('Successfully logged in with Google!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      
      // Special handling for domain-related errors
      if (error.code === 'auth/unauthorized-domain' || 
          error.code === 'auth/invalid-api-key' ||
          error.code === 'auth/popup-closed-by-user') {
        setServerError('Google authentication error. Please try again or use email/password instead.');
        toast.error('Google authentication failed. Please try again.');
      } else {
        setServerError(error.message || 'Failed to log in with Google. Please try again.');
        toast.error(error.message || 'Failed to log in with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h1>
        
        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{serverError}</span>
          </div>
        )}
        
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.email && touched.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } shadow-sm px-3 py-2 focus:outline-none focus:ring-1 sm:text-sm`}
                />
                <ErrorMessage 
                  name="email" 
                  component="p" 
                  className="mt-1 text-sm text-red-600" 
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.password && touched.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } shadow-sm px-3 py-2 focus:outline-none focus:ring-1 sm:text-sm`}
                />
                <ErrorMessage 
                  name="password" 
                  component="p" 
                  className="mt-1 text-sm text-red-600" 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || loading || googleLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {(isSubmitting || loading) ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {googleLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in with Google...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"></path>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"></path>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"></path>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"></path>
                    </g>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 