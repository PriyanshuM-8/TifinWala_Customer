import api from './api';

export const paymentService = {
  // Initiate payment for instant order
  createOrderPayment: async (orderId, paymentMethod = 'online') => {
    const response = await api.post('/api/customer/payments/order', { orderId, paymentMethod });
    return response.data;
  },

  // Initiate upfront payment for subscription
  createSubscriptionPayment: async (subscriptionId) => {
    const response = await api.post('/api/customer/payments/subscription', { subscriptionId });
    return response.data;
  },

  // Verify Razorpay payment signature
  verifyPayment: async (verificationData) => {
    const response = await api.post('/api/customer/payments/verify', verificationData);
    return response.data;
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    const response = await api.get(`/api/customer/payments/${paymentId}`);
    return response.data;
  },
};
