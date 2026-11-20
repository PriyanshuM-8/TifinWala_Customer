import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem('gks_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { success, info } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('gks_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const isWishlisted = (foodId) => {
    return wishlist.some((item) => (item._id || item.id) === foodId);
  };

  const toggleWishlist = (food) => {
    const id = food._id || food.id;
    if (isWishlisted(id)) {
      setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== id));
      info(`Removed ${food.name} from favorites`);
    } else {
      setWishlist((prev) => [...prev, food]);
      success(`Saved ${food.name} to favorites!`);
    }
  };

  const removeFromWishlist = (foodId) => {
    setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== foodId));
    info('Removed from favorites');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
