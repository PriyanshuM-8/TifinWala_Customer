import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ChefHat,
  Utensils,
  Truck,
  Store,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { chefService } from '../../services/chefService';
import { addressService } from '../../services/addressService';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const CreateSubscriptionPage = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { success, error: showError, info } = useToast();

  // Step 1: Duration & Start Date
  // Default to today in YYYY-MM-DD
  const todayKey = new Date().toISOString().split('T')[0];
  const [startDateKey, setStartDateKey] = useState(todayKey);
  const [durationDays, setDurationDays] = useState(7); // Flexible!

  // Step 2: Meal Types selection (multi-select 1-3)
  const [selectedMealTypes, setSelectedMealTypes] = useState(['lunch']);

  // Available Data
  const [chefs, setChefs] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Chef dishes map { chefId: [foods] }
  const [chefFoodsMap, setChefFoodsMap] = useState({});

  // Configurations for each meal type:
  // { breakfast: { chefId, foodId, quantity, deliveryType, deliveryAddressId }, ... }
  const [configurations, setConfigurations] = useState({
    breakfast: { chefId: '', foodId: '', quantity: 1, deliveryType: 'chef_delivery', deliveryAddressId: '' },
    lunch: { chefId: '', foodId: '', quantity: 1, deliveryType: 'chef_delivery', deliveryAddressId: '' },
    dinner: { chefId: '', foodId: '', quantity: 1, deliveryType: 'chef_delivery', deliveryAddressId: '' },
  });

  // Fetch approved chefs & customer addresses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [chefsRes, addrRes] = await Promise.all([
          chefService.getNearbyChefs({ city: location.city || 'Lucknow', limit: 20 }),
          addressService.getAddresses(),
        ]);

        if (chefsRes.success && chefsRes.data) {
          setChefs(chefsRes.data);
        }

        if (addrRes.success && addrRes.addresses) {
          setAddresses(addrRes.addresses);
          const defaultAddr = addrRes.addresses.find((a) => a.isDefault) || addrRes.addresses[0];
          if (defaultAddr) {
            setConfigurations((prev) => ({
              breakfast: { ...prev.breakfast, deliveryAddressId: defaultAddr._id },
              lunch: { ...prev.lunch, deliveryAddressId: defaultAddr._id },
              dinner: { ...prev.dinner, deliveryAddressId: defaultAddr._id },
            }));
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [location.city]);

  // Load dishes for a selected chef on demand
  const loadChefFoods = async (chefId) => {
    if (!chefId || chefFoodsMap[chefId]) return;
    try {
      const res = await chefService.getChefFoods(chefId);
      if (res.success && res.data) {
        setChefFoodsMap((prev) => ({ ...prev, [chefId]: res.data }));
      }
    } catch {
      // ignore
    }
  };

  // Toggle meal type checkbox
  const handleToggleMealType = (mType) => {
    if (selectedMealTypes.includes(mType)) {
      if (selectedMealTypes.length === 1) {
        showError('You must select at least one meal type.');
        return;
      }
      setSelectedMealTypes((prev) => prev.filter((t) => t !== mType));
    } else {
      if (selectedMealTypes.length >= 3) {
        showError('You can select a maximum of 3 meal types.');
        return;
      }
      setSelectedMealTypes((prev) => [...prev, mType]);
    }
  };

  // Handle chef selection for a specific meal
  const handleChefChange = async (mealType, chefId) => {
    setConfigurations((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        chefId,
        foodId: '', // Reset food when chef changes
      },
    }));
    await loadChefFoods(chefId);
  };

  // Calculate daily cost
  let dailyEstimated = 0;
  selectedMealTypes.forEach((mType) => {
    const config = configurations[mType];
    if (config?.chefId && config?.foodId && chefFoodsMap[config.chefId]) {
      const food = chefFoodsMap[config.chefId].find((f) => f._id === config.foodId);
      if (food) {
        dailyEstimated += (food.price || 0) * (config.quantity || 1);
      }
    }
  });

  const estimatedTotalCost = dailyEstimated * (parseInt(durationDays, 10) || 1);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    const days = parseInt(durationDays, 10);
    if (isNaN(days) || days < 1) {
      showError('Subscription duration must be at least 1 day.');
      return;
    }

    if (selectedMealTypes.length === 0) {
      showError('Please select at least 1 meal type.');
      return;
    }

    const mealConfigsPayload = [];
    for (const mType of selectedMealTypes) {
      const conf = configurations[mType];
      if (!conf.chefId) {
        showError(`Please select a home chef for ${mType}.`);
        return;
      }
      if (!conf.foodId) {
        showError(`Please choose a dish for ${mType}.`);
        return;
      }
      if (conf.deliveryType === 'chef_delivery' && !conf.deliveryAddressId) {
        showError(`Please select a delivery address for ${mType}.`);
        return;
      }

      mealConfigsPayload.push({
        mealType: mType,
        chefId: conf.chefId,
        foodId: conf.foodId,
        quantity: conf.quantity || 1,
        deliveryType: conf.deliveryType,
        deliveryAddressId: conf.deliveryType === 'chef_delivery' ? conf.deliveryAddressId : undefined,
      });
    }

    try {
      setSubmitting(true);
      const payload = {
        startDateKey,
        durationDays: days,
        mealTypes: selectedMealTypes,
        mealConfigurations: mealConfigsPayload,
      };

      const res = await subscriptionService.createSubscription(payload);
      if (res.success && res.data) {
        success('Subscription created successfully! Your daily meals are scheduled.');
        navigate(`/subscriptions/${res.data._id}`);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create meal subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return <LoadingSpinner text="Loading subscription configurator..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Back button */}
      <Link
        to="/subscriptions"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#14513F] hover:text-[#0E3B2E] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Subscriptions</span>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] tracking-tight">
          Create Custom Meal Subscription
        </h1>
        <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
          Pick your duration, choose your favorite home chefs, and schedule daily meals
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Duration & Start Date */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8ECE7] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#27352F] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#14513F] text-white text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>Duration & Start Date</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase mb-1.5">
                Subscription Start Date
              </label>
              <input
                type="date"
                required
                min={todayKey}
                value={startDateKey}
                onChange={(e) => setStartDateKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] focus:bg-white transition-colors"
              />
            </div>

            {/* Flexible Duration Days */}
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase mb-1.5">
                Number of Days (Flexible)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  min={1}
                  max={90}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-28 px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-sm font-bold text-[#27352F] focus:outline-none focus:border-[#14513F] focus:bg-white transition-colors"
                />
                <span className="text-xs text-[#737B76]">days duration</span>
              </div>
            </div>
          </div>

          {/* Quick preset chips for convenience */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#737B76] font-semibold">Quick Presets:</span>
            {[3, 7, 14, 21, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurationDays(d)}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-colors ${
                  durationDays === d
                    ? 'bg-[#14513F] text-white border-[#14513F]'
                    : 'bg-[#F7F8F5] border-[#E8ECE7] text-[#27352F] hover:bg-[#E8ECE7]'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Meal Types Selection */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8ECE7] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#27352F] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#14513F] text-white text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>Select Daily Meal Types (1 to 3)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {[
              { id: 'breakfast', label: 'Breakfast', time: '8:00 AM - 10:00 AM' },
              { id: 'lunch', label: 'Lunch', time: '12:30 PM - 2:30 PM' },
              { id: 'dinner', label: 'Dinner', time: '7:30 PM - 9:30 PM' },
            ].map((meal) => {
              const isChecked = selectedMealTypes.includes(meal.id);
              return (
                <label
                  key={meal.id}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                    isChecked
                      ? 'border-[#14513F] bg-[#14513F]/5 ring-2 ring-[#14513F]/20'
                      : 'border-[#E8ECE7] hover:bg-[#F7F8F5]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleMealType(meal.id)}
                    className="mt-1 text-[#14513F] focus:ring-[#14513F] rounded"
                  />
                  <div>
                    <p className="font-bold text-sm text-[#27352F] capitalize">{meal.label}</p>
                    <p className="text-[11px] text-[#737B76] mt-0.5">{meal.time}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Step 3: Configure Each Selected Meal Type */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8ECE7] shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[#27352F] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#14513F] text-white text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>Configure Dishes & Chefs</span>
          </h2>

          {selectedMealTypes.map((mType) => {
            const config = configurations[mType];
            const currentChefFoods = chefFoodsMap[config.chefId] || [];

            return (
              <div
                key={mType}
                className="p-5 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#14513F] text-white text-xs font-bold uppercase tracking-wider">
                    {mType}
                  </span>
                  <span className="text-xs text-[#737B76]">Meal Configuration</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Chef */}
                  <div>
                    <label className="block text-xs font-bold text-[#27352F] mb-1">
                      Select Home Chef
                    </label>
                    <select
                      required
                      value={config.chefId}
                      onChange={(e) => handleChefChange(mType, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-white text-xs font-semibold text-[#27352F] focus:outline-none focus:border-[#14513F]"
                    >
                      <option value="">-- Choose Home Kitchen --</option>
                      {chefs.map((c) => (
                        <option key={c._id} value={c.userId?._id || c.userId || c._id}>
                          {c.kitchenName} ({c.ownerName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Dish */}
                  <div>
                    <label className="block text-xs font-bold text-[#27352F] mb-1">
                      Select Daily Dish
                    </label>
                    <select
                      required
                      disabled={!config.chefId}
                      value={config.foodId}
                      onChange={(e) =>
                        setConfigurations((prev) => ({
                          ...prev,
                          [mType]: { ...prev[mType], foodId: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-white text-xs font-semibold text-[#27352F] focus:outline-none focus:border-[#14513F] disabled:opacity-50"
                    >
                      <option value="">
                        {config.chefId ? '-- Select Dish --' : 'Select a chef first'}
                      </option>
                      {currentChefFoods.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name} - {formatCurrency(f.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <label className="block text-xs font-bold text-[#27352F] mb-1">
                      Delivery Option
                    </label>
                    <select
                      value={config.deliveryType}
                      onChange={(e) =>
                        setConfigurations((prev) => ({
                          ...prev,
                          [mType]: { ...prev[mType], deliveryType: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-white text-xs font-semibold text-[#27352F] focus:outline-none focus:border-[#14513F]"
                    >
                      <option value="chef_delivery">Home Delivery</option>
                      <option value="customer_pickup">Kitchen Pickup</option>
                    </select>
                  </div>

                  {/* Delivery Address (if Delivery) */}
                  {config.deliveryType === 'chef_delivery' && (
                    <div>
                      <label className="block text-xs font-bold text-[#27352F] mb-1">
                        Delivery Address
                      </label>
                      <select
                        required
                        value={config.deliveryAddressId}
                        onChange={(e) =>
                          setConfigurations((prev) => ({
                            ...prev,
                            [mType]: { ...prev[mType], deliveryAddressId: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-white text-xs font-semibold text-[#27352F] focus:outline-none focus:border-[#14513F]"
                      >
                        <option value="">-- Choose Address --</option>
                        {addresses.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.fullName} - {a.addressLine}, {a.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Cost Summary & Confirmation */}
        <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-7 border border-[#F6A23A]/40 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#737B76]">
                Subscription Summary
              </p>
              <h3 className="text-lg font-black text-[#14513F]">
                {durationDays} Days • {selectedMealTypes.join(' + ')}
              </h3>
              <p className="text-xs text-[#737B76] mt-0.5">
                Estimated Daily: {formatCurrency(dailyEstimated)}/day
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#737B76] block">Total Estimated Cost</span>
              <span className="text-2xl font-black text-[#14513F]">
                {formatCurrency(estimatedTotalCost)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E8ECE7] text-xs text-[#737B76] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#F6A23A] shrink-0 mt-0.5" />
            <span>
              <strong>Flexible Meal Skip Policy:</strong> You can skip any upcoming scheduled meal or day directly from your subscription dashboard before 8:00 PM IST on the evening before delivery!
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting || dailyEstimated <= 0}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#14513F] text-white font-black text-sm hover:bg-[#0E3B2E] transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-[#F6A23A]" />
            <span>{submitting ? 'Creating Meal Plan...' : 'Confirm & Schedule Subscription'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubscriptionPage;
