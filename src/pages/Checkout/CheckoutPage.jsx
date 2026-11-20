import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Store,
  CreditCard,
  Banknote,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Tag,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLocation } from '../../context/LocationContext';
import { addressService } from '../../services/addressService';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, fetchCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const { success, error: showError, info } = useToast();
  const { location, refreshAddresses } = useLocation();

  // Delivery options: 'chef_delivery' | 'customer_pickup'
  const [deliveryType, setDeliveryType] = useState('chef_delivery');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Payment method: 'online' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [submitting, setSubmitting] = useState(false);

  // Address Modal State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressType: 'home',
    addressLine: '',
    landmark: '',
    city: location.city || 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: location.pincode || '226001',
    isDefault: true,
  });

  // Fetch addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const res = await addressService.getAddresses();
        if (res.success && res.addresses) {
          setAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  // Calculate frontend estimated totals (Authoritative validation is always done by backend!)
  const subtotal = cart.subtotal || 0;
  const deliveryFee = 0;
  const onlineDiscount = paymentMethod === 'online' ? Math.min(subtotal, 20) : 0;
  const codFee = paymentMethod === 'cod' ? 20 : 0;
  const estimatedTotal = Math.max(0, subtotal + deliveryFee - onlineDiscount + codFee);

  // Add Address Handler
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...addressForm,
        ...(location.lat && location.lng && {
          coordinates: [location.lng, location.lat],
        }),
      };
      const res = await addressService.createAddress(payload);
      if (res.success && res.address) {
        setAddresses((prev) => [res.address, ...prev]);
        setSelectedAddressId(res.address._id);
        setAddressModalOpen(false);
        refreshAddresses();
        success('Delivery address saved successfully!');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save address.');
    }
  };

  // Place Order Handler
  const handlePlaceOrder = async () => {
    if (deliveryType === 'chef_delivery' && !selectedAddressId) {
      showError('Please select or add a delivery address.');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      showError('Your cart is empty.');
      navigate('/explore');
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Create Order in backend
      const orderPayload = {
        deliveryType,
        paymentMethod,
        ...(deliveryType === 'chef_delivery' && { addressId: selectedAddressId }),
        clientRequestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };

      const orderRes = await orderService.createOrder(orderPayload);
      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'Failed to place order.');
      }

      const createdOrder = orderRes.order;

      // Step 2: Handle Payment
      if (paymentMethod === 'online') {
        info('Initiating secure payment gateway...');
        const paymentRes = await paymentService.createOrderPayment(createdOrder._id, 'online');

        if (!paymentRes.success) {
          throw new Error('Payment initiation failed.');
        }

        // Open Razorpay Checkout modal
        const options = {
          key: paymentRes.keyId,
          amount: paymentRes.payableAmountPaise,
          currency: paymentRes.currency || 'INR',
          name: 'GharKaSwad',
          description: `Homemade Meal Order #${createdOrder.orderNumber}`,
          order_id: paymentRes.razorpayOrderId,
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: '#14513F',
          },
          handler: async (response) => {
            try {
              info('Verifying payment signature with kitchen...');
              const verifyRes = await paymentService.verifyPayment({
                paymentId: paymentRes.paymentId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                await fetchCart();
                success('Payment confirmed! Your home chef has received the order.');
                navigate(`/orders/${createdOrder._id}`, { replace: true });
              }
            } catch (vErr) {
              showError(vErr.response?.data?.message || 'Payment verification failed. Please contact support.');
              navigate(`/orders/${createdOrder._id}`, { replace: true });
            }
          },
          modal: {
            ondismiss: () => {
              showError('Payment cancelled. You can complete payment from My Orders.');
              navigate(`/orders/${createdOrder._id}`, { replace: true });
            },
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // If script blocked or testing mode, redirect to order
          success('Order created successfully!');
          navigate(`/orders/${createdOrder._id}`, { replace: true });
        }
      } else {
        // COD Mode
        await fetchCart();
        success('Order placed successfully! Pay cash upon delicious delivery.');
        navigate(`/orders/${createdOrder._id}`, { replace: true });
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-base font-bold text-[#27352F]">Your cart is empty.</p>
        <Link
          to="/explore"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[#14513F] text-white text-sm font-bold"
        >
          Explore Food
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] tracking-tight">
          Checkout & Place Order
        </h1>
        <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
          Confirm your delivery preference, address & payment method
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery & Payment Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Delivery or Pickup */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8ECE7] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#27352F] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#14513F] text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Delivery Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeliveryType('chef_delivery')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'chef_delivery'
                    ? 'border-[#14513F] bg-[#14513F]/5 ring-2 ring-[#14513F]/20'
                    : 'border-[#E8ECE7] hover:bg-[#F7F8F5]'
                }`}
              >
                <Truck className="w-5 h-5 text-[#14513F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-[#27352F]">Home Delivery</p>
                  <p className="text-xs text-[#737B76] mt-0.5">
                    Prepared and delivered fresh to your doorstep
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('customer_pickup')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'customer_pickup'
                    ? 'border-[#14513F] bg-[#14513F]/5 ring-2 ring-[#14513F]/20'
                    : 'border-[#E8ECE7] hover:bg-[#F7F8F5]'
                }`}
              >
                <Store className="w-5 h-5 text-[#F6A23A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-[#27352F]">Direct Kitchen Pickup</p>
                  <p className="text-xs text-[#737B76] mt-0.5">
                    Collect directly from the home chef upon notification
                  </p>
                </div>
              </button>
            </div>

            {/* Address Selection (if Delivery) */}
            {deliveryType === 'chef_delivery' ? (
              <div className="pt-4 border-t border-[#E8ECE7] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#737B76]">
                    Delivery Address
                  </span>
                  <button
                    onClick={() => setAddressModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#14513F] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {loadingAddresses ? (
                  <p className="text-xs text-[#737B76]">Loading your saved addresses...</p>
                ) : addresses.length > 0 ? (
                  <div className="space-y-2">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr._id;
                      return (
                        <label
                          key={addr._id}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#14513F] bg-white ring-1 ring-[#14513F]'
                              : 'border-[#E8ECE7] bg-[#F7F8F5] hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressSelect"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr._id)}
                            className="mt-1 text-[#14513F] focus:ring-[#14513F]"
                          />
                          <div className="text-xs flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#27352F]">{addr.fullName}</span>
                              <span className="px-1.5 py-0.5 rounded bg-[#E8ECE7] text-[10px] uppercase font-bold text-[#27352F]">
                                {addr.addressType}
                              </span>
                            </div>
                            <p className="text-[#737B76] mt-0.5">{addr.phone}</p>
                            <p className="text-[#27352F] mt-1 leading-snug">
                              {addr.addressLine}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2 text-center">
                    <p>You have no saved addresses yet.</p>
                    <button
                      onClick={() => setAddressModalOpen(true)}
                      className="px-4 py-1.5 rounded-lg bg-[#14513F] text-white font-bold inline-block"
                    >
                      + Add Address Now
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Pickup instructions */
              <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#F6A23A]/40 text-xs text-[#27352F] space-y-1">
                <p className="font-bold text-[#14513F]">Kitchen Pickup Instructions</p>
                <p className="text-[#737B76]">
                  Kitchen Address: {cart.chef?.city || 'Home Kitchen'}
                </p>
                <p className="text-[#737B76]">
                  Full street address and chef contact will be confirmed once the dish is marked ready.
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8ECE7] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#27352F] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#14513F] text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Payment Option</span>
            </h2>

            <div className="space-y-3 pt-1">
              {/* Option 1: Online Payment (with discount) */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-[#14513F] bg-[#14513F]/5 ring-2 ring-[#14513F]/20'
                    : 'border-[#E8ECE7] hover:bg-[#F7F8F5]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="mt-1 text-[#14513F] focus:ring-[#14513F]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#14513F]" />
                      <span className="font-bold text-sm text-[#27352F]">
                        Online Payment (UPI, Cards, Netbanking)
                      </span>
                    </div>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Save ₹20
                    </span>
                  </div>
                  <p className="text-xs text-[#737B76] mt-1">
                    Instant, safe & contactless via Razorpay. Platform subsidizes flat ₹20!
                  </p>
                </div>
              </label>

              {/* Option 2: Cash on Delivery (with COD fee) */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#14513F] bg-[#14513F]/5 ring-2 ring-[#14513F]/20'
                    : 'border-[#E8ECE7] hover:bg-[#F7F8F5]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-[#14513F] focus:ring-[#14513F]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#F6A23A]" />
                      <span className="font-bold text-sm text-[#27352F]">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#737B76]">
                      +₹20 fee
                    </span>
                  </div>
                  <p className="text-xs text-[#737B76] mt-1">
                    Pay physical cash upon delivery. Incurs standard ₹20 logistics handling charge.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Authoritative Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E8ECE7] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#27352F] pb-3 border-b border-[#E8ECE7]">
              Order Summary
            </h2>

            {/* Dishes snippet */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div
                  key={item.foodId?._id || item.foodId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[#27352F] truncate max-w-[200px]">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-[#27352F]">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-[#E8ECE7] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#737B76]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#27352F]">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-[#737B76]">
                <span>Delivery Charge</span>
                <span className="font-semibold text-emerald-700">FREE</span>
              </div>

              {paymentMethod === 'online' && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#F6A23A]" />
                    <span>Online Discount (Platform Subsidy)</span>
                  </span>
                  <span>- {formatCurrency(onlineDiscount)}</span>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="flex items-center justify-between text-amber-900 font-semibold">
                  <span>COD Logistics Handling Fee</span>
                  <span>+ {formatCurrency(codFee)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#E8ECE7] flex items-center justify-between text-base">
                <span className="font-black text-[#27352F]">Total Payable</span>
                <span className="text-xl font-black text-[#14513F]">
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#14513F] text-white font-extrabold text-sm hover:bg-[#0E3B2E] transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-[#F6A23A]" />
              <span>{submitting ? 'Placing Order...' : `Place Order • ${formatCurrency(estimatedTotal)}`}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] flex items-center gap-3 text-xs text-[#737B76]">
            <ShieldCheck className="w-5 h-5 text-[#14513F] shrink-0" />
            <span>
              Transactions secured with 256-bit encryption. Freshly prepared under strict hygiene standards.
            </span>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#E8ECE7] max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE7]">
              <h3 className="text-base font-bold text-[#27352F]">Add New Delivery Address</h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1 rounded-full text-[#737B76] hover:bg-[#F7F8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                  Address Type
                </label>
                <div className="flex gap-2">
                  {['home', 'office', 'hostel', 'other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, addressType: type })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                        addressForm.addressType === type
                          ? 'bg-[#14513F] text-white'
                          : 'bg-[#F7F8F5] text-[#27352F] border border-[#E8ECE7]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                  Street Address / House / Flat
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  placeholder="e.g. Flat 402, Green Valley Apartments, Hazratganj"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-xl bg-[#14513F] text-white text-xs font-bold hover:bg-[#0E3B2E] transition-colors"
              >
                Save Delivery Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
