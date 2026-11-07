import React from 'react';

/**
 * Reusable Badge component for roles, lead qualities, and deal stages
 */
export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variantStyles = {
    default: 'bg-[#181c26] text-zinc-300 border-[#272d3d]',
    primary: 'bg-[#f43f5e]/15 text-[#ff4b6e] border-[#f43f5e]/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-[#f43f5e]/20 text-[#ff4b6e] border-[#f43f5e]/40',
    purple: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  };

  const sizeStyles = {
    xs: 'text-3xs px-1.5 py-0.2',
    sm: 'text-2xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded border ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
};
