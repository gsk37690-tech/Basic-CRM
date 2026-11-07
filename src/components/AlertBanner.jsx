import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useCrm } from '../context/CrmContext.jsx';

export const AlertBanner = () => {
  const { alert, setAlert } = useCrm();

  if (!alert) return null;

  const isSuccess = alert.type === 'success';

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl transition-all text-xs max-w-md ${
        isSuccess
          ? 'bg-[#0f1d16] border-[#1d3d2c] text-emerald-300'
          : 'bg-[#241117] border-[#4d1d29] text-[#ff758f]'
      }`}
      role="alert"
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-[#f43f5e] shrink-0" />
      )}
      <div className="flex-1 font-medium">{alert.message}</div>
      <button
        onClick={() => setAlert(null)}
        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
        aria-label="Dismiss alert"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
