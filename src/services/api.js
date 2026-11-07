/**
 * Centralized REST API Service Client
 * Provides modular HTTP methods for Auth, Leads, Deals, Contacts, FollowUps, Activities, and Users
 */

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`.replace(/\/+$/, '');

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!text) {
    throw new Error(`API returned an empty response (HTTP ${response.status})`);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`API returned non-JSON data (HTTP ${response.status}). Check VITE_API_URL.`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`API returned invalid JSON (HTTP ${response.status})`);
  }
}

// Helper to retrieve token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('crm_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generic fetch wrapper with error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const apiService = {
  // Auth API
  auth: {
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    me: () => request('/auth/me'),
  },

  // Leads API
  leads: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/leads${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/leads/${id}`),
    create: (data) =>
      request('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/leads/${id}`, {
        method: 'DELETE',
      }),
    convert: (id, payload) =>
      request(`/leads/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Deals API
  deals: {
    getAll: (stage = 'All') => request(`/deals${stage !== 'All' ? `?stage=${stage}` : ''}`),
    create: (data) =>
      request('/deals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/deals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/deals/${id}`, {
        method: 'DELETE',
      }),
  },

  // Contacts API
  contacts: {
    getAll: (search = '') => request(`/contacts${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    create: (data) =>
      request('/contacts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/contacts/${id}`, {
        method: 'DELETE',
      }),
  },

  // Follow-Ups API
  followUps: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/followups${query ? `?${query}` : ''}`);
    },
    create: (data) =>
      request('/followups', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/followups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/followups/${id}`, {
        method: 'DELETE',
      }),
  },

  // Activities API
  activities: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/activities${query ? `?${query}` : ''}`);
    },
    create: (data) =>
      request('/activities', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Users & Team API
  users: {
    getAll: () => request('/users'),
    updateRole: (id, role) =>
      request(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
  },

  // Dashboard API
  dashboard: {
    getStats: () => request('/dashboard/stats'),
    resetDemoData: () => request('/dashboard/reset-demo', { method: 'POST' }),
  },
};
