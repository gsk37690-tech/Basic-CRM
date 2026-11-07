import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import {
  CalendarCheck2,
  Clock,
  Plus,
  CheckCircle2,
  Building,
  UserCheck,
  Trash2,
  Phone,
  Video,
  Mail,
  Users,
} from 'lucide-react';

export const FollowUpsPage = () => {
  const { followUps, createFollowUp, updateFollowUp, deleteFollowUp, leads, teamUsers } = useCrm();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState('Pending');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newFup, setNewFup] = useState({
    leadId: leads[0]?.id || '',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '11:00',
    type: 'Call',
    notes: '',
    assignedTo: user?.id || 'usr_exec',
  });

  const filteredFollowUps = followUps.filter(f => {
    if (statusFilter === 'All') return true;
    return f.status === statusFilter;
  });

  const validateForm = () => {
    const errors = {};
    if (!newFup.leadId) errors.leadId = 'Please select a target lead';
    if (!newFup.scheduledDate) errors.scheduledDate = 'Scheduled date is required';
    if (!newFup.scheduledTime) errors.scheduledTime = 'Scheduled time is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await createFollowUp(newFup);
    setIsSubmitting(false);

    setIsScheduleOpen(false);
    setFormErrors({});
    setNewFup({
      leadId: leads[0]?.id || '',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduledTime: '11:00',
      type: 'Call',
      notes: '',
      assignedTo: user?.id || 'usr_exec',
    });
  };

  const handleMarkComplete = async (id) => {
    await updateFollowUp(id, { status: 'Completed' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this scheduled follow-up?')) {
      await deleteFollowUp(id);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-3.5 h-3.5 text-[#ff4b6e]" />;
      case 'Demo':
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-amber-400" />;
      case 'Meeting':
        return <Users className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1f2432] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Follow-Up Schedule & Reminders</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Never miss a customer touchpoint. Manage scheduled phone calls, product demos, and check-in meetings.
          </p>
        </div>

        <Button
          onClick={() => {
            if (leads.length > 0 && !newFup.leadId) {
              setNewFup(prev => ({ ...prev, leadId: leads[0].id }));
            }
            setIsScheduleOpen(true);
          }}
          icon={Plus}
          variant="primary"
          size="md"
        >
          Schedule Follow-Up
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2">
        {['Pending', 'Completed', 'All'].map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              statusFilter === tab
                ? 'bg-[#f43f5e] text-white shadow-sm shadow-[#f43f5e]/25 border border-[#f43f5e]'
                : 'bg-[#12151e] border border-[#1f2432] text-zinc-300 hover:bg-[#161a25] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Follow-Ups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFollowUps.length === 0 ? (
          <div className="col-span-full bg-[#12151e] border border-[#1f2432] rounded-lg p-12 text-center text-zinc-400 space-y-2">
            <CalendarCheck2 className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-xs font-medium text-zinc-300">No {statusFilter.toLowerCase()} follow-ups</p>
            <p className="text-2xs text-zinc-500">
              Schedule your next client interaction using the button above.
            </p>
          </div>
        ) : (
          filteredFollowUps.map(fup => (
            <div
              key={fup.id}
              className={`bg-[#12151e] border rounded-lg p-4 shadow-sm space-y-3 text-xs flex flex-col justify-between transition-colors ${
                fup.status === 'Completed'
                  ? 'border-[#1b1f2b] opacity-75'
                  : 'border-[#1f2432] hover:border-[#f43f5e]/40'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-100">
                    {getTypeIcon(fup.type)}
                    <span>{fup.type} Follow-Up</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                      fup.status === 'Completed'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'bg-[#f43f5e]/15 text-[#ff4b6e] border border-[#f43f5e]/30'
                    }`}
                  >
                    {fup.status}
                  </span>
                </div>

                <div className="bg-[#0e1017] border border-[#1f2432] p-2.5 rounded space-y-1">
                  <div className="font-semibold text-zinc-100">{fup.leadName || 'Lead'}</div>
                  {fup.company && (
                    <div className="flex items-center gap-1.5 text-zinc-400 text-2xs">
                      <Building className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span>{fup.company}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-xs">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    {fup.scheduledDate} at {fup.scheduledTime}
                  </span>
                </div>

                {fup.notes && (
                  <p className="text-zinc-400 bg-[#0e1017]/80 border border-[#1b1f2b] p-2 rounded text-2xs italic">
                    "{fup.notes}"
                  </p>
                )}
              </div>

              <div className="pt-2.5 border-t border-[#181c26] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-2xs text-zinc-400">
                  <UserCheck className="w-3 h-3 text-[#ff4b6e]" />
                  <span className="truncate max-w-[120px]">{fup.assignedToName || 'Unassigned'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {fup.status === 'Pending' && (
                    <button
                      onClick={() => handleMarkComplete(fup.id)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-2xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Complete</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(fup.id)}
                    className="p-1.5 text-zinc-400 hover:text-[#ff4b6e] hover:bg-[#f43f5e]/10 rounded transition-colors"
                    title="Delete Follow-Up"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SCHEDULE FOLLOW-UP MODAL (Reusable Modal Component) */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Client Follow-Up"
        subtitle="Schedule a timely touchpoint with a prospective customer or client."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Target Lead *</label>
            <select
              value={newFup.leadId}
              onChange={e => {
                setNewFup({ ...newFup, leadId: e.target.value });
                if (formErrors.leadId) setFormErrors(prev => ({ ...prev, leadId: '' }));
              }}
              className={`w-full p-2.5 rounded bg-[#0e1017] border text-zinc-100 text-xs focus:border-[#f43f5e] focus:outline-none transition-colors ${
                formErrors.leadId ? 'border-[#f43f5e] bg-[#241117]' : 'border-[#232838]'
              }`}
            >
              <option value="" className="bg-[#12151e] text-zinc-400">-- Select a Lead --</option>
              {leads.map(l => (
                <option key={l.id} value={l.id} className="bg-[#12151e] text-zinc-100">
                  {l.name} — {l.company}
                </option>
              ))}
            </select>
            {formErrors.leadId && (
              <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{formErrors.leadId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Scheduled Date *</label>
              <input
                type="date"
                value={newFup.scheduledDate}
                onChange={e => {
                  setNewFup({ ...newFup, scheduledDate: e.target.value });
                  if (formErrors.scheduledDate) setFormErrors(prev => ({ ...prev, scheduledDate: '' }));
                }}
                className={`w-full p-2.5 rounded bg-[#0e1017] border text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors ${
                  formErrors.scheduledDate ? 'border-[#f43f5e] bg-[#241117]' : 'border-[#232838]'
                }`}
              />
              {formErrors.scheduledDate && (
                <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{formErrors.scheduledDate}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Time *</label>
              <input
                type="time"
                value={newFup.scheduledTime}
                onChange={e => {
                  setNewFup({ ...newFup, scheduledTime: e.target.value });
                  if (formErrors.scheduledTime) setFormErrors(prev => ({ ...prev, scheduledTime: '' }));
                }}
                className={`w-full p-2.5 rounded bg-[#0e1017] border text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors ${
                  formErrors.scheduledTime ? 'border-[#f43f5e] bg-[#241117]' : 'border-[#232838]'
                }`}
              />
              {formErrors.scheduledTime && (
                <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{formErrors.scheduledTime}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Interaction Type</label>
              <select
                value={newFup.type}
                onChange={e => setNewFup({ ...newFup, type: e.target.value })}
                className="w-full p-2.5 border border-[#232838] rounded bg-[#0e1017] text-zinc-100 text-xs focus:border-[#f43f5e] focus:outline-none transition-colors"
              >
                <option value="Call" className="bg-[#12151e] text-zinc-100">Phone Call</option>
                <option value="Demo" className="bg-[#12151e] text-zinc-100">Product Demo</option>
                <option value="Email" className="bg-[#12151e] text-zinc-100">Email Follow-Up</option>
                <option value="Meeting" className="bg-[#12151e] text-zinc-100">Client Meeting</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Assigned Owner</label>
              <select
                value={newFup.assignedTo}
                onChange={e => setNewFup({ ...newFup, assignedTo: e.target.value })}
                className="w-full p-2.5 border border-[#232838] rounded bg-[#0e1017] text-zinc-100 text-xs focus:border-[#f43f5e] focus:outline-none transition-colors"
              >
                {teamUsers.map(u => (
                  <option key={u.id} value={u.id} className="bg-[#12151e] text-zinc-100">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Action Items & Agenda Notes</label>
            <textarea
              rows={2}
              value={newFup.notes}
              onChange={e => setNewFup({ ...newFup, notes: e.target.value })}
              placeholder="e.g. Present contract terms and review pricing breakdown..."
              className="w-full p-2.5 border border-[#232838] rounded bg-[#0e1017] text-zinc-100 placeholder-zinc-500 focus:border-[#f43f5e] focus:outline-none transition-colors"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2432]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScheduleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
