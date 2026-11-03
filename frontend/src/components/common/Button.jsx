import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary:
      'bg-royalBlue text-white hover:bg-[#0c3c5d] focus:ring-royalBlue/40 shadow-sm',
    secondary:
      'bg-skyFocus text-white hover:bg-[#286b97] focus:ring-skyFocus/40 shadow-sm',
    outline:
      'border border-borderColor bg-white text-primaryText hover:bg-slate-50 focus:ring-slate-300',
    ghost:
      'text-secondaryText hover:text-primaryText hover:bg-slate-100/80 focus:ring-slate-200',
    danger:
      'bg-expenseRed text-white hover:bg-red-700 focus:ring-red-400 shadow-sm',
    softCloud:
      'bg-softCloud/30 text-royalBlue hover:bg-softCloud/50 focus:ring-royalBlue/30 font-semibold',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2.5 gap-2 font-medium',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
