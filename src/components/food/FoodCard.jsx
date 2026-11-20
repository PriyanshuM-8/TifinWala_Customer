import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Plus, Heart, MapPin, ChefHat, Check } from 'lucide-react';
import VegBadge from './VegBadge';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { DEFAULT_IMAGES } from '../../utils/constants';

export const FoodCard = ({ food }) => {
  const { cart, addToCart, loading } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  if (!food) return null;

  const foodId = food._id || food.id;
  const isSaved = isWishlisted(foodId);

  // Check if item is already in cart
  const cartItem = cart.items?.find((i) => (i.foodId?._id || i.foodId) === foodId);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(foodId, 1, food.name);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(food);
  };

  const chefName =
    food.kitchen?.kitchenName ||
    food.chef?.kitchenName ||
    food.chefKitchen?.kitchenName ||
    food.chefId?.name ||
    'Home Kitchen';

  const chefCity =
    food.kitchen?.city ||
    food.chef?.city ||
    food.chefKitchen?.city ||
    '';

  const categoryName = food.categoryId?.name || food.category?.name || '';

  return (
    <div className="group bg-white rounded-2xl border border-[#E8ECE7] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col h-full relative">
      {/* Food Image Container */}
      <div className="relative aspect-4/3 w-full bg-[#F7F8F5] overflow-hidden">
        <Link to={`/food/${foodId}`} className="block w-full h-full">
          <img
            src={food.image || DEFAULT_IMAGES.foodPlaceholder}
            alt={food.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = DEFAULT_IMAGES.foodPlaceholder;
            }}
          />
        </Link>

        {/* Veg/Non-veg & Category badges top left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <VegBadge foodType={food.foodType} size="md" />
          {categoryName && (
            <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-bold text-[#14513F] shadow-xs">
              {categoryName}
            </span>
          )}
        </div>

        {/* Wishlist toggle top right */}
        <button
          onClick={handleWishlist}
          aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#737B76] hover:text-rose-500 hover:bg-white transition-colors shadow-xs z-10"
        >
          <Heart
            className={`w-4 h-4 ${
              isSaved ? 'fill-rose-500 text-rose-500' : 'stroke-2'
            }`}
          />
        </button>

        {/* Preparation time badge bottom left */}
        {food.preparationTime && (
          <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[11px] font-semibold text-white">
            <Clock className="w-3 h-3 text-[#F6A23A]" />
            <span>{formatTime(food.preparationTime)}</span>
          </div>
        )}

        {/* Distance badge if provided by discovery */}
        {food.distanceKm !== undefined && (
          <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#14513F]/90 backdrop-blur-xs text-[11px] font-bold text-white">
            <span>{food.distanceKm} km away</span>
          </div>
        )}
      </div>

      {/* Food Details Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Chef Kitchen Attribution */}
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#737B76] mb-1">
            <ChefHat className="w-3.5 h-3.5 text-[#F6A23A] shrink-0" />
            <span className="truncate">{chefName}</span>
            {chefCity && (
              <>
                <span>•</span>
                <span className="truncate">{chefCity}</span>
              </>
            )}
          </div>

          {/* Dish Name */}
          <Link to={`/food/${foodId}`}>
            <h3 className="font-bold text-[#27352F] text-base leading-snug group-hover:text-[#14513F] transition-colors line-clamp-1">
              {food.name}
            </h3>
          </Link>

          {/* Description snippet */}
          {food.description && (
            <p className="mt-1 text-xs text-[#737B76] line-clamp-2 leading-relaxed">
              {food.description}
            </p>
          )}
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-3 pt-3 border-t border-[#E8ECE7] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#737B76] block leading-none">
              Price
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[#14513F]">
              {formatCurrency(food.price)}
            </span>
          </div>

          {/* Add / Added Button */}
          {cartQuantity > 0 ? (
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#14513F] border border-[#14513F]/30 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>In Cart ({cartQuantity})</span>
            </Link>
          ) : (
            <button
              onClick={handleAdd}
              disabled={loading || food.availableQuantity <= 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#14513F] text-white text-xs sm:text-sm font-bold hover:bg-[#0E3B2E] transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 text-[#F6A23A]" />
              <span>{food.availableQuantity <= 0 ? 'Sold Out' : 'ADD'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
