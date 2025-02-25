import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export { AuthContext };

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function signup(email, password, username) {
    try {
      setError(''); // Clear any previous errors
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      toast.success('Account created successfully!');
      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      setError(errorMessage); // Set the error state
      toast.error(errorMessage);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      return result;
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to log in';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      }
      toast.error(errorMessage);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send password reset email');
      throw error;
    }
  }

  async function updateUserEmail(email) {
    try {
      await updateEmail(currentUser, email);
      toast.success('Email updated successfully');
    } catch (error) {
      console.error('Update email error:', error);
      toast.error('Failed to update email');
      throw error;
    }
  }

  async function updateUserPassword(newPassword) {
    try {
      await updatePassword(currentUser, newPassword);
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Update password error:', error);
      toast.error('Failed to update password');
      throw error;
    }
  }

  async function updateUserProfile(displayName) {
    try {
      await updateProfile(currentUser, { displayName });
      setCurrentUser({ ...currentUser, displayName });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user: currentUser, // Keep the 'user' property name for compatibility
    currentUser,       // Also expose as currentUser for new components
    loading,
    error,
    signup,
    login,
    logout,
    resetPassword,
    updateUserEmail,
    updateUserPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 