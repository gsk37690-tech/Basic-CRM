import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCrm } from '../context/CrmContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import { Badge } from '../components/Badge.jsx';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Building,
  Mail,
  Phone,
  UserCheck,
  X,
} from 'lucide-react';

export const LeadsPage = () => {
  const {
    leads,
    pagination,
    leadFilters,
    setLeadFilters,
    createLead,
    deleteLead,
    convertLead,
    teamUsers,
    isLoading,
  } = useCrm();

  const { user } = useAuth();

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'New',
    quality: 'Warm',
    assignedTo: user?.id || 'usr_exec',
    estimatedValue: 15000,
    notes: '',
  });

  // Client-side form validation error state
  const [formErrors, setFormErrors] = useState({});

  // Convert Modal State
  const [convertModalLead, setConvertModalLead] = useState(null);
  const [convertDealTitle, setConvertDealTitle] = useState('');
  const [convertCloseDate, setConvertCloseDate] = useState('');

  // Handle controlled filter inputs
  const handleSearchChange = (e) => {
    setLeadFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setLeadFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handleQualityFilter = (e) => {
    setLeadFilters((prev) => ({ ...prev, quality: e.target.value, page: 1 }));
  };

  const handleOwnerFilter = (e) => {
    setLeadFilters((prev) => ({ ...prev, assignedTo: e.target.value, page: 1 }));
  };

  const handleSortChange = (e) => {
    setLeadFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setLeadFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Form Validation & Submit with event.preventDefault()
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Contact name is required';
    if (!formData.company.trim()) errors.company = 'Company name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address format';
    }
    if (formData.estimatedValue < 0) errors.estimatedValue = 'Value cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const res = await createLead(formData);
    if (res.success) {
      setIsCreateOpen(false);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        source: 'Website',
        status: 'New',
        quality: 'Warm',
        assignedTo: user?.id || 'usr_exec',
        estimatedValue: 15000,
        notes: '',
      });
      setFormErrors({});
    }
  };

  // Handle Convert Lead Submit
  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    if (!convertModalLead) return;

    await convertLead(convertModalLead.id, convertDealTitle, convertCloseDate);
    setConvertModalLead(null);
  };

  const openConvertModal = (lead) => {
    setConvertModalLead({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      value: lead.estimatedValue,
    });
    setConvertDealTitle(`${lead.company} - Contract Opportunity`);
    setConvertCloseDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete lead "${name}"?`)) {
      await deleteLead(id);
    }
  };

  const canDelete = user?.role === 'Admin' || user?.role === 'Sales Manager';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1b1f2b] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Leads Management</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Capture prospective clients, assign owners, qualify pipeline opportunities, and convert leads.
          </p>
        </div>

        <Button
          onClick={() => {
            setFormData(prev => ({ ...prev, assignedTo: user?.id || 'usr_exec' }));
            setIsCreateOpen(true);
          }}
          icon={Plus}
          variant="primary"
          size="md"
        >
          Capture New Lead
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#12151e] border border-[#1f2432] rounded-lg p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search name, company, email..."
              value={leadFilters.search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-1.5 border border-[#232838] bg-[#0e1017] rounded text-xs text-zinc-100 placeholder:text-zinc-500 focus:ring-1 focus:ring-[#f43f5e] focus:border-[#f43f5e] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <select
              value={leadFilters.status}
              onChange={handleStatusFilter}
              className="w-full py-1.5 px-2 border border-[#232838] bg-[#0e1017] rounded text-xs text-zinc-200 focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Quality Filter */}
          <div>
            <select
              value={leadFilters.quality}
              onChange={handleQualityFilter}
              className="w-full py-1.5 px-2 border border-[#232838] bg-[#0e1017] rounded text-xs text-zinc-200 focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
            >
              <option value="All">All Qualities</option>
              <option value="Hot">Hot Quality</option>
              <option value="Warm">Warm Quality</option>
              <option value="Cold">Cold Quality</option>
            </select>
          </div>

          {/* Assigned Owner Filter */}
          <div>
            <select
              value={leadFilters.assignedTo}
              onChange={handleOwnerFilter}
              className="w-full py-1.5 px-2 border border-[#232838] bg-[#0e1017] rounded text-xs text-zinc-200 focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
            >
              <option value="All">All Owners</option>
              {teamUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <select
              value={leadFilters.sort}
              onChange={handleSortChange}
              className="w-full py-1.5 px-2 border border-[#232838] bg-[#0e1017] rounded text-xs text-zinc-200 focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="value_desc">Highest Value ($)</option>
              <option value="value_asc">Lowest Value ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-[#12151e] border border-[#1f2432] rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-[#f43f5e] border-t-transparent rounded-full mb-2"></div>
            <p className="text-xs">Loading leads from server...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-zinc-300 font-medium">No leads match your filter criteria</p>
            <p className="text-xs text-zinc-500">Try adjusting your search keywords or capture a new lead.</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f43f5e] text-white rounded text-xs font-medium hover:bg-[#e11d48]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture New Lead</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1017] border-b border-[#1f2432] text-zinc-400 font-semibold uppercase tracking-wider text-2xs">
                <tr>
                  <th className="py-3 px-4">Lead & Contact</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Quality & Status</th>
                  <th className="py-3 px-4">Est. Value</th>
                  <th className="py-3 px-4">Assigned Rep</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c28]">
                {leads.map(lead => {
                  let qualityBadge = 'bg-[#181c26] text-zinc-300 border-[#272d3d]';
                  if (lead.quality === 'Hot') qualityBadge = 'bg-[#f43f5e]/20 text-[#ff4b6e] border-[#f43f5e]/40';
                  if (lead.quality === 'Warm') qualityBadge = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                  if (lead.quality === 'Cold') qualityBadge = 'bg-[#181c26] text-zinc-400 border-[#272d3d]';

                  let statusBadge = 'bg-[#161a25] text-zinc-300 border border-[#24293a]';
                  if (lead.status === 'Converted') statusBadge = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold';
                  if (lead.status === 'Lost') statusBadge = 'bg-[#261319] text-[#ff6b87] border border-[#4d1f2b]';
                  if (lead.status === 'Qualified') statusBadge = 'bg-[#f43f5e]/15 text-[#ff4b6e] border border-[#f43f5e]/30';

                  return (
                    <tr key={lead.id} className="hover:bg-[#161a25] transition-colors">
                      {/* Name & Contacts */}
                      <td className="py-3 px-4">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="font-semibold text-[#ff4b6e] hover:underline flex items-center gap-1"
                        >
                          <span>{lead.name}</span>
                          <ExternalLink className="w-3 h-3 text-zinc-500" />
                        </Link>
                        <div className="flex flex-col gap-0.5 text-zinc-400 mt-1 text-2xs">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-zinc-500" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-zinc-500" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                          <Building className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span>{lead.company}</span>
                        </div>
                      </td>

                      {/* Quality & Status */}
                      <td className="py-3 px-4 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-2xs font-semibold border ${qualityBadge}`}>
                            {lead.quality}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-2xs font-medium ${statusBadge}`}>
                            {lead.status}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-3 px-4 tabular-nums font-semibold text-white">
                        ${lead.estimatedValue.toLocaleString()}
                      </td>

                      {/* Assigned Rep */}
                      <td className="py-3 px-4 text-zinc-300">
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{lead.assignedToName || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4 text-zinc-400">
                        {lead.source}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.status !== 'Converted' && (
                            <button
                              onClick={() => openConvertModal(lead)}
                              className="px-2 py-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded text-2xs font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1"
                              title="Convert to Contact & Deal"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Convert</span>
                            </button>
                          )}

                          <Link
                            to={`/leads/${lead.id}`}
                            className="px-2 py-1 bg-[#181c26] text-zinc-300 hover:bg-[#202535] hover:text-white rounded text-2xs font-medium transition-colors border border-[#272d3d]"
                          >
                            Details
                          </Link>

                          {canDelete && (
                            <button
                              onClick={() => handleDelete(lead.id, lead.name)}
                              className="p-1 text-zinc-500 hover:text-[#f43f5e] hover:bg-[#28131a] rounded transition-colors"
                              title="Delete Lead (Admin/Manager)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalRecords={pagination.total}
          pageSize={pagination.limit}
          onPageChange={handlePageChange}
        />
      </div>

      {/* CREATE LEAD MODAL (Reusable Modal Component) */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Capture New Inbound Lead"
        subtitle="Record a new sales opportunity with contact details and estimated value."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Contact Name <span className="text-[#f43f5e]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Michael Scott"
                className={`w-full p-2 border rounded bg-[#0e1017] text-zinc-100 placeholder:text-zinc-500 focus:ring-1 focus:ring-[#f43f5e] focus:border-[#f43f5e] focus:outline-none ${
                  formErrors.name ? 'border-[#f43f5e] bg-[#221016]' : 'border-[#232838]'
                }`}
              />
              {formErrors.name && <p className="text-[#ff4b6e] text-2xs mt-0.5">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Company Name <span className="text-[#f43f5e]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Dunder Mifflin"
                className={`w-full p-2 border rounded bg-[#0e1017] text-zinc-100 placeholder:text-zinc-500 focus:ring-1 focus:ring-[#f43f5e] focus:border-[#f43f5e] focus:outline-none ${
                  formErrors.company ? 'border-[#f43f5e] bg-[#221016]' : 'border-[#232838]'
                }`}
              />
              {formErrors.company && <p className="text-[#ff4b6e] text-2xs mt-0.5">{formErrors.company}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Email Address <span className="text-[#f43f5e]">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="mscott@company.com"
                className={`w-full p-2 border rounded bg-[#0e1017] text-zinc-100 placeholder:text-zinc-500 focus:ring-1 focus:ring-[#f43f5e] focus:border-[#f43f5e] focus:outline-none ${
                  formErrors.email ? 'border-[#f43f5e] bg-[#221016]' : 'border-[#232838]'
                }`}
              />
              {formErrors.email && <p className="text-[#ff4b6e] text-2xs mt-0.5">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2831"
                className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-100 placeholder:text-zinc-500 rounded focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Lead Quality</label>
              <select
                value={formData.quality}
                onChange={e => setFormData({ ...formData, quality: e.target.value })}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-200 rounded"
              >
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-200 rounded"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Inbound Channel</label>
              <select
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-200 rounded"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Social Media">Social Media</option>
                <option value="Event">Event</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Assign Owner (Staff)</label>
              <select
                value={formData.assignedTo}
                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-200 rounded"
              >
                {teamUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Estimated Value ($)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.estimatedValue}
                onChange={e => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-100 rounded focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Lead Notes & Requirements</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Budget details, project requirements, timing..."
              className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-100 placeholder:text-zinc-500 rounded focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2332]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Save Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONVERT LEAD MODAL (Reusable Modal Component) */}
      <Modal
        isOpen={Boolean(convertModalLead)}
        onClose={() => setConvertModalLead(null)}
        title="Convert Lead to Customer"
        subtitle="Converts this qualified lead into a permanent Contact and pipeline Deal."
        maxWidth="max-w-md"
      >
        {convertModalLead && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Converting <strong className="text-white">{convertModalLead.name}</strong> ({convertModalLead.company}) will automatically:
            </p>
            <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1 bg-[#0e1017] p-3 rounded border border-[#1f2434]">
              <li>Create a permanent record in the <strong className="text-zinc-200">Contacts Directory</strong></li>
              <li>Spawn an active deal in the <strong className="text-zinc-200">Deals Pipeline</strong></li>
              <li>Mark the lead status as <strong className="text-emerald-400">Converted</strong></li>
            </ul>

            <form onSubmit={handleConvertSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  value={convertDealTitle}
                  onChange={e => setConvertDealTitle(e.target.value)}
                  className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-100 rounded focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Expected Close Date</label>
                <input
                  type="date"
                  required
                  value={convertCloseDate}
                  onChange={e => setConvertCloseDate(e.target.value)}
                  className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-100 rounded focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2332]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConvertModalLead(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Confirm Conversion
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
