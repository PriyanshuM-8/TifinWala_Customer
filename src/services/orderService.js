import api from './api';

export const orderService = {
  // Place instant order from cart
  createOrder: async (orderPayload) => {
    const response = await api.post('/api/customer/orders', orderPayload);
    return response.data;
  },

  // Get customer order history
  getOrders: async (params = {}) => {
    const response = await api.get('/api/customer/orders', { params });
    return response.data;
  },

  // Get single order details
  getOrderById: async (orderId) => {
    const response = await api.get(`/api/customer/orders/${orderId}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await api.patch(`/api/customer/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};
