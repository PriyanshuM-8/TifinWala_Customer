import api from './api';

export const chefService = {
  // Discover nearby approved home chefs
  getNearbyChefs: async (params = {}) => {
    const response = await api.get('/api/chefs/nearby', { params });
    return response.data;
  },

  // Get single chef profile details
  getChefById: async (chefId) => {
    const response = await api.get(`/api/chefs/${chefId}`);
    return response.data;
  },

  // Get dishes offered by a specific chef
  getChefFoods: async (chefId, params = {}) => {
    const response = await api.get(`/api/chefs/${chefId}/foods`, { params });
    return response.data;
  },

  // Get approved public reviews for a chef
  getChefReviews: async (chefId) => {
    const response = await api.get(`/api/chefs/${chefId}/reviews`);
    return response.data;
  },
};
