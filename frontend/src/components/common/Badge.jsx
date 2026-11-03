import React from 'react';

const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variants = {
    income: 'bg-emerald-50 text-incomeGreen border border-emerald-200/60 font-semibold',
    expense: 'bg-rose-50 text-expenseRed border border-rose-200/60 font-semibold',
    success: 'bg-emerald-50 text-incomeGreen border border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
    danger: 'bg-rose-50 text-expenseRed border border-rose-200 font-semibold',
    info: 'bg-sky-50 text-skyFocus border border-sky-200 font-medium',
    royal: 'bg-royalBlue/10 text-royalBlue border border-royalBlue/20 font-semibold',
    neutral: 'bg-slate-100 text-secondaryText border border-borderColor font-medium',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 rounded-md',
    sm: 'text-xs px-2.5 py-1 rounded-lg',
    md: 'text-sm px-3 py-1.5 rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-colors select-none ${
        variants[variant] || variants.neutral
      } ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
