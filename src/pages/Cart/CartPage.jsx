import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChefHat,
  ArrowRight,
  ShieldCheck,
  Tag,
  MapPin,
  Utensils
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import VegBadge from '../../components/food/VegBadge';
import { formatCurrency } from '../../utils/formatters';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DEFAULT_IMAGES } from '../../utils/constants';

export const CartPage = () => {
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (loading && (!cart.items || cart.items.length === 0)) {
    return <LoadingSpinner text="Recalculating fresh cart prices..." />;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your Cart is Empty"
          description="You haven't added any delicious homemade meals yet. Explore our fresh daily kitchens near you!"
          actionText="Explore Homemade Dishes"
          actionLink="/explore"
        />
      </div>
    );
  }

  const chef = cart.chef;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-[#E8ECE7] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] tracking-tight">
            Your Food Cart
          </h1>
          <p className="text-xs sm:text-sm text-[#737B76]">
            {cart.totalItems} item{cart.totalItems === 1 ? '' : 's'} ready for fresh preparation
          </p>
        </div>

        <button
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Designated Kitchen Attribution Banner */}
          {chef && (
            <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#F6A23A]/40 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#F6A23A] shrink-0">
                  <ChefHat className="w-5 h-5 text-[#14513F]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#737B76]">
                    Ordering From Kitchen
                  </p>
                  <p className="font-bold text-sm text-[#27352F] truncate">
                    {chef.kitchenName} • {chef.city}
                  </p>
                </div>
              </div>

              <Link
                to={`/chef/${chef.userId || chef.chefId}`}
                className="text-xs font-bold text-[#14513F] hover:underline shrink-0"
              >
                + Add more dishes
              </Link>
            </div>
          )}

          {/* Items */}
          <div className="space-y-3">
            {cart.items.map((item) => {
              const foodId = item.foodId?._id || item.foodId;
              return (
                <div
                  key={foodId}
                  className="bg-white rounded-2xl p-4 border border-[#E8ECE7] shadow-xs flex items-center gap-4 group"
                >
                  {/* Dish Image */}
                  <div className="w-20 h-20 rounded-xl bg-[#F7F8F5] overflow-hidden shrink-0 border border-[#E8ECE7]">
                    <img
                      src={item.image || DEFAULT_IMAGES.foodPlaceholder}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = DEFAULT_IMAGES.foodPlaceholder;
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <VegBadge foodType={item.foodType} size="sm" />
                      <h3 className="font-bold text-sm sm:text-base text-[#27352F] truncate">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-xs text-[#737B76]">
                      {formatCurrency(item.unitPrice)} each
                    </p>
                    <p className="text-sm font-extrabold text-[#14513F] mt-1">
                      {formatCurrency(item.itemTotal || item.unitPrice * item.quantity)}
                    </p>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center border border-[#E8ECE7] rounded-xl bg-[#F7F8F5] p-1">
                      <button
                        onClick={() => updateQuantity(foodId, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#27352F] hover:bg-[#E8ECE7] transition-colors shadow-xs"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-[#27352F]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(foodId, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#27352F] hover:bg-[#E8ECE7] transition-colors shadow-xs"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(foodId)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Action */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8ECE7] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#27352F] pb-3 border-b border-[#E8ECE7]">
              Bill Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-[#737B76]">
                <span>Item Subtotal</span>
                <span className="font-semibold text-[#27352F]">
                  {formatCurrency(cart.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#737B76]">
                <span>Delivery Partner Fee</span>
                <span className="font-semibold text-emerald-700">FREE</span>
              </div>

              {/* Platform Promo Highlight */}
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-start gap-2">
                <Tag className="w-4 h-4 text-[#F6A23A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#14513F] block">
                    Prepaid Savings Available!
                  </span>
                  <span>
                    Get an automatic flat ₹20 platform discount at checkout by choosing online payment!
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8ECE7] flex items-center justify-between">
                <div>
                  <span className="text-base font-extrabold text-[#27352F] block">
                    To Pay (approx)
                  </span>
                  <span className="text-[11px] text-[#737B76]">
                    Final total calculated at checkout
                  </span>
                </div>
                <span className="text-xl font-black text-[#14513F]">
                  {formatCurrency(cart.subtotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#14513F] text-white font-extrabold text-sm hover:bg-[#0E3B2E] transition-colors shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#F6A23A]" />
            </button>
          </div>

          {/* Trust Guarantee */}
          <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] flex items-center gap-3 text-xs text-[#737B76]">
            <ShieldCheck className="w-5 h-5 text-[#14513F] shrink-0" />
            <span>
              Prepared fresh in an approved home kitchen. Single-chef order guarantee ensures authentic packing.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
