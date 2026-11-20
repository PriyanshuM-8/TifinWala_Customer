import api from './api';

export const cartService = {
  // Get customer's recalculated cart
  getCart: async () => {
    const response = await api.get('/api/customer/cart');
    return response.data;
  },

  // Add item to cart
  addItem: async (foodId, quantity = 1) => {
    const response = await api.post('/api/customer/cart/items', { foodId, quantity });
    return response.data;
  },

  // Update item quantity
  updateItemQuantity: async (foodId, quantity) => {
    const response = await api.patch(`/api/customer/cart/items/${foodId}`, { quantity });
    return response.data;
  },

  // Remove specific food item from cart
  removeItem: async (foodId) => {
    const response = await api.delete(`/api/customer/cart/items/${foodId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.delete('/api/customer/cart');
    return response.data;
  },
};
