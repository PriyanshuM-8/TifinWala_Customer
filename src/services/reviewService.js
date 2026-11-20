import api from './api';

export const reviewService = {
  // Submit a review for a delivered order
  createReview: async (reviewData) => {
    const response = await api.post('/api/customer/reviews', reviewData);
    return response.data;
  },

  // Get customer's own submitted reviews
  getMyReviews: async () => {
    const response = await api.get('/api/customer/reviews/my-reviews');
    return response.data;
  },

  // Register a complaint for an order
  createComplaint: async (complaintData) => {
    const response = await api.post('/api/customer/complaints', complaintData);
    return response.data;
  },

  // Get customer's own complaints
  getMyComplaints: async () => {
    const response = await api.get('/api/customer/complaints/my-complaints');
    return response.data;
  },
};
