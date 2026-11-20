import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ChefHat,
  ChevronRight
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import socketService from '../../services/socket';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 10,
          ...(statusFilter && { status: statusFilter }),
        };
        const res = await orderService.getOrders(params);
        if (res.success && res.data) {
          setOrders(res.data);
          setTotalPages(res.pagination?.totalPages || 1);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const unsub = socketService.onOrderStatusUpdated(() => {
      fetchOrders();
    });

    return () => {
      unsub();
    };
  }, [statusFilter, page]);

  const filterTabs = [
    { label: 'All Orders', value: '' },
    { label: 'Pending', value: 'pending_confirmation' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] tracking-tight">
          My Orders
        </h1>
        <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
          Track active kitchen preparations and view your homemade dining history
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[#E8ECE7]">
        {filterTabs.map((tab) => {
          const isSelected = statusFilter === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                isSelected
                  ? 'border-[#14513F] text-[#14513F]'
                  : 'border-transparent text-[#737B76] hover:text-[#27352F]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Fetching your orders..." />
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig =
              ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.pending_confirmation;
            const chefName = order.chefInfo?.kitchenName || 'Home Kitchen';
            const chefCity = order.chefInfo?.city || '';

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl p-5 border border-[#E8ECE7] shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-[#14513F]">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
                    >
                      {statusConfig.label}
                    </span>
                    <span className="text-[11px] text-[#737B76]">
                      • {formatDateTime(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#737B76]">
                    <ChefHat className="w-3.5 h-3.5 text-[#F6A23A] shrink-0" />
                    <span className="font-semibold text-[#27352F]">{chefName}</span>
                    {chefCity && <span>({chefCity})</span>}
                  </div>

                  {/* Items summary */}
                  <p className="text-xs text-[#27352F] line-clamp-1">
                    {order.items?.map((item) => `${item.foodName} × ${item.quantity}`).join(', ')}
                  </p>
                </div>

                {/* Right: Total & Action */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8ECE7]">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#737B76] block sm:text-right">
                      Total
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#14513F]">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#F7F8F5] hover:bg-[#14513F] text-[#14513F] hover:text-white text-xs font-bold transition-colors border border-[#E8ECE7]"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-6 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-[#E8ECE7] bg-white text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-[#737B76]">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-[#E8ECE7] bg-white text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No Orders Found"
          description={
            statusFilter
              ? `You don't have any orders with status '${statusFilter}'.`
              : "You haven't placed any orders yet. Discover fresh meals from our talented home chefs!"
          }
          actionText="Explore Food"
          actionLink="/explore"
        />
      )}
    </div>
  );
};

export default OrdersPage;
