import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Package,
  Calendar,
  Gift,
  MapPin,
  Heart,
  MessageSquare,
  AlertTriangle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const accountLinks = [
    {
      title: 'My Orders',
      subtitle: 'Active preparations & order history',
      icon: Package,
      path: '/orders',
      color: 'text-[#14513F] bg-[#14513F]/10',
    },
    {
      title: 'Meal Subscriptions',
      subtitle: 'Daily meal plans & calendar skips',
      icon: Calendar,
      path: '/subscriptions',
      color: 'text-[#14513F] bg-[#14513F]/10',
    },
    {
      title: 'Delivery Addresses',
      subtitle: 'Manage home, office & delivery points',
      icon: MapPin,
      path: '/addresses',
      color: 'text-[#F6A23A] bg-orange-100',
    },
    {
      title: 'Rewards & Wallet',
      subtitle: 'Loyalty points & complimentary coupons',
      icon: Gift,
      path: '/rewards',
      color: 'text-[#F6A23A] bg-orange-100',
    },
    {
      title: 'Favorite Meals',
      subtitle: 'Your saved homemade dishes',
      icon: Heart,
      path: '/wishlist',
      color: 'text-rose-600 bg-rose-50',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14513F] tracking-tight">
          Customer Account
        </h1>
        <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
          Manage your personal profile, addresses & food preferences
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8ECE7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#14513F] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-sm shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#27352F]">
                {user?.name || 'Customer'}
              </h2>
              {user?.emailVerified && (
                <span title="Verified Customer">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#737B76]">
              <Mail className="w-3.5 h-3.5 text-[#F6A23A]" />
              <span>{user?.email}</span>
            </div>

            {user?.phone && (
              <div className="flex items-center gap-1.5 text-xs text-[#737B76]">
                <Phone className="w-3.5 h-3.5 text-[#14513F]" />
                <span>{user.phone}</span>
              </div>
            )}

            <p className="text-[11px] text-[#737B76] pt-1">
              Member since {formatDate(user?.createdAt || new Date())}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Navigation Quick Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accountLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.path}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8ECE7] shadow-xs hover:shadow-md transition-shadow flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[#27352F] group-hover:text-[#14513F] transition-colors truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#737B76] truncate">{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737B76] group-hover:translate-x-1 transition-transform" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProfilePage;
