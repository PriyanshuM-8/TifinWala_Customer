import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ArrowLeft,
  X,
  Home,
  Briefcase
} from 'lucide-react';
import { addressService } from '../../services/addressService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLocation } from '../../context/LocationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export const AddressesPage = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { location, refreshAddresses } = useLocation();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressType: 'home',
    addressLine: '',
    landmark: '',
    city: location.city || 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: location.pincode || '226001',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await addressService.getAddresses();
      if (res.success && res.addresses) {
        setAddresses(res.addresses);
      }
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      addressType: 'home',
      addressLine: '',
      landmark: '',
      city: location.city || 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: location.pincode || '226001',
      isDefault: addresses.length === 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr._id);
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressType: addr.addressType || 'home',
      addressLine: addr.addressLine,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        ...(location.lat && location.lng && {
          coordinates: [location.lng, location.lat],
        }),
      };

      if (editingId) {
        const res = await addressService.updateAddress(editingId, payload);
        if (res.success) {
          success('Address updated successfully.');
          setModalOpen(false);
          fetchAddresses();
          refreshAddresses();
        }
      } else {
        const res = await addressService.createAddress(payload);
        if (res.success) {
          success('Address saved successfully.');
          setModalOpen(false);
          fetchAddresses();
          refreshAddresses();
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await addressService.setDefaultAddress(id);
      if (res.success) {
        success('Default delivery address updated.');
        fetchAddresses();
        refreshAddresses();
      }
    } catch (err) {
      showError('Could not set default address.');
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this delivery address?');
    if (!confirm) return;

    try {
      const res = await addressService.deleteAddress(id);
      if (res.success) {
        success('Address deleted.');
        setAddresses((prev) => prev.filter((a) => a._id !== id));
        refreshAddresses();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Could not delete address.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <Link
        to="/profile"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#14513F] hover:text-[#0E3B2E] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Account</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8ECE7] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] tracking-tight">
            Delivery Addresses
          </h1>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Manage your saved home, office, and campus locations
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#14513F] text-white text-xs sm:text-sm font-bold hover:bg-[#0E3B2E] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#F6A23A]" />
          <span>Add New Address</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading addresses..." />
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border flex flex-col justify-between transition-all ${
                addr.isDefault
                  ? 'border-[#14513F] shadow-sm ring-1 ring-[#14513F]/20'
                  : 'border-[#E8ECE7] shadow-xs'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#27352F]">{addr.fullName}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F7F8F5] border border-[#E8ECE7] text-[10px] uppercase font-bold text-[#14513F]">
                      {addr.addressType}
                    </span>
                  </div>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Default</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#737B76]">{addr.phone}</p>
                <p className="text-xs text-[#27352F] leading-relaxed pt-1">
                  {addr.addressLine}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                </p>
              </div>

              {/* Actions footer */}
              <div className="pt-4 mt-4 border-t border-[#E8ECE7] flex items-center justify-between text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="font-bold text-[#14513F] hover:underline"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] text-[#737B76] italic">Primary address</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="p-1.5 rounded-lg text-[#737B76] hover:text-[#14513F] hover:bg-[#F7F8F5] transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="p-1.5 rounded-lg text-[#737B76] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No Delivery Addresses"
          description="Add your first delivery address so home chefs can bring fresh meals right to your doorstep."
          actionText="Add Delivery Address"
          onAction={openAddModal}
        />
      )}

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#E8ECE7] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE7]">
              <h3 className="text-base font-bold text-[#27352F]">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-[#737B76]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
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
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                      onClick={() => setForm({ ...form, addressType: type })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                        form.addressType === type
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
                  Street Address
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.addressLine}
                  onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                  placeholder="Flat / House No., Building Name, Street"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={(e) => setForm({ ...form, landmark: e.target.value })}
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
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
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
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
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
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECE7] bg-[#F7F8F5] text-xs text-[#27352F]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="rounded text-[#14513F] focus:ring-[#14513F]"
                />
                <span className="text-xs text-[#27352F] font-semibold">
                  Make this my default delivery address
                </span>
              </label>

              <button
                type="submit"
                className="w-full mt-3 py-2.5 rounded-xl bg-[#14513F] text-white text-xs font-bold hover:bg-[#0E3B2E] transition-colors"
              >
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
