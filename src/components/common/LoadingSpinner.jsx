import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading fresh homemade goodness...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      <div
        className={`rounded-full animate-spin border-[#14513F] border-t-transparent ${
          sizeClasses[size] || sizeClasses.md
        }`}
      />
      {text && (
        <p className="mt-3 text-sm font-medium text-[#737B76]">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
