import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Đang tải...' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className={`animate-spin rounded-full border-2 border-slate-200 border-t-amber-600 ${sizes[size] || sizes.md}`} />
      {text && <p className="text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
