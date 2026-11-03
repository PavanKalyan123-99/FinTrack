import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-borderColor rounded-2xl bg-white/50 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-softCloud/30 text-royalBlue flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 stroke-[1.75]" />
        </div>
      )}
      <h4 className="text-base font-semibold text-primaryText mb-1">{title}</h4>
      {description && (
        <p className="text-sm text-secondaryText max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
