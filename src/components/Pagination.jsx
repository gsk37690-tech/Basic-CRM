import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
}) => {
  const startItem = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#12151e] border-t border-[#1f2432] text-xs text-zinc-400 sm:px-6">
      <div>
        Showing <strong className="font-semibold text-zinc-200 tabular-nums">{startItem}</strong> to{' '}
        <strong className="font-semibold text-zinc-200 tabular-nums">{endItem}</strong> of{' '}
        <strong className="font-semibold text-zinc-200 tabular-nums">{totalRecords}</strong> entries
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-[#272d3d] bg-[#161a25] rounded hover:bg-[#202534] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-zinc-300"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="px-2 py-1 font-medium text-zinc-400">
          Page <span className="tabular-nums font-semibold text-zinc-200">{currentPage}</span> of{' '}
          <span className="tabular-nums font-semibold text-zinc-200">{totalPages || 1}</span>
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-[#272d3d] bg-[#161a25] rounded hover:bg-[#202534] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-zinc-300"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
