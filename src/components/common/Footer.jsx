import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, ShieldCheck, Clock, Award, Phone, Mail, MapPin } from 'lucide-react';
import { BRAND } from '../../utils/constants';

export const Footer = () => {
  const { pathname } = useLocation();

  // Show full footer only on Home or informational pages
  const allowedPaths = ['/', '/about', '/contact'];
  const showFullFooter = allowedPaths.includes(pathname);

  if (!showFullFooter) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-[#E8ECE7] pt-12 pb-24 md:pb-12 text-[#27352F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#14513F] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                <span className="text-[#F6A23A]">G</span>K
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#14513F]">
                GharKa<span className="text-[#F6A23A]">Swad</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-[#737B76] leading-relaxed max-w-sm">
              Ghar ka khana, apno jaisa sukoon. Connecting food lovers with verified home chefs
              preparing nutritious, preservative-free homemade meals with love.
            </p>

            <div className="mt-6 flex items-center gap-4 text-xs text-[#737B76]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#14513F]" />
                <span>Verified Kitchens</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F6A23A]" />
                <span>Cooked Fresh</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#14513F]" />
                <span>100% Homemade</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#14513F] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-[#737B76]">
              <li>
                <Link to="/explore" className="hover:text-[#14513F] transition-colors">
                  Explore Dishes
                </Link>
              </li>
              <li>
                <Link to="/explore?tab=chefs" className="hover:text-[#14513F] transition-colors">
                  Nearby HomeChefs
                </Link>
              </li>
              <li>
                <Link to="/subscriptions" className="hover:text-[#14513F] transition-colors">
                  Daily Meal Subscriptions
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="hover:text-[#14513F] transition-colors">
                  Loyalty Points & Rewards
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#14513F] mb-4">
              Account & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-[#737B76]">
              <li>
                <Link to="/orders" className="hover:text-[#14513F] transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#14513F] transition-colors">
                  Manage Profile
                </Link>
              </li>
              <li>
                <Link to="/addresses" className="hover:text-[#14513F] transition-colors">
                  Delivery Addresses
                </Link>
              </li>
              <li>
                <Link to="/profile?tab=complaints" className="hover:text-[#14513F] transition-colors">
                  Help & Complaints
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#14513F] mb-4">
              Reach Out
            </h4>
            <ul className="space-y-2.5 text-sm text-[#737B76]">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F6A23A] shrink-0 mt-0.5" />
                <span>Hazratganj, Lucknow, Uttar Pradesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F6A23A] shrink-0" />
                <span>support@gharkaswad.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F6A23A] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 pt-6 border-t border-[#E8ECE7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737B76]">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for authentic homemade food.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
