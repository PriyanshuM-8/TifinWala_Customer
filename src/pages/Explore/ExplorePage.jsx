import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  ChefHat,
  Utensils,
  X,
  MapPin
} from 'lucide-react';
import { foodService } from '../../services/foodService';
import { chefService } from '../../services/chefService';
import { useLocation } from '../../context/LocationContext';
import FoodGrid from '../../components/food/FoodGrid';
import ChefCard from '../../components/chef/ChefCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location, openLocationModal } = useLocation();

  // Tab: 'foods' | 'chefs'
  const activeTab = searchParams.get('tab') === 'chefs' ? 'chefs' : 'foods';

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [foodType, setFoodType] = useState(searchParams.get('foodType') || '');
  const [sortOption, setSortOption] = useState(
    searchParams.get('sort') || (location.lat && location.lng ? 'distance' : 'newest')
  );

  // Data states
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await foodService.getCategories();
        if (res.success && res.categories) {
          setCategories(res.categories);
        }
      } catch {
        // ignore
      }
    };
    fetchCats();
  }, []);

  // Fetch data whenever filters or tab changes
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        if (activeTab === 'foods') {
          const params = {
            page,
            limit: 12,
            sort: sortOption,
            ...(searchTerm.trim() && { search: searchTerm.trim() }),
            ...(selectedCategory && { category: selectedCategory }),
            ...(foodType && { foodType }),
          };

          // Attach coordinates and city for discovery
          if (location.lat && location.lng) {
            params.lat = location.lat;
            params.lng = location.lng;
          }
          if (location.city) {
            params.city = location.city;
          }

          const res = await foodService.discoverFoods(params);
          if (isMounted) {
            const list = res.data || res.foods || [];
            setFoods(list);
            setTotalPages(res.pagination?.totalPages || 1);
          }
        } else {
          // Chefs Tab
          const params = {
            page,
            limit: 12,
            ...(searchTerm.trim() && { search: searchTerm.trim() }),
          };

          if (location.lat && location.lng) {
            params.lat = location.lat;
            params.lng = location.lng;
          }
          if (location.city) {
            params.city = location.city;
          }

          const res = await chefService.getNearbyChefs(params);
          if (isMounted) {
            const list = res.data || res.chefs || [];
            setChefs(list);
            setTotalPages(res.pagination?.totalPages || 1);
          }
        }
      } catch (err) {
        if (isMounted) {
          setFoods([]);
          setChefs([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [
    activeTab,
    searchTerm,
    selectedCategory,
    foodType,
    sortOption,
    page,
    location.city,
    location.lat,
    location.lng,
  ]);

  const handleTabChange = (tabName) => {
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (tabName === 'chefs') {
      newParams.set('tab', 'chefs');
    } else {
      newParams.delete('tab');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFoodType('');
    setSortOption(location.lat && location.lng ? 'distance' : 'newest');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    searchTerm || selectedCategory || foodType || sortOption !== (location.lat && location.lng ? 'distance' : 'newest')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8ECE7] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] tracking-tight">
            Explore Homemade Food
          </h1>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Discover authentic homemade meals from home kitchens serving {location.city || 'your area'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => handleTabChange('foods')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'foods'
                ? 'bg-[#14513F] text-white shadow-xs'
                : 'text-[#737B76] hover:text-[#27352F]'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Dishes</span>
          </button>
          <button
            onClick={() => handleTabChange('chefs')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'chefs'
                ? 'bg-[#14513F] text-white shadow-xs'
                : 'text-[#737B76] hover:text-[#27352F]'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>HomeChefs</span>
          </button>
        </div>
      </div>

      {/* Service Area Notice Bar */}
      <div className="bg-[#FFFDF8] rounded-2xl p-3.5 px-4 border border-[#F6A23A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-[#F6A23A] shrink-0" />
          <p className="text-xs text-[#27352F]">
            Showing kitchens serving <strong className="text-[#14513F]">{location.displayName || location.city}</strong> within their configured service radius.
          </p>
        </div>
        <button
          onClick={openLocationModal}
          className="text-xs font-bold text-[#14513F] hover:text-[#0E3B2E] self-start sm:self-auto underline"
        >
          Change Delivery Location
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex items-center bg-white rounded-2xl border border-[#E8ECE7] px-3.5 py-2.5 shadow-xs focus-within:border-[#14513F] transition-all"
        >
          <Search className="w-5 h-5 text-[#737B76] shrink-0 mr-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'foods'
                ? 'Search dishes, thalis, regional foods...'
                : 'Search home chefs by name or kitchen...'
            }
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full text-sm text-[#27352F] bg-transparent focus:outline-none placeholder-[#737B76]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-[#737B76] hover:text-[#27352F] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Quick Filter Buttons (only on foods tab) */}
        {activeTab === 'foods' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            {/* Veg filter */}
            <button
              onClick={() => {
                setFoodType((prev) => (prev === 'veg' ? '' : 'veg'));
                setPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors shrink-0 flex items-center gap-1.5 ${
                foodType === 'veg'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                  : 'bg-white border-[#E8ECE7] text-[#27352F] hover:bg-[#F7F8F5]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Veg Only</span>
            </button>

            {/* Non-veg filter */}
            <button
              onClick={() => {
                setFoodType((prev) => (prev === 'non_veg' ? '' : 'non_veg'));
                setPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors shrink-0 flex items-center gap-1.5 ${
                foodType === 'non_veg'
                  ? 'bg-rose-50 border-rose-600 text-rose-800'
                  : 'bg-white border-[#E8ECE7] text-[#27352F] hover:bg-[#F7F8F5]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>Non-Veg</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-[#E8ECE7] text-[#27352F] focus:outline-none focus:border-[#14513F] transition-colors shrink-0 cursor-pointer"
            >
              {location.lat && location.lng && (
                <option value="distance">Sort: Distance (Nearest)</option>
              )}
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {/* Clear Filters if any */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Pills Bar (Foods Tab) */}
      {activeTab === 'foods' && categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              !selectedCategory
                ? 'bg-[#14513F] text-white shadow-xs'
                : 'bg-white border border-[#E8ECE7] text-[#27352F] hover:bg-[#F7F8F5]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected =
              selectedCategory === cat._id || selectedCategory === cat.slug;
            return (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(isSelected ? '' : cat.slug || cat._id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-[#14513F] text-white shadow-xs'
                    : 'bg-white border border-[#E8ECE7] text-[#27352F] hover:bg-[#F7F8F5]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner
          text={
            activeTab === 'foods'
              ? 'Loading homemade dishes...'
              : 'Discovering verified home chefs...'
          }
        />
      ) : activeTab === 'foods' ? (
        foods.length > 0 ? (
          <>
            <FoodGrid foods={foods} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 flex items-center justify-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl border border-[#E8ECE7] bg-white text-xs font-bold text-[#27352F] hover:bg-[#F7F8F5] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-[#737B76]">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 rounded-xl border border-[#E8ECE7] bg-white text-xs font-bold text-[#27352F] hover:bg-[#F7F8F5] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No dishes found in your service area"
            description={`We couldn't find available dishes matching your location (${location.displayName || location.city}) and filter criteria.`}
            actionText="Change Delivery Location"
            onAction={openLocationModal}
          />
        )
      ) : (
        /* Chefs Tab */
        chefs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {chefs.map((chef) => (
                <ChefCard key={chef._id} chef={chef} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 flex items-center justify-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl border border-[#E8ECE7] bg-white text-xs font-bold text-[#27352F] hover:bg-[#F7F8F5] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-[#737B76]">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 rounded-xl border border-[#E8ECE7] bg-white text-xs font-bold text-[#27352F] hover:bg-[#F7F8F5] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No approved chefs in this service area"
            description={`We haven't onboarded active home chefs serving ${location.displayName || location.city} yet. Try selecting Lucknow or Varanasi.`}
            actionText="Change Delivery Location"
            onAction={openLocationModal}
          />
        )
      )}
    </div>
  );
};

export default ExplorePage;
