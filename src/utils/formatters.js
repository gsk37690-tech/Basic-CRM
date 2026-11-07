/**
 * Utility functions for formatting and data manipulation in CRM
 */

// Format numbers as USD currency
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date strings into human-readable format
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Format date and time
export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

// Return badge color classes based on quality
export const getQualityBadgeClass = (quality) => {
  switch (quality) {
    case 'Hot':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Warm':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Cold':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// Return badge color classes based on lead status
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Converted':
      return 'bg-emerald-100 text-emerald-800 font-semibold';
    case 'Qualified':
      return 'bg-blue-100 text-blue-800';
    case 'Proposal':
      return 'bg-purple-100 text-purple-800';
    case 'Contacted':
      return 'bg-amber-100 text-amber-800';
    case 'Lost':
      return 'bg-rose-100 text-rose-800';
    case 'New':
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

// Validate standard email format
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
