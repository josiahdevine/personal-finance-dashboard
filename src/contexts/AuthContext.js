import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
// Import Firebase initialization
import { auth } from '../services/firebase';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Context Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  // Use the imported auth instance instead of creating a new one
  // const auth = getAuth();

  // Register a new user
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      
      // First, create the user in Firebase
      console.log('Creating Firebase user with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase user created:', userCredential.user.uid);

      // Then, register the user in our backend
      console.log('Registering user in backend');
      await apiService.register({
        username,
        email,
        password, // Password will be hashed in the backend
        firebaseUid: userCredential.user.uid
      });
      
      toast.success('Registration successful! You can now log in.');
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login a user
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      console.log('Logging in with Firebase, email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login successful, user:', userCredential.user.uid);
      
      // We'll also authenticate with our backend
      console.log('Authenticating with backend');
      const backendResponse = await apiService.login({
        email,
        password,
        firebaseUid: userCredential.user.uid
      });
      
      console.log('Backend authentication successful', backendResponse);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to log in. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout the user
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setCurrentUser(null);
      setIsAuthenticated(false);
      toast.info('You have been logged out.');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out.');
    } finally {
      setLoading(false);
    }
  };

  // Set up the authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed, user:', user);
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    // Clean up the listener on component unmount
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The context value that will be provided
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading authentication...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext; 