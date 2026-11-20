import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { extractErrorMessage } from '../services/api';
import { useToast } from './ToastContext';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('gks_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('gks_token'));
  const [loading, setLoading] = useState(true);
  const { success, error: showError, info } = useToast();

  // Validate session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('gks_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('gks_user', JSON.stringify(response.user));
        } else {
          // Token invalid
          localStorage.removeItem('gks_token');
          localStorage.removeItem('gks_user');
          setToken(null);
          setUser(null);
        }
      } catch {
        localStorage.removeItem('gks_token');
        localStorage.removeItem('gks_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Listen for auth expired event dispatched by api.js interceptor
    const handleExpired = (e) => {
      setToken(null);
      setUser(null);
      showError(e.detail?.message || 'Your session expired. Please log in.');
    };

    window.addEventListener('gks:auth-expired', handleExpired);
    return () => window.removeEventListener('gks:auth-expired', handleExpired);
  }, [showError]);

  // Real-time Socket.IO room sync for authenticated customer
  useEffect(() => {
    if (user && user._id) {
      socketService.joinUser(user._id);
    } else {
      socketService.disconnect();
    }
  }, [user]);

  // Login
  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.token) {
        // Enforce customer portal role check
        if (res.user?.role !== 'customer') {
          showError('Access restricted: This portal is specifically for GharKaSwad customers.');
          return { success: false };
        }

        localStorage.setItem('gks_token', res.token);
        localStorage.setItem('gks_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        success(`Welcome back, ${res.user.name || 'Foodie'}!`);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to log in. Please check your credentials.');
      showError(msg);
      return { success: false, message: msg };
    }
  };

  // Step 1: Send Registration OTP
  const registerSendOtp = async (data) => {
    try {
      const res = await authService.sendCustomerOtp(data);
      if (res.success) {
        info(res.message || 'Verification code sent to your email.');
        return { success: true, email: res.email };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to send verification code.');
      showError(msg);
      return { success: false, message: msg };
    }
  };

  // Step 2: Verify Registration OTP
  const registerVerifyOtp = async (data) => {
    try {
      const res = await authService.verifyCustomerOtp(data);
      if (res.success && res.token) {
        localStorage.setItem('gks_token', res.token);
        localStorage.setItem('gks_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        success('Registration complete! Welcome to GharKaSwad.');
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = extractErrorMessage(err, 'Invalid or expired OTP. Please try again.');
      showError(msg);
      return { success: false, message: msg };
    }
  };

  // Resend OTP
  const resendOtp = async (email) => {
    try {
      const res = await authService.resendOtp(email);
      if (res.success) {
        info('Fresh OTP sent to your email.');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to resend code.');
      showError(msg);
      return { success: false, message: msg };
    }
  };

  // Logout
  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('gks_token');
    localStorage.removeItem('gks_user');
    setToken(null);
    setUser(null);
    info('You have been logged out.');
  };

  const isAuthenticated = Boolean(token && user && user.role === 'customer');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        registerSendOtp,
        registerVerifyOtp,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
