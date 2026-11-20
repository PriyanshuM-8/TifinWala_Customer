import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  LogOut,
  Package,
  Calendar,
  Gift,
  Menu,
  X,
  MapPinned,
  Bell,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLocation } from '../../context/LocationContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import notificationService from '../../services/notificationService';
import socketService from '../../services/socket';

export const Navbar = ({ onOpenLocationModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { location, openLocationModal } = useLocation();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getNotifications({ limit: 6 });
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let ignore = false;
    const fetchInitial = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await notificationService.getNotifications({ limit: 6 });
        if (!ignore && res.success) {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        }
      } catch {
        // ignore
      }
    };
    fetchInitial();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  // Live Socket update for new notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = socketService.onOrderStatusUpdated(() => {
      loadNotifications();
    });
    return unsub;
  }, [isAuthenticated, loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif._id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      setNotificationsOpen(false);
      if (notif.metadata?.orderId) {
        navigate(`/orders/${notif.metadata.orderId}`);
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore Food', path: '/explore' },
    { label: 'HomeChefs', path: '/explore?tab=chefs' },
    { label: 'Subscriptions', path: '/subscriptions' },
    { label: 'Rewards', path: '/rewards' },
  ];

  const handleOpenLocation = () => {
    if (onOpenLocationModal) {
      onOpenLocationModal();
    } else {
      openLocationModal();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8ECE7] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Brand Logo & Location Pill */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#14513F] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-[#0E3B2E] transition-colors">
                <span className="text-[#F6A23A]">G</span>K
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#14513F] leading-tight">
                  GharKa<span className="text-[#F6A23A]">Swad</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-medium text-[#737B76] tracking-wider uppercase">
                  Homemade Food
                </span>
              </div>
            </Link>

            {/* Location Selector Pill */}
            <button
              onClick={handleOpenLocation}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#F7F8F5] hover:bg-[#E8ECE7]/70 border border-[#E8ECE7] transition-colors max-w-[150px] sm:max-w-[220px] text-left group"
              title="Change Delivery Location"
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F6A23A] shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737B76] leading-none">
                  Delivering to
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#27352F] truncate">
                  {location.city || 'Select City'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#737B76] shrink-0 ml-0.5" />
            </button>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-1 ">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-2.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-[#14513F] bg-[#14513F]/5'
                      : 'text-[#27352F] hover:text-[#14513F] hover:bg-[#F7F8F5]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Actions (Search, Notifications, Wishlist, Cart, Profile) */}
          <div className="flex items-center">
            {/* Quick Explore / Search Icon */}
            <Link
              to="/explore"
              className="p-2 sm:p-2.5 rounded-xl text-[#27352F] hover:text-[#14513F] hover:bg-[#F7F8F5] transition-colors relative"
              aria-label="Search Homemade Food"
              title="Search dishes & chefs"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Notification Bell (Authenticated) */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  className="p-2 sm:p-2.5 rounded-xl text-[#27352F] hover:text-[#14513F] hover:bg-[#F7F8F5] transition-colors relative"
                  aria-label="Order updates & notifications"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E8ECE7] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8ECE7] px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#27352F]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-[#14513F] hover:underline inline-flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[#E8ECE7]/60 py-1">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#737B76]">
                          No notifications yet. You will receive live order updates here.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                              !notif.isRead
                                ? 'bg-[#14513F]/5 hover:bg-[#14513F]/10'
                                : 'hover:bg-[#F7F8F5]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-[#27352F] leading-tight">
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#14513F] shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#737B76] mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-[#737B76]/80 mt-1 block">
                              {formatDateTime(notif.createdAt)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 sm:p-2.5 rounded-xl text-[#27352F] hover:text-[#14513F] hover:bg-[#F7F8F5] transition-colors relative"
              aria-label="Saved Meals"
              title="Favorite meals"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F6A23A] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="flex items-center gap-1 px-1 py-2 sm:px-1.5 sm:py-1.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white font-semibold text-sm transition-colors shadow-sm relative"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#F6A23A]" />
              <span className="hidden sm:inline font-bold">
                {cartCount > 0 ? formatCurrency(subtotal) : 'Cart'}
              </span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#F6A23A] text-[#14513F] text-xs font-extrabold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown / Login */}
            {isAuthenticated ? (
              <div className="relative px-2 " ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 rounded-xl bg-[#F7F8F5] hover:bg-[#E8ECE7] border border-[#E8ECE7] transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#14513F] text-white flex items-center justify-center font-bold text-1xl">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold text-[#27352F] max-w-[90px] truncate">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="hidden sm:inline w-3.5 h-3.5 text-[#737B76]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8ECE7] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2.5 border-b border-[#E8ECE7]">
                      <p className="text-xs font-semibold text-[#737B76]">Signed in as</p>
                      <p className="text-sm font-bold text-[#27352F] truncate">{user?.name}</p>
                      <p className="text-xs text-[#737B76] truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[#27352F] hover:bg-[#F7F8F5] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#14513F]" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[#27352F] hover:bg-[#F7F8F5] transition-colors"
                      >
                        <Package className="w-4 h-4 text-[#14513F]" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/subscriptions"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[#27352F] hover:bg-[#F7F8F5] transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-[#14513F]" />
                        <span>Meal Subscriptions</span>
                      </Link>
                      <Link
                        to="/rewards"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[#27352F] hover:bg-[#F7F8F5] transition-colors"
                      >
                        <Gift className="w-4 h-4 text-[#F6A23A]" />
                        <span>Reward Points & Wallet</span>
                      </Link>
                      <Link
                        to="/addresses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[#27352F] hover:bg-[#F7F8F5] transition-colors"
                      >
                        <MapPinned className="w-4 h-4 text-[#14513F]" />
                        <span>Delivery Addresses</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-[#E8ECE7]">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-1.5 py-2 sm:px-1 ml-2 sm:py-1.5 rounded-xl border border-[#14513F] text-[#14513F] hover:bg-[#14513F]/5 text-sm font-bold transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl text-[#27352F] hover:bg-[#F7F8F5] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8ECE7] bg-white px-4 py-4 space-y-1 shadow-lg animate-in fade-in duration-150">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-base font-semibold text-[#27352F] hover:bg-[#F7F8F5] hover:text-[#14513F] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="pt-3 border-t border-[#E8ECE7]">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#14513F] text-white font-bold text-sm shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Customer Sign In / Register</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
