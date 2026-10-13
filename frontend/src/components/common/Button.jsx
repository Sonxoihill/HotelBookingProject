import React from 'react';

const VARIANTS = {
  primary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm active:scale-[0.98]',
  secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm active:scale-[0.98]',
  outline: 'border border-slate-300 hover:bg-slate-100 text-slate-700 active:scale-[0.98]',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]',
  ghost: 'hover:bg-slate-100 text-slate-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-[0.98]',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-md font-medium',
  md: 'px-4 py-2 text-sm rounded-lg font-medium',
  lg: 'px-6 py-3 text-base rounded-xl font-semibold',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
