import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';

const CrmContext = createContext(undefined);
const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`.replace(/\/+$/, '');

export const CrmProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  const [leads, setLeads] = useState([]);
  const [currentLead, setCurrentLead] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [leadFilters, setLeadFilters] = useState({
    search: '',
    status: 'All',
    quality: 'All',
    assignedTo: 'All',
    sort: 'newest',
    page: 1,
    limit: 10,
  });

  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const authHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  // 1. Leads
  const fetchLeads = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        search: leadFilters.search,
        status: leadFilters.status,
        quality: leadFilters.quality,
        assignedTo: leadFilters.assignedTo,
        sort: leadFilters.sort,
        page: leadFilters.page.toString(),
        limit: leadFilters.limit.toString(),
      });

      const res = await fetch(`${API_BASE}/leads?${query.toString()}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, leadFilters, authHeaders]);

  const fetchLeadById = async (id) => {
    if (!token) return null;
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/leads/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setCurrentLead(data.data);
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch lead:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createLead = async (leadData) => {
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(leadData),
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Lead created successfully!');
        fetchLeads();
        fetchDashboardStats();
        return { success: true, data: data.data };
      }
      showAlert('error', data.message || 'Failed to create lead');
      return { success: false, message: data.message };
    } catch (err) {
      showAlert('error', err.message || 'Network error');
      return { success: false, message: err.message };
    }
  };

  const updateLead = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Lead updated successfully!');
        fetchLeads();
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', data.message || 'Failed to update lead');
      return { success: false, message: data.message };
    } catch (err) {
      showAlert('error', err.message || 'Network error');
      return { success: false, message: err.message };
    }
  };

  const deleteLead = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Lead deleted successfully!');
        fetchLeads();
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', data.message || 'Failed to delete lead');
      return { success: false, message: data.message };
    } catch (err) {
      showAlert('error', err.message || 'Network error');
      return { success: false, message: err.message };
    }
  };

  const convertLead = async (id, dealTitle, expectedCloseDate) => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}/convert`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ dealTitle, expectedCloseDate }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Qualified lead converted to Contact & Deal successfully!');
        fetchLeads();
        fetchContacts();
        fetchDeals();
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', data.message || 'Failed to convert lead');
      return { success: false, message: data.message };
    } catch (err) {
      showAlert('error', err.message || 'Network error');
      return { success: false, message: err.message };
    }
  };

  // 2. Contacts
  const fetchContacts = useCallback(async (search) => {
    if (!token) return;
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${API_BASE}/contacts${query}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  }, [token, authHeaders]);

  const createContact = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        showAlert('success', 'Contact created successfully!');
        fetchContacts();
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', resData.message || 'Failed to create contact');
      return { success: false, message: resData.message };
    } catch (err) {
      showAlert('error', err.message);
      return { success: false, message: err.message };
    }
  };

  const updateContact = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
      const resData = await res.json();
      if (resData.success) {
        showAlert('success', 'Contact updated successfully!');
        fetchContacts();
        return { success: true };
      }
      showAlert('error', resData.message);
      return { success: false };
    } catch (err) {
      showAlert('error', err.message);
      return { success: false };
    }
  };

  const deleteContact = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const resData = await res.json();
      if (resData.success) {
        showAlert('success', 'Contact removed successfully');
        fetchContacts();
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', resData.message);
      return { success: false };
    } catch (err) {
      showAlert('error', err.message);
      return { success: false };
    }
  };

  // 3. Deals
  const fetchDeals = useCallback(async (stage) => {
    if (!token) return;
    try {
      const query = stage && stage !== 'All' ? `?stage=${encodeURIComponent(stage)}` : '';
      const res = await fetch(`${API_BASE}/deals${query}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setDeals(data.data);
      }
    } catch (err) {
      console.error('Failed to load deals:', err);
    }
  }, [token, authHeaders]);

  const createDeal = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        showAlert('success', 'Deal created in pipeline!');
        fetchDeals();
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', resData.message);
      return { success: false, message: resData.message };
    } catch (err) {
      showAlert('error', err.message);
      return { success: false, message: err.message };
    }
  };

  const updateDeal = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/deals/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
      const resData = await res.json();
      if (resData.success) {
        showAlert('success', 'Deal updated successfully!');
        fetchDeals();
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', resData.message);
      return { success: false };
    } catch (err) {
      showAlert('error', err.message);
      return { success: false };
    }
  };

  const deleteDeal = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/deals/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const resData = await res.json();
      if (resData.success) {
        showAlert('success', 'Deal removed successfully');
        fetchDeals();
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', resData.message);
      return { success: false };
    } catch (err) {
      showAlert('error', err.message);
      return { success: false };
    }
  };

  // 4. Follow-Ups
  const fetchFollowUps = useCallback(async (status) => {
    if (!token) return;
    try {
      const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
      const res = await fetch(`${API_BASE}/followups${query}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setFollowUps(data.data);
      }
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    }
  }, [token, authHeaders]);

  const createFollowUp = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/followups`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        showAlert('success', 'Follow-up scheduled successfully!');
        fetchFollowUps();
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', resData.message);
      return { success: false, message: resData.message };
    } catch (err) {
      showAlert('error', err.message);
      return { success: false, message: err.message };
    }
  };

  const updateFollowUp = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/followups/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
      const resData = await res.json();
      if (resData.success) {
        showAlert('success', 'Follow-up status updated');
        fetchFollowUps();
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', resData.message);
      return { success: false };
    } catch (err) {
      showAlert('error', err.message);
      return { success: false };
    }
  };

  const deleteFollowUp = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/followups/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const resData = await res.json();
      if (resData.success) {
        showAlert('success', 'Follow-up deleted');
        fetchFollowUps();
        fetchDashboardStats();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  };

  // 5. Activities
  const fetchActivities = useCallback(async (leadId, dealId) => {
    if (!token) return;
    try {
      const params = new URLSearchParams();
      if (leadId) params.append('leadId', leadId);
      if (dealId) params.append('dealId', dealId);
      const res = await fetch(`${API_BASE}/activities?${params.toString()}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  }, [token, authHeaders]);

  const createActivity = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        showAlert('success', 'Activity logged!');
        fetchActivities(data.leadId, data.dealId);
        fetchDashboardStats();
        return { success: true };
      }
      showAlert('error', resData.message);
      return { success: false, message: resData.message };
    } catch (err) {
      showAlert('error', err.message);
      return { success: false, message: err.message };
    }
  };

  // 6. Users & Dashboard
  const fetchTeamUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setTeamUsers(data.data);
      }
    } catch (err) {
      console.error('Failed to load team users:', err);
    }
  }, [token, authHeaders]);

  const fetchDashboardStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setDashboardStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  }, [token, authHeaders]);

  const resetDemoData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/dashboard/reset-demo`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Demo college database reset to default state');
        fetchLeads();
        fetchContacts();
        fetchDeals();
        fetchFollowUps();
        fetchActivities();
        fetchTeamUsers();
        fetchDashboardStats();
      }
    } catch (err) {
      showAlert('error', 'Failed to reset demo data');
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchLeads();
      fetchContacts();
      fetchDeals();
      fetchFollowUps();
      fetchActivities();
      fetchTeamUsers();
      fetchDashboardStats();
    }
  }, [isAuthenticated, token, fetchLeads, fetchContacts, fetchDeals, fetchFollowUps, fetchActivities, fetchTeamUsers, fetchDashboardStats]);

  return (
    <CrmContext.Provider
      value={{
        leads,
        currentLead,
        leadFilters,
        pagination,
        setLeadFilters,
        fetchLeads,
        fetchLeadById,
        createLead,
        updateLead,
        deleteLead,
        convertLead,

        contacts,
        fetchContacts,
        createContact,
        updateContact,
        deleteContact,

        deals,
        fetchDeals,
        createDeal,
        updateDeal,
        deleteDeal,

        followUps,
        fetchFollowUps,
        createFollowUp,
        updateFollowUp,
        deleteFollowUp,

        activities,
        fetchActivities,
        createActivity,

        teamUsers,
        fetchTeamUsers,
        dashboardStats,
        fetchDashboardStats,
        resetDemoData,

        isLoading,
        alert,
        setAlert,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
