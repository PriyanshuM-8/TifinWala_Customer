import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  Truck,
  Star,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import { useToast } from '../../context/ToastContext';
import { ORDER_STATUS_CONFIG, DEFAULT_IMAGES } from '../../utils/constants';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import VegBadge from '../../components/food/VegBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import socketService from '../../services/socket';

export const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Complaint Modal State
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState('food_quality');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getOrderById(orderId);
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError('Order not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();

    // Socket.IO live order status synchronization
    socketService.connect();
    socketService.joinOrder(orderId);

    const unsubscribe = socketService.onOrderStatusUpdated((data) => {
      if (data.orderId === orderId || (order && data.orderNumber === order.orderNumber)) {
        info(data.title || data.message || `Order status updated to ${data.status}`);
        fetchOrderDetails();
      }
    });

    return () => {
      socketService.leaveOrder(orderId);
      unsubscribe();
    };
  }, [orderId]);

  // Cancel Order Handler
  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this order? Stock will be restored and payment refunded if applicable.'
    );
    if (!confirmCancel) return;

    try {
      const res = await orderService.cancelOrder(orderId, 'Cancelled by customer');
      if (res.success) {
        success('Order cancelled successfully.');
        fetchOrderDetails();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Could not cancel order.');
    }
  };

  // Submit Review Handler
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      const res = await reviewService.createReview({
        orderId,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      if (res.success) {
        success('Thank you! Your review has been submitted.');
        setReviewModalOpen(false);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Submit Complaint Handler
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      setSubmittingComplaint(true);
      const res = await reviewService.createComplaint({
        orderId,
        category: complaintCategory,
        subject: complaintSubject.trim(),
        description: complaintDescription.trim(),
      });
      if (res.success) {
        success('Complaint registered. Support team will investigate shortly.');
        setComplaintModalOpen(false);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to register complaint.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading order details..." />;
  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <ErrorState
          title="Order Not Found"
          message={error || 'Could not retrieve this order.'}
          onRetry={() => navigate('/orders')}
        />
      </div>
    );
  }

  const statusConfig =
    ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.pending_confirmation;
  const canCancel = ['pending_confirmation', 'accepted'].includes(order.orderStatus);
  const isDelivered = order.orderStatus === 'delivered';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#14513F] hover:text-[#0E3B2E] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Orders</span>
      </button>

      {/* Header Info Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECE7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-xl sm:text-2xl font-black text-[#14513F]">
              Order #{order.orderNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs text-[#737B76] mt-1">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
            >
              Cancel Order
            </button>
          )}

          {isDelivered && (
            <button
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F6A23A] text-[#14513F] font-bold text-xs hover:bg-[#E08F2A] transition-colors shadow-xs"
            >
              <Star className="w-3.5 h-3.5 fill-[#14513F]" />
              <span>Rate & Review</span>
            </button>
          )}

          <button
            onClick={() => setComplaintModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-[#E8ECE7] text-[#737B76] hover:text-rose-600 hover:bg-[#F7F8F5] text-xs font-semibold transition-colors"
          >
            Need Help?
          </button>
        </div>
      </div>

      {/* Real-time Order Progress Stepper */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECE7] shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#737B76] mb-4">
          Live Order Status (Real-time Synchronized)
        </h3>

        {['cancelled', 'rejected'].includes(order.orderStatus) ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">
                Order {order.orderStatus === 'rejected' ? 'Declined by Kitchen' : 'Cancelled'}
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                {order.cancellationReason || order.rejectionReason || 'This order could not be fulfilled.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { key: 'pending_confirmation', label: '1. Placed' },
              { key: 'accepted', label: '2. Confirmed' },
              { key: 'preparing', label: '3. Cooking' },
              {
                key: order.deliveryType === 'takeaway' ? 'ready_for_pickup' : 'out_for_delivery',
                label: order.deliveryType === 'takeaway' ? '4. Ready' : '4. On the Way',
              },
              { key: 'delivered', label: '5. Delivered' },
            ].map((step, idx) => {
              const stepOrder = [
                'pending_confirmation',
                'accepted',
                'preparing',
                order.deliveryType === 'takeaway' ? 'ready_for_pickup' : 'out_for_delivery',
                'delivered',
              ];
              const currentIdx = stepOrder.indexOf(order.orderStatus);
              const isCompleted = currentIdx > idx;
              const isCurrent = currentIdx === idx;

              return (
                <div
                  key={step.key}
                  className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-[#14513F]/10 border-[#14513F] text-[#14513F] font-bold shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 font-medium'
                      : 'bg-[#F7F8F5] border-[#E8ECE7] text-[#737B76] opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      isCurrent
                        ? 'bg-[#14513F] text-white animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-[#E8ECE7] text-[#737B76]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-xs leading-tight">{step.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dishes Snapshot */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8ECE7] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#27352F] pb-3 border-b border-[#E8ECE7]">
              Prepared Dishes ({order.items?.length || 0})
            </h2>

            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl bg-[#F7F8F5] overflow-hidden shrink-0 border border-[#E8ECE7]">
                    <img
                      src={item.foodImage || DEFAULT_IMAGES.foodPlaceholder}
                      alt={item.foodName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_IMAGES.foodPlaceholder;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <VegBadge foodType={item.foodType} size="sm" />
                      <h4 className="font-bold text-sm text-[#27352F] truncate">
                        {item.foodName}
                      </h4>
                    </div>
                    <p className="text-xs text-[#737B76] mt-0.5">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-[#14513F] shrink-0">
                    {formatCurrency(item.itemTotal || item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery or Pickup Details */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8ECE7] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#27352F] flex items-center gap-2 pb-2 border-b border-[#E8ECE7]">
              {order.deliveryType === 'chef_delivery' ? (
                <>
                  <Truck className="w-4 h-4 text-[#14513F]" />
                  <span>Delivery Address</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 text-[#F6A23A]" />
                  <span>Kitchen Pickup Details</span>
                </>
              )}
            </h3>

            {order.deliveryType === 'chef_delivery' && order.deliveryAddressSnapshot ? (
              <div className="text-xs text-[#27352F] space-y-1">
                <p className="font-bold text-sm">{order.deliveryAddressSnapshot.fullName}</p>
                <p className="text-[#737B76]">{order.deliveryAddressSnapshot.phone}</p>
                <p className="leading-snug">
                  {order.deliveryAddressSnapshot.addressLine}, {order.deliveryAddressSnapshot.landmark ? `${order.deliveryAddressSnapshot.landmark}, ` : ''}{order.deliveryAddressSnapshot.city}, {order.deliveryAddressSnapshot.state} - {order.deliveryAddressSnapshot.pincode}
                </p>
              </div>
            ) : order.pickupInformation ? (
              <div className="text-xs text-[#27352F] space-y-1">
                <p className="font-bold text-sm">{order.pickupInformation.kitchenName}</p>
                <p className="text-[#737B76]">{order.pickupInformation.kitchenAddress || order.pickupInformation.city}</p>
                <p className="text-[#737B76] italic mt-1">{order.pickupInformation.pickupInstructions}</p>
              </div>
            ) : (
              <p className="text-xs text-[#737B76]">Standard Delivery</p>
            )}
          </div>
        </div>

        {/* Right Column: Authoritative Bill Breakdown */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8ECE7] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#27352F] pb-3 border-b border-[#E8ECE7]">
              Payment & Bill
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#737B76]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#27352F]">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#737B76]">
                <span>Delivery Fee</span>
                <span className="font-semibold text-emerald-700">FREE</span>
              </div>

              {order.onlineDiscountPaise > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span>Online Discount (Platform Subsidy)</span>
                  <span>- ₹{(order.onlineDiscountPaise / 100).toFixed(2)}</span>
                </div>
              )}

              {order.codFeePaise > 0 && (
                <div className="flex items-center justify-between text-amber-900 font-semibold">
                  <span>COD Handling Fee</span>
                  <span>+ ₹{(order.codFeePaise / 100).toFixed(2)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#E8ECE7] flex items-center justify-between text-base">
                <span className="font-black text-[#27352F]">Total Paid / Due</span>
                <span className="text-lg font-black text-[#14513F]">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>

              <div className="pt-2 border-t border-[#E8ECE7] flex items-center justify-between text-xs">
                <span className="text-[#737B76]">Payment Mode</span>
                <span className="font-bold uppercase text-[#27352F]">
                  {order.paymentMethod === 'online' ? 'Online (Prepaid)' : 'Cash on Delivery'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#737B76]">Payment Status</span>
                <span
                  className={`font-bold capitalize ${
                    order.paymentStatus === 'paid' || order.paymentStatus === 'completed'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E8ECE7] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE7]">
              <h3 className="text-base font-bold text-[#27352F]">Rate Homemade Meal</h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1 rounded-full text-[#737B76]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#737B76] uppercase mb-2 text-center">
                  Your Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-[#F6A23A] transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'fill-[#F6A23A] text-[#F6A23A]'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Authentic Ghar Ka Swad!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                  Review / Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about the taste, packaging, and home warmth..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 rounded-xl bg-[#14513F] text-white font-bold text-xs hover:bg-[#0E3B2E] transition-colors shadow-sm disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {complaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E8ECE7] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE7]">
              <h3 className="text-base font-bold text-[#27352F]">Register a Complaint</h3>
              <button
                onClick={() => setComplaintModalOpen(false)}
                className="p-1 rounded-full text-[#737B76]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                  Issue Category
                </label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                >
                  <option value="food_quality">Food Quality / Taste Issue</option>
                  <option value="delivery_delay">Delivery Delay</option>
                  <option value="wrong_item">Missing or Wrong Dish</option>
                  <option value="packaging">Packaging Issue</option>
                  <option value="other">Other Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summary of the issue"
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Please describe what happened in detail..."
                  value={complaintDescription}
                  onChange={(e) => setComplaintDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingComplaint}
                className="w-full py-3 rounded-xl bg-rose-700 text-white font-bold text-xs hover:bg-rose-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {submittingComplaint ? 'Submitting Ticket...' : 'Submit Complaint'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
