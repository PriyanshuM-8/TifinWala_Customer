import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, ShoppingBag, Package, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const BottomNav = () => {
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : null,
    },
    { label: 'Orders', path: isAuthenticated ? '/orders' : '/login', icon: Package },
    { label: 'Account', path: isAuthenticated ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8ECE7] shadow-lg md:hidden pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-semibold transition-colors relative ${
                  isActive
                    ? 'text-[#14513F]'
                    : 'text-[#737B76] hover:text-[#27352F]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-[#14513F]' : 'stroke-2'}`} />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#F6A23A] text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#14513F]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
