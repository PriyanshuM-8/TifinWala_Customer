export const BRAND = {
  name: 'GharKaSwad',
  tagline: 'Homemade Food, Made With Love',
  subtitle: 'Fresh, warm, hygienic meals crafted with care by passionate home chefs near you.',
  colors: {
    primary: '#14513F',
    primaryDark: '#0E3B2E',
    primaryLight: '#1C6B54',
    orange: '#F6A23A',
    cream: '#FFFDF8',
    dark: '#27352F',
    secondary: '#737B76',
    light: '#F7F8F5',
    border: '#E8ECE7',
  },
};

export const DEFAULT_IMAGES = {
  foodPlaceholder: '/panirthali.png',
  heroBanner: '/riceDaal.jpg',
  chefAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  emptyCart: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
};

export const ORDER_STATUS_CONFIG = {
  pending_confirmation: {
    label: 'Pending Confirmation',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
  },
  accepted: {
    label: 'Accepted by Kitchen',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
  preparing: {
    label: 'Cooking With Care',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-200',
  },
  delivered: {
    label: 'Delivered',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
  },
  rejected: {
    label: 'Kitchen Unavailable / Rejected',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-200',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
  },
};

export const SUBSCRIPTION_STATUS_CONFIG = {
  active: {
    label: 'Active',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
  },
  paused: {
    label: 'Paused',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-200',
  },
};

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', time: '8:00 AM - 10:00 AM', icon: 'Sun' },
  { id: 'lunch', label: 'Lunch', time: '12:30 PM - 2:30 PM', icon: 'Utensils' },
  { id: 'dinner', label: 'Dinner', time: '7:30 PM - 9:30 PM', icon: 'Moon' },
];
