import React, { useState, useEffect } from 'react';
import {
  Gift,
  Award,
  Sparkles,
  Ticket,
  Clock,
  CheckCircle2,
  Bell,
  ArrowRight,
  TrendingUp,
  History
} from 'lucide-react';
import { loyaltyService } from '../../services/loyaltyService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const RewardsPage = () => {
  const { success, error: showError } = useToast();

  const [balanceData, setBalanceData] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('coupons'); // 'coupons' | 'history' | 'notifications'
  const [loading, setLoading] = useState(true);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const [balRes, coupRes, txRes, notifRes] = await Promise.all([
        loyaltyService.getBalance(),
        loyaltyService.getCoupons(),
        loyaltyService.getTransactions(),
        loyaltyService.getNotifications(),
      ]);

      if (balRes.success && balRes.data) setBalanceData(balRes.data);
      if (coupRes.success && coupRes.coupons) setCoupons(coupRes.coupons);
      if (txRes.success && txRes.transactions) setTransactions(txRes.transactions);
      if (notifRes.success && notifRes.notifications) setNotifications(notifRes.notifications);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const handleMarkAllNotifsRead = async () => {
    try {
      const res = await loyaltyService.markAllNotificationsRead();
      if (res.success) {
        success('All notifications marked as read.');
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch {
      showError('Failed to mark notifications.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading your reward points and coupons..." />;

  const points = balanceData?.pointsBalance || 0;
  const tier = balanceData?.tier || 'Bronze Foodie';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] tracking-tight">
          Rewards & Loyalty Wallet
        </h1>
        <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
          Earn points on every bite and redeem complimentary homemade meals
        </p>
      </div>

      {/* Points & Tier Hero Card */}
      <div className="bg-gradient-to-r from-[#14513F] to-[#0E3B2E] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6A23A] text-[#14513F] text-xs font-black uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>{tier}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#FFFDF8] tracking-tight">
            {points} <span className="text-lg font-bold text-[#F6A23A]">Reward Points</span>
          </h2>

          <p className="text-xs text-white/80 max-w-sm">
            Earn 1 point for every ₹100 spent on meals. Points automatically unlock complimentary homemade dish coupons!
          </p>
        </div>

        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-white/20 pt-4 sm:pt-0 sm:pl-6 z-10">
          <div>
            <span className="text-xs text-white/70 block">Active Coupons</span>
            <span className="text-2xl font-black text-[#F6A23A]">
              {coupons.filter((c) => c.status === 'active').length}
            </span>
          </div>
          <div>
            <span className="text-xs text-white/70 block">Total Earned</span>
            <span className="text-2xl font-black text-white">
              {balanceData?.totalEarned || points} pts
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#F6A23A]/10 blur-2xl" />
      </div>

      {/* Tabs Switcher: Coupons | History | Notifications */}
      <div className="flex items-center gap-2 border-b border-[#E8ECE7]">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'coupons'
              ? 'border-[#14513F] text-[#14513F]'
              : 'border-transparent text-[#737B76] hover:text-[#27352F]'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>My Coupons ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-[#14513F] text-[#14513F]'
              : 'border-transparent text-[#737B76] hover:text-[#27352F]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Points Ledger ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'notifications'
              ? 'border-[#14513F] text-[#14513F]'
              : 'border-transparent text-[#737B76] hover:text-[#27352F]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications ({notifications.filter((n) => !n.isRead).length})</span>
        </button>
      </div>

      {/* Tab 1: Reward Coupons */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="bg-white rounded-2xl p-5 border border-[#E8ECE7] shadow-xs flex items-start gap-4 relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] border border-[#F6A23A]/40 flex items-center justify-center text-[#F6A23A] shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-[#F7F8F5] text-[#14513F]">
                        {coupon.couponCode}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {coupon.status}
                      </span>
                    </div>

                    <p className="font-bold text-sm text-[#27352F]">
                      {coupon.mealAllowance || 1} Free Homemade Meal
                    </p>

                    <p className="text-xs text-[#737B76]">
                      Valid until {formatDate(coupon.validUntil)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E8ECE7]">
              <Gift className="w-8 h-8 text-[#737B76] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#27352F]">No reward coupons yet.</p>
              <p className="text-xs text-[#737B76] mt-1">
                Keep ordering authentic meals to earn points and unlock free reward coupons!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Points History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E8ECE7] shadow-xs space-y-3">
          {transactions.length > 0 ? (
            <div className="divide-y divide-[#E8ECE7]">
              {transactions.map((tx) => (
                <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#27352F]">{tx.description || 'Loyalty Transaction'}</p>
                    <p className="text-[#737B76]">{formatDate(tx.createdAt)}</p>
                  </div>
                  <span
                    className={`font-black text-sm ${
                      tx.type === 'credit' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'credit' ? `+${tx.points}` : `-${tx.points}`} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#737B76] text-center py-6">No points history recorded yet.</p>
          )}
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleMarkAllNotifsRead}
              className="text-xs font-bold text-[#14513F] hover:underline"
            >
              Mark all as read
            </button>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 rounded-2xl border transition-colors ${
                    notif.isRead
                      ? 'bg-white border-[#E8ECE7]'
                      : 'bg-[#FFFDF8] border-[#F6A23A]/40'
                  }`}
                >
                  <p className="text-xs font-bold text-[#27352F]">{notif.title}</p>
                  <p className="text-xs text-[#737B76] mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-[#737B76] mt-2 block">
                    {formatDate(notif.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E8ECE7]">
              <Bell className="w-8 h-8 text-[#737B76] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#27352F]">No notifications.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
