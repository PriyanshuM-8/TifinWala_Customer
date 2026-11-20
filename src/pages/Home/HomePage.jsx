import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ChefHat,
  Sparkles,
  ShieldCheck,
  Clock,
  Calendar,
  Gift,
  ArrowRight,
  Utensils
} from 'lucide-react';
import { foodService } from '../../services/foodService';
import { chefService } from '../../services/chefService';
import { useLocation, POPULAR_CITIES } from '../../context/LocationContext';
import FoodCard from '../../components/food/FoodCard';
import ChefCard from '../../components/chef/ChefCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DEFAULT_IMAGES } from '../../utils/constants';

export const HomePage = () => {
  const { location, openLocationModal, selectCity } = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [nearbyChefs, setNearbyChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // 1. Fetch categories
        const catRes = await foodService.getCategories();
        if (isMounted && catRes.success && catRes.categories) {
          setCategories(catRes.categories);
        }

        // 2. Fetch nearby chefs based on customer GPS and city
        const chefParams = { limit: 8 };
        if (location.lat && location.lng) {
          chefParams.lat = location.lat;
          chefParams.lng = location.lng;
        }
        if (location.city) {
          chefParams.city = location.city;
        }

        const chefRes = await chefService.getNearbyChefs(chefParams);
        if (isMounted) {
          const chefs = chefRes.data || chefRes.chefs || [];
          setNearbyChefs(chefs);
        }

        // 3. Fetch foods discoverable in customer's serviceable radius
        const foodParams = { limit: 8 };
        if (location.lat && location.lng) {
          foodParams.lat = location.lat;
          foodParams.lng = location.lng;
          foodParams.sort = 'distance';
        }
        if (location.city) {
          foodParams.city = location.city;
        }

        const foodRes = await foodService.discoverFoods(foodParams);
        if (isMounted) {
          const foods = foodRes.data || foodRes.foods || [];
          setFeaturedFoods(foods);
        }
      } catch (err) {
        // graceful fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, [location.lat, location.lng, location.city]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="space-y-10 sm:space-y-16">
      {/* 1. Hero Section (2-Column on Desktop, Stacked on Mobile) */}
      <section className="bg-gradient-to-b from-white to-[#F7F8F5] border-b border-[#E8ECE7] pt-6 pb-12 sm:pt-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14513F]/10 border border-[#14513F]/20 text-[#14513F] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#F6A23A]" />
                <span>100% Authentic Ghar Ka Khana</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#14513F] tracking-tight leading-[1.15]">
                Homemade Food, <br className="hidden sm:inline" />
                <span className="text-[#F6A23A]">Made With Love</span>
              </h1>

              <p className="text-base sm:text-lg text-[#737B76] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover fresh, hygienic meals prepared by verified home chefs near you in{' '}
                <strong className="text-[#27352F]">{location.city || 'your area'}</strong>. 
                Cooked on demand in family kitchens with genuine homely taste.
              </p>

              {/* Delivery Location Pill in Hero */}
              <div className="inline-flex items-center gap-2 p-2 px-3 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs text-xs">
                <MapPin className="w-4 h-4 text-[#F6A23A] shrink-0" />
                <span className="text-[#737B76]">Serving:</span>
                <span className="font-bold text-[#14513F] truncate max-w-[200px]">
                  {location.displayName || location.city}
                </span>
                <button
                  onClick={openLocationModal}
                  className="ml-2 font-bold text-[#F6A23A] hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Search Bar in Hero */}
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-md mx-auto lg:mx-0 flex items-center bg-white rounded-2xl border border-[#E8ECE7] p-1.5 shadow-md focus-within:border-[#14513F] transition-all"
              >
                <div className="pl-3 text-[#737B76]">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search homemade dishes, thalis, biryani..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-[#27352F] bg-transparent focus:outline-none placeholder-[#737B76]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs sm:text-sm font-bold transition-colors shrink-0 shadow-sm"
                >
                  Search
                </button>
              </form>

              {/* Quick Action Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-[#737B76]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#14513F]" />
                  <span>Verified Chefs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#F6A23A]" />
                  <span>Fresh Daily Cooking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#14513F]" />
                  <span>Flexible Subscriptions</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Showcase Image with Floating Trust Badges */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#F7F8F5]">
                <img
                  src={DEFAULT_IMAGES.foodPlaceholder}
                  alt="Authentic Indian Homemade Thali"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F6A23A] text-[#14513F] uppercase">
                    Chef Special
                  </span>
                  <p className="font-bold text-base sm:text-lg mt-1">Pure Homemade Thali</p>
                  <p className="text-xs text-white/90">Fresh roti, dal tadka, paneer & fragrant rice</p>
                </div>
              </div>

              {/* Floating Offer Pill */}
              <div className="absolute -top-3 -right-2 sm:-right-4 bg-white rounded-2xl p-3 shadow-xl border border-[#E8ECE7] flex items-center gap-2.5 animate-in fade-in zoom-in duration-300">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#F6A23A] flex items-center justify-center font-bold text-sm">
                  ₹20
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-[#14513F]">Online Discount</p>
                  <p className="text-[10px] text-[#737B76]">Flat ₹20 off on prepaid orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* 2. Cuisine Categories Section */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#14513F]">
                  Cuisine Categories
                </h2>
                <p className="text-xs sm:text-sm text-[#737B76]">
                  Browse by authentic home food categories
                </p>
              </div>
              <Link
                to="/explore"
                className="text-xs sm:text-sm font-bold text-[#14513F] hover:text-[#0E3B2E] flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F6A23A]" />
              </Link>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/explore?category=${cat.slug || cat._id}`}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-white border border-[#E8ECE7] p-2 flex items-center justify-center shadow-xs group-hover:border-[#14513F] group-hover:shadow-md transition-all overflow-hidden">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Utensils className="w-8 h-8 text-[#14513F] group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#27352F] text-center max-w-[85px] truncate group-hover:text-[#14513F] transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 3. Promotional Banners */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-7 border border-[#F6A23A]/30 flex flex-col justify-between relative overflow-hidden shadow-xs">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F6A23A]/20 text-[#27352F]">
                Verified Platform Offer
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#14513F]">
                Flat ₹20 Instant Discount
              </h3>
              <p className="text-xs sm:text-sm text-[#737B76] max-w-sm">
                Pay online via UPI, Cards, or Netbanking and enjoy an automatic ₹20 platform subsidy on your meal order!
              </p>
            </div>
            <div className="mt-5">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14513F] text-white text-xs font-bold hover:bg-[#0E3B2E] transition-colors"
              >
                <span>Order Online Now</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F6A23A]" />
              </Link>
            </div>
          </div>

          <div className="bg-[#14513F] rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between relative overflow-hidden shadow-xs">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-[#FFFDF8]">
                Daily Home Dining
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#FFFDF8]">
                Flexible Meal Subscriptions
              </h3>
              <p className="text-xs sm:text-sm text-white/80 max-w-sm">
                Choose any duration from 3 to 30 days. Customize meals from your favorite home chef and skip days anytime before 8 PM!
              </p>
            </div>
            <div className="mt-5">
              <Link
                to="/subscriptions/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F6A23A] text-[#14513F] text-xs font-black hover:bg-[#E08F2A] transition-colors shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Build Meal Plan</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Nearby Approved HomeChefs Section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#14513F]">
                  Nearby HomeChefs
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#14513F]/10 text-[#14513F] text-xs font-bold">
                  {nearbyChefs.length} Active in {location.city || 'Area'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
                Admin-approved home kitchens serving your practical delivery area
              </p>
            </div>
            <Link
              to="/explore?tab=chefs"
              className="text-xs sm:text-sm font-bold text-[#14513F] hover:text-[#0E3B2E] flex items-center gap-1 transition-colors"
            >
              <span>View All Chefs</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F6A23A]" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Discovering nearby home chefs..." />
          ) : nearbyChefs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {nearbyChefs.map((chef) => (
                <ChefCard key={chef._id} chef={chef} />
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-[#E8ECE7] shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#F6A23A] border border-amber-200 flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-[#27352F]">
                  No HomeChefs currently serving {location.displayName || location.city}
                </h3>
                <p className="text-xs sm:text-sm text-[#737B76]">
                  To guarantee fresh and hot homemade food, we strictly show chefs whose configured service radius reaches your location.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={openLocationModal}
                  className="px-4 py-2.5 rounded-xl bg-[#14513F] text-white text-xs sm:text-sm font-bold hover:bg-[#0E3B2E] transition-colors"
                >
                  Change Delivery Location
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#737B76]">or explore:</span>
                  {POPULAR_CITIES.slice(0, 3).map((c) => (
                    <button
                      key={c.name}
                      onClick={() => selectCity(c)}
                      className="px-2.5 py-1 rounded-lg border border-[#E8ECE7] bg-[#F7F8F5] text-xs font-semibold text-[#14513F] hover:border-[#14513F]"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 5. Homemade Food Near You */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#14513F]">
                Homemade Dishes Near You
              </h2>
              <p className="text-xs sm:text-sm text-[#737B76]">
                Freshly prepared meals available for ordering in {location.city || 'your area'}
              </p>
            </div>
            <Link
              to="/explore"
              className="text-xs sm:text-sm font-bold text-[#14513F] hover:text-[#0E3B2E] flex items-center gap-1 transition-colors"
            >
              <span>See Full Menu</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F6A23A]" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Fetching fresh dishes near you..." />
          ) : featuredFoods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {featuredFoods.map((food) => (
                <FoodCard key={food._id} food={food} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E8ECE7]">
              <Utensils className="w-8 h-8 text-[#737B76] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#27352F]">No dishes listed in this area yet.</p>
              <p className="text-xs text-[#737B76] mt-1">
                Try selecting Lucknow or Varanasi to view active kitchens and menus.
              </p>
            </div>
          )}
        </section>

        {/* 6. Why Choose GharKaSwad */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8ECE7] shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F6A23A]">
              Our Promise
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] mt-1">
              Why Food Lovers Choose GharKaSwad
            </h2>
            <p className="text-xs sm:text-sm text-[#737B76] mt-2">
              Unlike commercial cloud kitchens, we bring you home-cooked goodness from genuine family recipes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#14513F] flex items-center justify-center mb-3">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#27352F] text-base">Verified Home Chefs</h3>
              <p className="text-xs text-[#737B76] mt-1.5 leading-relaxed">
                Every chef is verified for kitchen hygiene, food safety, and authentic culinary passion.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#F6A23A] flex items-center justify-center mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#27352F] text-base">Cooked Fresh on Order</h3>
              <p className="text-xs text-[#737B76] mt-1.5 leading-relaxed">
                Dishes are prepared fresh right after you order. Zero frozen stock or reheating.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#14513F] flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#27352F] text-base">Flexible Meal Subscriptions</h3>
              <p className="text-xs text-[#737B76] mt-1.5 leading-relaxed">
                Custom meal plans for students and working professionals with easy meal skipping before 8 PM.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#F6A23A] flex items-center justify-center mb-3">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#27352F] text-base">Loyalty Rewards</h3>
              <p className="text-xs text-[#737B76] mt-1.5 leading-relaxed">
                Earn 1 point per ₹100 spent and redeem your reward coupons for complimentary home-cooked meals!
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
