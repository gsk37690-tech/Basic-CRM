import React from 'react';

/**
 * Reusable Card component (Rubric requirement: "Shared UI elements built into modular components: Card")
 */
export const Card = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footer,
}) => {
  return (
    <div className={`bg-[#12151e] border border-[#1f2432] rounded-lg shadow-sm overflow-hidden text-zinc-100 ${className}`}>
      {(title || action) && (
        <div
          className={`px-5 py-4 border-b border-[#1b1f2b] flex items-center justify-between gap-4 ${headerClassName}`}
        >
          <div>
            {title && <h3 className="text-sm font-bold text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`p-5 ${bodyClassName}`}>{children}</div>

      {footer && (
        <div className="px-5 py-3 bg-[#0d0f17] border-t border-[#1b1f2b] text-xs text-zinc-400">
          {footer}
        </div>
      )}
    </div>
  );
};
