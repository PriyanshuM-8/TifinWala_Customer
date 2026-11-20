import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = UtensilsCrossed,
  title = 'No items found',
  description = 'There are currently no items matching your criteria.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#E8ECE7] shadow-sm max-w-md mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] flex items-center justify-center mb-4 text-[#14513F]">
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <h3 className="text-lg font-bold text-[#27352F]">{title}</h3>
      <p className="mt-1.5 text-sm text-[#737B76] leading-relaxed max-w-sm">
        {description}
      </p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#14513F] text-white text-sm font-semibold shadow-sm hover:bg-[#0E3B2E] transition-colors"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#14513F] text-white text-sm font-semibold shadow-sm hover:bg-[#0E3B2E] transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
