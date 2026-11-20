import api from './api';

export const foodService = {
  // Get active public categories
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  // Browse public foods with filters
  getFoods: async (params = {}) => {
    const response = await api.get('/api/foods', { params });
    return response.data;
  },

  // Single food details
  getFoodById: async (id) => {
    const response = await api.get(`/api/foods/${id}`);
    return response.data;
  },

  // Category specific foods
  getFoodsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/api/foods/category/${categoryId}`, { params });
    return response.data;
  },

  // Chef specific foods
  getFoodsByChef: async (chefId, params = {}) => {
    const response = await api.get(`/api/foods/chef/${chefId}`, { params });
    return response.data;
  },

  // Advanced Food Discovery (with lat/lng distance calculation)
  discoverFoods: async (params = {}) => {
    const response = await api.get('/api/discovery/foods', { params });
    return response.data;
  },
};
