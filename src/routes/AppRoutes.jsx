import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Utensils } from 'lucide-react';

// Lazy-loaded pages for optimized performance & code splitting
const HomePage = lazy(() => import('../pages/Home/HomePage'));
const ExplorePage = lazy(() => import('../pages/Explore/ExplorePage'));
const FoodDetailsPage = lazy(() => import('../pages/FoodDetails/FoodDetailsPage'));
const ChefDetailsPage = lazy(() => import('../pages/ChefDetails/ChefDetailsPage'));
const LoginPage = lazy(() => import('../pages/Authentication/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Authentication/RegisterPage'));
const CartPage = lazy(() => import('../pages/Cart/CartPage'));
const CheckoutPage = lazy(() => import('../pages/Checkout/CheckoutPage'));
const OrdersPage = lazy(() => import('../pages/Orders/OrdersPage'));
const OrderDetailsPage = lazy(() => import('../pages/Orders/OrderDetailsPage'));
const SubscriptionsPage = lazy(() => import('../pages/Subscriptions/SubscriptionsPage'));
const CreateSubscriptionPage = lazy(() => import('../pages/Subscriptions/CreateSubscriptionPage'));
const SubscriptionDetailsPage = lazy(() => import('../pages/Subscriptions/SubscriptionDetailsPage'));
const RewardsPage = lazy(() => import('../pages/Rewards/RewardsPage'));
const WishlistPage = lazy(() => import('../pages/Wishlist/WishlistPage'));
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'));
const AddressesPage = lazy(() => import('../pages/Profile/AddressesPage'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner text="Loading delicious home meals..." />
  </div>
);

const NotFoundPage = () => (
  <div className="max-w-xl mx-auto px-4 py-16 text-center">
    <EmptyState
      icon={Utensils}
      title="404 - Page Not Found"
      description="The homemade recipe or page you are looking for does not exist."
      actionText="Return to Home"
      actionLink="/"
    />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Browsing Routes */}
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="food/:id" element={<FoodDetailsPage />} />
          <Route path="chef/:chefId" element={<ChefDetailsPage />} />
          <Route path="wishlist" element={<WishlistPage />} />

          {/* Authentication Routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Cart */}
          <Route path="cart" element={<CartPage />} />

          {/* Protected Customer Routes */}
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="subscriptions"
            element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="subscriptions/create"
            element={
              <ProtectedRoute>
                <CreateSubscriptionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="subscriptions/:id"
            element={
              <ProtectedRoute>
                <SubscriptionDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="rewards"
            element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="addresses"
            element={
              <ProtectedRoute>
                <AddressesPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
