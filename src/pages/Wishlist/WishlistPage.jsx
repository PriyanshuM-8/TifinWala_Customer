import React from 'react';
import { Heart, Utensils, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import FoodCard from '../../components/food/FoodCard';
import EmptyState from '../../components/common/EmptyState';

export const WishlistPage = () => {
  const { wishlist, wishlistCount } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] tracking-tight">
          Saved Homemade Dishes
        </h1>
        <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
          {wishlistCount} favorite meal{wishlistCount === 1 ? '' : 's'} saved on your device
        </p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((food) => (
            <FoodCard key={food._id || food.id} food={food} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No Favorite Dishes Saved"
          description="You haven't saved any dishes yet. Tap the heart icon on any homemade meal to quickly find and order it again later!"
          actionText="Explore Dishes"
          actionLink="/explore"
        />
      )}
    </div>
  );
};

export default WishlistPage;
