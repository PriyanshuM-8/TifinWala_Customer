import React from 'react';

export const VegBadge = ({ foodType = 'veg', size = 'md' }) => {
  const isVeg = foodType?.toLowerCase() === 'veg';

  const sizeClasses = {
    sm: 'w-3.5 h-3.5 p-0.5',
    md: 'w-4 h-4 p-0.5',
    lg: 'w-5 h-5 p-1',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded border ${
        isVeg
          ? 'border-emerald-600 bg-emerald-50/50'
          : 'border-rose-600 bg-rose-50/50'
      } ${sizeClasses[size] || sizeClasses.md}`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <span
        className={`rounded-full ${
          isVeg ? 'bg-emerald-600' : 'bg-rose-600'
        } ${dotSizeClasses[size] || dotSizeClasses.md}`}
      />
    </span>
  );
};

export default VegBadge;
