import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import {
  Contact as ContactIcon,
  Search,
  Plus,
  Mail,
  Building,
  UserCheck,
  Trash2,
} from 'lucide-react';

export const ContactsPage = () => {
  const { contacts, createContact, deleteContact, teamUsers } = useCrm();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newContact, setNewContact] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    position: 'Decision Maker',
    assignedTo: user?.id || 'usr_exec',
    notes: '',
  });

  const filteredContacts = contacts.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const validateForm = () => {
    const errors = {};
    if (!newContact.name.trim()) errors.name = 'Contact name is required';
    if (!newContact.company.trim()) errors.company = 'Company name is required';
    if (!newContact.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email.trim())) {
      errors.email = 'Please provide a valid email format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await createContact(newContact);
    setIsSubmitting(false);

    setIsAddOpen(false);
    setFormErrors({});
    setNewContact({
      name: '',
      company: '',
      email: '',
      phone: '',
      position: 'Decision Maker',
      assignedTo: user?.id || 'usr_exec',
      notes: '',
    });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete contact "${name}"?`)) {
      await deleteContact(id);
    }
  };

  const canDelete = user?.role === 'Admin' || user?.role === 'Sales Manager';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1f2432] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Customer Contacts Directory</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Verified client directory containing converted leads and established business accounts.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          icon={Plus}
          variant="primary"
          size="md"
        >
          Add Contact
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#12151e] border border-[#1f2432] rounded-lg p-3 shadow-sm max-w-md">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by contact name, company, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0e1017] border border-[#232838] rounded text-xs text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-[#12151e] border border-[#1f2432] rounded-lg shadow-sm overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 space-y-2">
            <ContactIcon className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-xs font-medium text-zinc-300">No contacts found</p>
            <p className="text-2xs text-zinc-500">
              Convert a qualified lead or click "Add Contact" to populate this directory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1017] border-b border-[#1f2432] text-zinc-400 font-semibold uppercase tracking-wider text-2xs">
                <tr>
                  <th className="py-3 px-4">Name & Title</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Assigned Rep</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c26]">
                {filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-[#161a25] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-100">{contact.name}</div>
                      <div className="text-2xs text-zinc-400">{contact.position || 'Client'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                        <Building className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{contact.company}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{contact.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      {contact.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#ff4b6e]" />
                        <span>{contact.assignedToName || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-2xs max-w-xs truncate">
                      {contact.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(contact.id, contact.name)}
                          className="p-1.5 text-zinc-400 hover:text-[#ff4b6e] hover:bg-[#f43f5e]/10 rounded transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD CONTACT MODAL (Reusable Modal Component) */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Customer Contact"
        subtitle="Manually create a new verified client entry in the CRM directory."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Jim Halpert"
              value={newContact.name}
              onChange={e => {
                setNewContact({ ...newContact, name: e.target.value });
                if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
              }}
              className={`w-full p-2.5 bg-[#0e1017] border rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors ${
                formErrors.name ? 'border-[#f43f5e] bg-[#241117]' : 'border-[#232838]'
              }`}
            />
            {formErrors.name && (
              <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Company *</label>
            <input
              type="text"
              placeholder="e.g. Athlead"
              value={newContact.company}
              onChange={e => {
                setNewContact({ ...newContact, company: e.target.value });
                if (formErrors.company) setFormErrors(prev => ({ ...prev, company: '' }));
              }}
              className={`w-full p-2.5 bg-[#0e1017] border rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors ${
                formErrors.company ? 'border-[#f43f5e] bg-[#241117]' : 'border-[#232838]'
              }`}
            />
            {formErrors.company && (
              <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{formErrors.company}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Email *</label>
              <input
                type="email"
                placeholder="jim@athlead.com"
                value={newContact.email}
                onChange={e => {
                  setNewContact({ ...newContact, email: e.target.value });
                  if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`w-full p-2.5 bg-[#0e1017] border rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors ${
                  formErrors.email ? 'border-[#f43f5e] bg-[#241117]' : 'border-[#232838]'
                }`}
              />
              {formErrors.email && (
                <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+1 555-0182"
                value={newContact.phone}
                onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full p-2.5 bg-[#0e1017] border border-[#232838] rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Job Title / Position</label>
            <input
              type="text"
              placeholder="e.g. Vice President of Marketing"
              value={newContact.position}
              onChange={e => setNewContact({ ...newContact, position: e.target.value })}
              className="w-full p-2.5 bg-[#0e1017] border border-[#232838] rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Assigned Account Rep</label>
            <select
              value={newContact.assignedTo}
              onChange={e => setNewContact({ ...newContact, assignedTo: e.target.value })}
              className="w-full p-2.5 bg-[#0e1017] border border-[#232838] rounded text-zinc-100 text-xs focus:border-[#f43f5e] focus:outline-none transition-colors"
            >
              {teamUsers.map(u => (
                <option key={u.id} value={u.id} className="bg-[#12151e] text-zinc-100">
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Key relationship details..."
              value={newContact.notes}
              onChange={e => setNewContact({ ...newContact, notes: e.target.value })}
              className="w-full p-2.5 bg-[#0e1017] border border-[#232838] rounded text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2432]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
