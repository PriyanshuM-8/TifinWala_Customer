import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Clock,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Utensils
} from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { SUBSCRIPTION_STATUS_CONFIG } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        setLoading(true);
        const res = await subscriptionService.getSubscriptions();
        if (res.success && res.data) {
          setSubscriptions(res.data);
        }
      } catch {
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubs();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8ECE7] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] tracking-tight">
            Meal Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Flexible home-cooked daily meal plans with easy skip options
          </p>
        </div>

        <Link
          to="/subscriptions/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#14513F] text-white text-xs sm:text-sm font-bold hover:bg-[#0E3B2E] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#F6A23A]" />
          <span>New Subscription</span>
        </Link>
      </div>

      {/* Subscriptions List */}
      {loading ? (
        <LoadingSpinner text="Loading your meal subscriptions..." />
      ) : subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const statusConfig =
              SUBSCRIPTION_STATUS_CONFIG[sub.subscriptionStatus] ||
              SUBSCRIPTION_STATUS_CONFIG.active;

            return (
              <div
                key={sub._id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8ECE7] shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-[#14513F]">
                      #{sub.subscriptionNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#737B76]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#F6A23A]" />
                      <span>
                        {formatDate(sub.startDateKey)} to {formatDate(sub.endDateKey)}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="font-semibold text-[#27352F]">
                      {sub.durationDays} Days Duration
                    </span>
                  </div>

                  {/* Configured Meals */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sub.mealTypes?.map((type) => (
                      <span
                        key={type}
                        className="px-2.5 py-0.5 rounded-lg bg-[#F7F8F5] border border-[#E8ECE7] text-[11px] font-bold text-[#14513F] capitalize"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Daily cost & Link */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8ECE7]">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#737B76] block sm:text-right">
                      Daily Cost
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#14513F]">
                      {formatCurrency(sub.dailyCost || sub.estimatedTotalCost / sub.durationDays || 0)}/day
                    </span>
                  </div>

                  <Link
                    to={`/subscriptions/${sub._id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#F7F8F5] hover:bg-[#14513F] text-[#14513F] hover:text-white text-xs font-bold transition-colors border border-[#E8ECE7]"
                  >
                    <span>Manage Meals</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Active Subscriptions"
          description="Enjoy fresh homemade meals every day without the cooking hassle! Customize your breakfast, lunch, or dinner plan with any duration."
          actionText="Create Custom Subscription"
          actionLink="/subscriptions/create"
        />
      )}
    </div>
  );
};

export default SubscriptionsPage;
