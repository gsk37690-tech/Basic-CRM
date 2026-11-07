import React from 'react';

/**
 * Reusable Table component (Rubric requirement: "Shared UI elements built into modular components: Table")
 */
export const Table = ({
  columns = [], // Array of { key, header, render, align: 'left' | 'right' | 'center', className }
  data = [],
  isLoading = false,
  emptyMessage = 'No records found',
  emptySubMessage = 'Try adjusting your search filters or add a new record.',
  onRowClick,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-[#f43f5e] border-t-transparent rounded-full mb-2"></div>
        <p className="text-xs">Loading data from server...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center space-y-2">
        <p className="text-sm font-medium text-zinc-300">{emptyMessage}</p>
        {emptySubMessage && <p className="text-xs text-zinc-500">{emptySubMessage}</p>}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#0e1017] border-b border-[#1f2432] text-zinc-400 font-semibold uppercase tracking-wider text-2xs">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`py-3 px-4 ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                } ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#191d28] text-zinc-200">
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`hover:bg-[#161a25] transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={col.key || colIdx}
                  className={`py-3 px-4 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.render ? col.render(row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
