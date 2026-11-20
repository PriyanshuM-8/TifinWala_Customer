import api from './api';

export const loyaltyService = {
  // Get customer points balance & tier
  getBalance: async () => {
    const response = await api.get('/api/customer/loyalty/balance');
    return response.data;
  },

  // Get loyalty transaction history
  getTransactions: async (params = {}) => {
    const response = await api.get('/api/customer/loyalty/transactions', { params });
    return response.data;
  },

  // Get customer reward coupons
  getCoupons: async (params = {}) => {
    const response = await api.get('/api/customer/loyalty/coupons', { params });
    return response.data;
  },

  // Redeem reward coupon for free meals
  redeemCoupon: async (couponId, redemptionData) => {
    const response = await api.post(`/api/customer/loyalty/coupons/${couponId}/redeem`, redemptionData);
    return response.data;
  },

  // Get redemption history
  getRedemptions: async () => {
    const response = await api.get('/api/customer/loyalty/redemptions');
    return response.data;
  },

  // In-app notifications
  getNotifications: async (params = {}) => {
    const response = await api.get('/api/customer/loyalty/notifications', { params });
    return response.data;
  },

  // Mark single notification read
  markNotificationRead: async (notificationId) => {
    const response = await api.patch(`/api/customer/loyalty/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications read
  markAllNotificationsRead: async () => {
    const response = await api.patch('/api/customer/loyalty/notifications/read-all');
    return response.data;
  },

  // Customer reward wallet overview
  getWalletOverview: async () => {
    const response = await api.get('/api/customer/wallet');
    return response.data;
  },

  // Customer reward wallet ledger
  getWalletTransactions: async (params = {}) => {
    const response = await api.get('/api/customer/wallet/transactions', { params });
    return response.data;
  },

  // Customer reward wallet coupons
  getWalletCoupons: async (params = {}) => {
    const response = await api.get('/api/customer/wallet/coupons', { params });
    return response.data;
  },
};
