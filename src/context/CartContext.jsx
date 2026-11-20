import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { extractErrorMessage } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, error: showError, info } = useToast();

  const [cart, setCart] = useState({
    items: [],
    chef: null,
    totalItems: 0,
    subtotal: 0,
  });
  const [loading, setLoading] = useState(false);
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    existingKitchen: '',
    newKitchen: '',
    pendingFoodId: null,
    pendingQuantity: 1,
  });

  // Fetch cart whenever customer is authenticated
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], chef: null, totalItems: 0, subtotal: 0 });
      return;
    }

    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      // ignore empty or uninitialized
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add Item
  const addToCart = async (foodId, quantity = 1, dishName = 'Dish') => {
    if (!isAuthenticated) {
      showError('Please sign in to add delicious homemade meals to your cart.');
      return { success: false, requireAuth: true };
    }

    try {
      setLoading(true);
      const res = await cartService.addItem(foodId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
        success(`Added ${dishName} to your cart!`);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      // Check for single-chef conflict
      if (err.response?.status === 409) {
        const errorData = err.response.data;
        setConflictModal({
          isOpen: true,
          existingKitchen: errorData?.existingKitchen || cart.chef?.kitchenName || 'another kitchen',
          newKitchen: errorData?.newKitchen || 'new kitchen',
          pendingFoodId: foodId,
          pendingQuantity: quantity,
          dishName,
        });
        return { success: false, isConflict: true };
      }

      const msg = extractErrorMessage(err, 'Could not add dish to cart.');
      showError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Resolve conflict: Clear current cart and add the new dish
  const resolveConflictAndAdd = async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      const res = await cartService.addItem(
        conflictModal.pendingFoodId,
        conflictModal.pendingQuantity
      );
      if (res.success && res.cart) {
        setCart(res.cart);
        success(`Cart cleared and added ${conflictModal.dishName || 'new dish'}!`);
      }
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to replace cart item.');
      showError(msg);
    } finally {
      setLoading(false);
      setConflictModal({
        isOpen: false,
        existingKitchen: '',
        newKitchen: '',
        pendingFoodId: null,
        pendingQuantity: 1,
      });
    }
  };

  const closeConflictModal = () => {
    setConflictModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Update item quantity
  const updateQuantity = async (foodId, quantity) => {
    if (!isAuthenticated) return;
    if (quantity <= 0) {
      return removeItem(foodId);
    }

    try {
      const res = await cartService.updateItemQuantity(foodId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not update quantity.');
      showError(msg);
    }
  };

  // Remove specific item
  const removeItem = async (foodId) => {
    if (!isAuthenticated) return;
    try {
      const res = await cartService.removeItem(foodId);
      if (res.success && res.cart) {
        setCart(res.cart);
        info('Item removed from cart.');
      }
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not remove item.');
      showError(msg);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await cartService.clearCart();
      if (res.success) {
        setCart({ items: [], chef: null, totalItems: 0, subtotal: 0 });
        info('Cart cleared.');
      }
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not clear cart.');
      showError(msg);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount: cart.totalItems || 0,
        subtotal: cart.subtotal || 0,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
        conflictModal,
        closeConflictModal,
        resolveConflictAndAdd,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
