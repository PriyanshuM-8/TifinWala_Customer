import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Heart,
  ChefHat,
  ArrowLeft,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  ShoppingBag,
  Share2,
  Users,
  Utensils
} from 'lucide-react';
import { foodService } from '../../services/foodService';
import VegBadge from '../../components/food/VegBadge';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { DEFAULT_IMAGES } from '../../utils/constants';

export const FoodDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, loading: cartLoading } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { info } = useToast();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await foodService.getFoodById(id);
        if (res.success && res.food) {
          setFood(res.food);
        } else {
          setError('Dish not found or no longer available.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dish details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading dish details..." />;
  }

  if (error || !food) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <ErrorState
          title="Dish Unavailable"
          message={error || 'This homemade dish is currently unavailable.'}
          onRetry={() => navigate('/explore')}
        />
      </div>
    );
  }

  const isSaved = isWishlisted(food._id);
  const chefKitchen = food.chefKitchen || food.chef;
  const chefId = food.chefId?._id || food.chefId;

  // Check if already in cart
  const cartItem = cart.items?.find((i) => (i.foodId?._id || i.foodId) === food._id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = async () => {
    await addToCart(food._id, quantity, food.name);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: food.name,
        text: `Taste this delicious homemade ${food.name} on GharKaSwad!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      info('Dish link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#14513F] hover:text-[#0E3B2E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl border border-[#E8ECE7] bg-white text-[#737B76] hover:text-[#14513F] hover:bg-[#F7F8F5] transition-colors"
          title="Share dish"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Showcase (2-Column Desktop, 1-Column Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Food Image Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-[#F7F8F5] border border-[#E8ECE7] shadow-md">
            <img
              src={food.image || DEFAULT_IMAGES.foodPlaceholder}
              alt={food.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = DEFAULT_IMAGES.foodPlaceholder;
              }}
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <VegBadge foodType={food.foodType} size="lg" />
              {food.categoryId?.name && (
                <span className="px-3 py-1 rounded-lg bg-white/95 backdrop-blur-xs text-xs font-bold text-[#14513F] shadow-sm">
                  {food.categoryId.name}
                </span>
              )}
            </div>

            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(food)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#737B76] hover:text-rose-500 shadow-md transition-colors"
              aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart
                className={`w-5 h-5 ${
                  isSaved ? 'fill-rose-500 text-rose-500' : 'stroke-2'
                }`}
              />
            </button>

            {/* Prep Time */}
            {food.preparationTime && (
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-xs text-xs font-semibold text-white">
                <Clock className="w-3.5 h-3.5 text-[#F6A23A]" />
                <span>{formatTime(food.preparationTime)} prep time</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dish Information & Ordering Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8ECE7] shadow-xs space-y-5">
            <div>
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {food.tags && food.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md bg-[#FFFDF8] border border-[#F6A23A]/30 text-[11px] font-semibold text-[#F6A23A]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#27352F] tracking-tight leading-snug">
                {food.name}
              </h1>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#14513F]">
                  {formatCurrency(food.price)}
                </span>
                <span className="text-xs text-[#737B76]">inclusive of all taxes</span>
              </div>
            </div>

            {/* Description */}
            {food.description && (
              <div className="border-t border-[#E8ECE7] pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#737B76] mb-1.5">
                  About this Dish
                </h4>
                <p className="text-sm text-[#27352F] leading-relaxed">
                  {food.description}
                </p>
              </div>
            )}

            {/* Serving Size & Ingredients */}
            <div className="grid grid-cols-2 gap-3 border-t border-[#E8ECE7] pt-4 text-xs">
              {food.servingSize && (
                <div className="p-3 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7]">
                  <span className="text-[#737B76] font-semibold block">Serving Size</span>
                  <span className="font-bold text-[#27352F] mt-0.5 block">{food.servingSize}</span>
                </div>
              )}
              <div className="p-3 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7]">
                <span className="text-[#737B76] font-semibold block">Stock Status</span>
                <span className={`font-bold mt-0.5 block ${food.availableQuantity > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {food.availableQuantity > 0 ? `${food.availableQuantity} available` : 'Sold Out'}
                </span>
              </div>
            </div>

            {/* Ingredients list if present */}
            {food.ingredients && food.ingredients.length > 0 && (
              <div className="border-t border-[#E8ECE7] pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#737B76] mb-1.5">
                  Fresh Ingredients
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {food.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#F7F8F5] text-[11px] font-medium text-[#27352F]"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Order Controls */}
            <div className="border-t border-[#E8ECE7] pt-5 space-y-3">
              {inCartQty > 0 ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-700" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Already in your cart</p>
                      <p className="text-[11px] text-emerald-700">{inCartQty} serving(s) added</p>
                    </div>
                  </div>
                  <Link
                    to="/cart"
                    className="px-4 py-2 rounded-xl bg-[#14513F] text-white text-xs font-bold hover:bg-[#0E3B2E] transition-colors shadow-xs"
                  >
                    View Cart
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#E8ECE7] rounded-xl bg-[#F7F8F5] p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#27352F] hover:bg-[#E8ECE7] disabled:opacity-30 transition-colors shadow-xs"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-[#27352F]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(food.availableQuantity || 10, q + 1))}
                      disabled={quantity >= (food.availableQuantity || 10)}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#27352F] hover:bg-[#E8ECE7] disabled:opacity-30 transition-colors shadow-xs"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading || food.availableQuantity <= 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#14513F] text-white font-bold text-sm hover:bg-[#0E3B2E] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#F6A23A]" />
                    <span>{food.availableQuantity <= 0 ? 'Out of Stock' : `Add to Cart • ${formatCurrency(food.price * quantity)}`}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chef Kitchen Card */}
          {chefKitchen && (
            <div className="bg-white rounded-3xl p-5 border border-[#E8ECE7] shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#FFFDF8] border border-[#E8ECE7] flex items-center justify-center text-[#14513F] shrink-0 shadow-xs">
                  <ChefHat className="w-6 h-6 text-[#14513F]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-[#27352F] truncate">
                      {chefKitchen.kitchenName || 'Home Kitchen'}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-[#737B76] truncate">
                    By Chef {chefKitchen.ownerName || 'Verified Home Cook'} • {chefKitchen.city || ''}
                  </p>
                </div>
              </div>

              {chefId && (
                <Link
                  to={`/chef/${chefId}`}
                  className="px-3.5 py-1.5 rounded-xl border border-[#14513F] text-xs font-bold text-[#14513F] hover:bg-[#14513F]/5 transition-colors shrink-0"
                >
                  View Kitchen
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDetailsPage;
