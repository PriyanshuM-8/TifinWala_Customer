import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChefHat,
  MapPin,
  ShieldCheck,
  Star,
  ArrowLeft,
  Utensils,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { chefService } from '../../services/chefService';
import { useLocation } from '../../context/LocationContext';
import FoodGrid from '../../components/food/FoodGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export const ChefDetailsPage = () => {
  const { chefId } = useParams();
  const navigate = useNavigate();
  const { location, openLocationModal } = useLocation();

  const [chef, setChef] = useState(null);
  const [foods, setFoods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'reviews'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchChefData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch chef profile
        const chefRes = await chefService.getChefById(chefId);
        if (isMounted && chefRes.success && chefRes.data) {
          setChef(chefRes.data);
        } else {
          if (isMounted) setError('Home Chef profile not found.');
          return;
        }

        // Fetch chef dishes
        const foodsRes = await chefService.getChefFoods(chefId);
        if (isMounted && foodsRes.success && foodsRes.data) {
          setFoods(foodsRes.data);
        }

        // Fetch approved public reviews
        try {
          const reviewsRes = await chefService.getChefReviews(chefId);
          if (isMounted && reviewsRes.success && reviewsRes.reviews) {
            setReviews(reviewsRes.reviews);
          }
        } catch {
          // reviews optional
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load home chef profile.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChefData();

    return () => {
      isMounted = false;
    };
  }, [chefId]);

  if (loading) {
    return <LoadingSpinner text="Loading home chef profile & menu..." />;
  }

  if (error || !chef) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <ErrorState
          title="Chef Not Found"
          message={error || 'This chef profile is unavailable.'}
          onRetry={() => navigate('/explore?tab=chefs')}
        />
      </div>
    );
  }

  const cuisines = Array.isArray(chef.cuisineTypes)
    ? chef.cuisineTypes
    : typeof chef.cuisineTypes === 'string'
    ? chef.cuisineTypes.split(',').map((s) => s.trim())
    : [];

  const isDifferentCity =
    location.city &&
    chef.city &&
    location.city.toLowerCase() !== chef.city.toLowerCase();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#14513F] hover:text-[#0E3B2E] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Chefs</span>
      </button>

      {/* City mismatch warning banner */}
      {isDifferentCity && (
        <div className="p-3.5 px-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              This home kitchen is located in <strong>{chef.city}</strong>. Your current delivery location is set to <strong>{location.city}</strong>.
            </span>
          </div>
          <button
            onClick={openLocationModal}
            className="font-bold underline text-[#14513F] hover:text-[#0E3B2E] shrink-0"
          >
            Change Delivery Location
          </button>
        </div>
      )}

      {/* Chef Profile Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8ECE7] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFFDF8] border-2 border-[#14513F]/20 flex items-center justify-center text-[#14513F] font-bold text-2xl shadow-sm shrink-0 overflow-hidden">
              {chef.profileImage ? (
                <img
                  src={chef.profileImage}
                  alt={chef.kitchenName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ChefHat className="w-9 h-9 text-[#14513F]" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-extrabold text-[#27352F]">
                  {chef.kitchenName || 'Home Kitchen'}
                </h1>
                <span title="Verified Home Kitchen">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </span>
              </div>
              <p className="text-sm font-semibold text-[#14513F]">
                Operated with love by Chef {chef.ownerName}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#737B76]">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F6A23A]" />
                  <span>{chef.city || 'Lucknow'}</span>
                </div>
                <span>•</span>
                <span className="font-bold text-[#14513F]">
                  Service Radius: Within {chef.serviceRadiusKm || 10} km
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E8ECE7]">
            <div className="text-center">
              <span className="text-xs text-[#737B76] block">Available Dishes</span>
              <span className="text-xl font-black text-[#14513F]">{foods.length}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-[#737B76] block">Rating</span>
              <div className="flex items-center justify-center gap-1 text-xl font-black text-[#F6A23A]">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{chef.rating > 0 ? chef.rating.toFixed(1) : 'New'}</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-xs text-[#737B76] block">Reviews</span>
              <span className="text-xl font-black text-[#27352F]">
                {chef.reviewCount || reviews.length}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {chef.description && (
          <p className="text-xs sm:text-sm text-[#737B76] leading-relaxed max-w-3xl pt-2 border-t border-[#E8ECE7]">
            {chef.description}
          </p>
        )}

        {/* Cuisine Pills */}
        {cuisines.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-[#737B76]">Specialties:</span>
            {cuisines.map((c, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-[#F7F8F5] border border-[#E8ECE7] text-xs font-bold text-[#14513F]"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Switcher: Menu vs Reviews */}
      <div className="flex items-center gap-2 border-b border-[#E8ECE7]">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'menu'
              ? 'border-[#14513F] text-[#14513F]'
              : 'border-transparent text-[#737B76] hover:text-[#27352F]'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Kitchen Menu ({foods.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'reviews'
              ? 'border-[#14513F] text-[#14513F]'
              : 'border-transparent text-[#737B76] hover:text-[#27352F]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Customer Reviews ({reviews.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'menu' ? (
        foods.length > 0 ? (
          <FoodGrid foods={foods} />
        ) : (
          <EmptyState
            title="No dishes currently listed"
            description="This kitchen is currently taking a break or updating their menu. Please check back soon!"
            actionText="Explore other chefs"
            actionLink="/explore?tab=chefs"
          />
        )
      ) : (
        /* Reviews Tab */
        <div className="space-y-4">
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white rounded-2xl p-5 border border-[#E8ECE7] shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#14513F]/10 flex items-center justify-center font-bold text-xs text-[#14513F]">
                        {rev.customerId?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#27352F]">
                          {rev.customerId?.name || 'Verified Foodie'}
                        </p>
                        <p className="text-[10px] text-[#737B76]">
                          {formatDate(rev.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.title && (
                    <h4 className="font-bold text-sm text-[#27352F]">{rev.title}</h4>
                  )}
                  {rev.comment && (
                    <p className="text-xs text-[#737B76] leading-relaxed">{rev.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No reviews yet"
              description="Be the first to order from this kitchen and share your homemade food experience!"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChefDetailsPage;
