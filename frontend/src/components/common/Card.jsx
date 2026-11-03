import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  hoverEffect = true,
  noPadding = false,
  headerClassName = '',
}) => {
  return (
    <div
      className={`bg-cardBg border border-borderColor rounded-2xl shadow-card transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-cardHover' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-borderColor/60 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="font-semibold text-primaryText text-base tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-secondaryText mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};

export default Card;
