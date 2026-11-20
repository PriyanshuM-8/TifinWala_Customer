import api from './api';

export const addressService = {
  // Get all customer delivery addresses
  getAddresses: async () => {
    const response = await api.get('/api/customer/addresses');
    return response.data;
  },

  // Get address by ID
  getAddressById: async (id) => {
    const response = await api.get(`/api/customer/addresses/${id}`);
    return response.data;
  },

  // Create new address
  createAddress: async (addressData) => {
    const response = await api.post('/api/customer/addresses', addressData);
    return response.data;
  },

  // Update existing address
  updateAddress: async (id, addressData) => {
    const response = await api.put(`/api/customer/addresses/${id}`, addressData);
    return response.data;
  },

  // Set default address
  setDefaultAddress: async (id) => {
    const response = await api.patch(`/api/customer/addresses/${id}/default`);
    return response.data;
  },

  // Delete address
  deleteAddress: async (id) => {
    const response = await api.delete(`/api/customer/addresses/${id}`);
    return response.data;
  },
};
