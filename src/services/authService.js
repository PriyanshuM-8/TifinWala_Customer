import api from './api';

export const authService = {
  // Step 1: Send Registration OTP
  sendCustomerOtp: async (data) => {
    const response = await api.post('/api/auth/customer/register/send-otp', data);
    return response.data;
  },

  // Step 2: Verify Registration OTP & Complete Account
  verifyCustomerOtp: async (data) => {
    const response = await api.post('/api/auth/customer/register/verify-otp', data);
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await api.post('/api/auth/register/resend-otp', { email });
    return response.data;
  },

  // Customer Login
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Get Current Authenticated Profile
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Stateless JWT, client discard is authoritative
    }
  },
};
