import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  containerClassName = '',
  id,
  type = 'text',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`w-full bg-white border text-sm rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300'} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <span className="text-xs text-rose-500">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-400">{helperText}</span>
      ) : null}
    </div>
  );
};

export default Input;
