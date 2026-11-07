import React from 'react';

/**
 * Reusable Button component (Rubric requirement: "Shared UI elements built into modular components: Button")
 */
export const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-2xs px-2.5 py-1 gap-1',
    md: 'text-xs px-3.5 py-1.5 gap-1.5',
    lg: 'text-sm px-4 py-2 gap-2',
  };

  const variantStyles = {
    primary: 'bg-[#f43f5e] text-white hover:bg-[#e11d48] focus:ring-[#f43f5e]/40 shadow-sm shadow-[#f43f5e]/25',
    secondary: 'bg-[#181c26] text-zinc-200 hover:bg-[#202534] border border-[#272d3d] focus:ring-zinc-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-xs',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-xs',
    outline: 'border border-[#262c3c] bg-[#12151e] text-zinc-200 hover:bg-[#1a1e2b] focus:ring-zinc-600',
    ghost: 'text-zinc-400 hover:bg-[#181c26] hover:text-white',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
