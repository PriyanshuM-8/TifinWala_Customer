import api from './api';

export const subscriptionService = {
  // Create a flexible custom subscription
  createSubscription: async (subscriptionPayload) => {
    const response = await api.post('/api/customer/subscriptions', subscriptionPayload);
    return response.data;
  },

  // Get customer's subscriptions
  getSubscriptions: async (params = {}) => {
    const response = await api.get('/api/customer/subscriptions', { params });
    return response.data;
  },

  // Get subscription details
  getSubscriptionById: async (id) => {
    const response = await api.get(`/api/customer/subscriptions/${id}`);
    return response.data;
  },

  // Get scheduled meal orders of a subscription
  getSubscriptionMeals: async (id, params = {}) => {
    const response = await api.get(`/api/customer/subscriptions/${id}/meals`, { params });
    return response.data;
  },

  // Get subscription meal history
  getMealHistory: async (id, params = {}) => {
    const response = await api.get(`/api/customer/subscriptions/${id}/history`, { params });
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (id, reason) => {
    const response = await api.patch(`/api/customer/subscriptions/${id}/cancel`, { reason });
    return response.data;
  },

  // Skip all meals for a given dateKey
  skipDay: async (id, dateKey, reason) => {
    const response = await api.patch(`/api/customer/subscriptions/${id}/skip-day`, { dateKey, reason });
    return response.data;
  },

  // Skip a single scheduled meal
  skipMeal: async (mealId, reason) => {
    const response = await api.patch(`/api/customer/subscriptions/meals/${mealId}/skip`, { reason });
    return response.data;
  },

  // Replace a rejected meal
  replaceMeal: async (mealId, newFoodId) => {
    const response = await api.patch(`/api/customer/subscriptions/meals/${mealId}/replace`, { newFoodId });
    return response.data;
  },

  // Get specific meal order details
  getMealOrderById: async (mealId) => {
    const response = await api.get(`/api/customer/subscriptions/meals/${mealId}`);
    return response.data;
  },
};
