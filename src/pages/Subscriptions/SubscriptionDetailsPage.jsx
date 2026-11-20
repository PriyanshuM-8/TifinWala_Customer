import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  SkipForward,
  Utensils,
  ChefHat,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { useToast } from '../../context/ToastContext';
import { SUBSCRIPTION_STATUS_CONFIG } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export const SubscriptionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();

  const [subscription, setSubscription] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Skip Modal State
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [targetMeal, setTargetMeal] = useState(null);
  const [skipReason, setSkipReason] = useState('Travelling / Unavailable');
  const [skipping, setSkipping] = useState(false);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subRes, mealsRes] = await Promise.all([
        subscriptionService.getSubscriptionById(id),
        subscriptionService.getSubscriptionMeals(id),
      ]);

      if (subRes.success && subRes.data) {
        setSubscription(subRes.data);
      } else {
        setError('Subscription not found.');
      }

      if (mealsRes.success && mealsRes.meals) {
        setMeals(mealsRes.meals);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscription details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [id]);

  // Skip Meal Execution
  const handleConfirmSkip = async () => {
    if (!targetMeal) return;

    try {
      setSkipping(true);
      const res = await subscriptionService.skipMeal(targetMeal._id, skipReason);
      if (res.success) {
        success('Meal skipped successfully! Reserved stock restored.');
        setSkipModalOpen(false);
        fetchSubscriptionData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Could not skip meal. Cutoff may have elapsed (8:00 PM IST cutoff).');
    } finally {
      setSkipping(false);
    }
  };

  // Cancel Subscription Execution
  const handleCancelSubscription = async () => {
    const confirm = window.confirm(
      'Are you sure you want to cancel this subscription? Remaining future scheduled meals will be cancelled.'
    );
    if (!confirm) return;

    try {
      const res = await subscriptionService.cancelSubscription(id, 'Customer requested cancellation');
      if (res.success) {
        success('Subscription cancelled successfully.');
        fetchSubscriptionData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Could not cancel subscription.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading subscription meals..." />;
  if (error || !subscription) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <ErrorState
          title="Subscription Not Found"
          message={error || 'Could not retrieve subscription details.'}
          onRetry={() => navigate('/subscriptions')}
        />
      </div>
    );
  }

  const statusConfig =
    SUBSCRIPTION_STATUS_CONFIG[subscription.subscriptionStatus] ||
    SUBSCRIPTION_STATUS_CONFIG.active;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Back button */}
      <Link
        to="/subscriptions"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#14513F] hover:text-[#0E3B2E] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Subscriptions</span>
      </Link>

      {/* Subscription Contract Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8ECE7] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-xl sm:text-2xl font-black text-[#14513F]">
                Subscription #{subscription.subscriptionNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-[#737B76]">
              {subscription.durationDays} Days Plan • Started on {formatDate(subscription.startDateKey)}
            </p>
          </div>

          {subscription.subscriptionStatus === 'active' && (
            <button
              onClick={handleCancelSubscription}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors self-start sm:self-auto"
            >
              Cancel Subscription
            </button>
          )}
        </div>

        {/* Meal Cutoff Info Pill */}
        <div className="p-3 rounded-2xl bg-[#FFFDF8] border border-[#F6A23A]/40 text-xs text-[#27352F] flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-[#F6A23A] shrink-0 mt-0.5" />
          <span>
            <strong>Meal Skip Cutoff:</strong> You can skip scheduled meals without charge before <strong>8:00 PM IST</strong> on the evening preceding delivery day.
          </span>
        </div>
      </div>

      {/* Daily Scheduled Meals Calendar / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#14513F]">
            Scheduled Meals ({meals.length})
          </h2>
          <span className="text-xs text-[#737B76]">
            Sorted chronologically
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.map((meal) => {
            const isSkipped = meal.isSkipped || meal.orderStatus === 'skipped';
            const isDelivered = meal.orderStatus === 'delivered';
            const canSkip = ['scheduled', 'accepted'].includes(meal.orderStatus) && !isSkipped;

            return (
              <div
                key={meal._id}
                className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                  isSkipped
                    ? 'bg-[#F7F8F5] border-gray-200 opacity-60'
                    : 'bg-white border-[#E8ECE7] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#14513F] block">
                      {meal.deliveryDateKey} • {formatDate(meal.deliveryDateKey)}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#14513F]/10 text-[#14513F] mt-1 inline-block">
                      {meal.mealType}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isSkipped
                        ? 'bg-gray-200 text-gray-700'
                        : isDelivered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isSkipped ? 'Skipped' : meal.orderStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 py-2 border-t border-[#E8ECE7]">
                  <Utensils className="w-4 h-4 text-[#F6A23A] shrink-0" />
                  <span className="font-bold text-sm text-[#27352F] truncate">
                    {meal.foodItem?.foodName || 'Meal Dish'}
                  </span>
                  <span className="text-xs text-[#737B76]">
                    × {meal.foodItem?.quantity || 1}
                  </span>
                </div>

                {/* Skip Action */}
                {canSkip && (
                  <div className="pt-2 border-t border-[#E8ECE7] flex justify-end">
                    <button
                      onClick={() => {
                        setTargetMeal(meal);
                        setSkipModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#F6A23A] text-[#14513F] hover:bg-[#F6A23A]/10 text-xs font-bold transition-colors"
                    >
                      <SkipForward className="w-3.5 h-3.5 text-[#F6A23A]" />
                      <span>Skip Meal</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Skip Meal Modal */}
      {skipModalOpen && targetMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E8ECE7] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE7]">
              <h3 className="text-base font-bold text-[#27352F]">Skip Scheduled Meal</h3>
              <button
                onClick={() => setSkipModalOpen(false)}
                className="p-1 rounded-full text-[#737B76]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#737B76] leading-relaxed">
              Are you sure you want to skip <strong>{targetMeal.foodItem?.foodName}</strong> for{' '}
              <strong>{targetMeal.deliveryDateKey} ({targetMeal.mealType})</strong>?
            </p>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              Note: Meal skips must be requested before 8:00 PM IST on the evening preceding delivery day.
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                Reason for Skipping
              </label>
              <select
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
              >
                <option value="Travelling / Unavailable">Travelling / Out of Town</option>
                <option value="Dining Out">Eating with friends / Dining out</option>
                <option value="Fasting">Fasting / Religious observance</option>
                <option value="Other">Other Personal Reason</option>
              </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSkipModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8ECE7] text-xs font-semibold text-[#27352F]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={skipping}
                onClick={handleConfirmSkip}
                className="flex-1 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition-colors disabled:opacity-50"
              >
                {skipping ? 'Skipping...' : 'Confirm Skip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetailsPage;
