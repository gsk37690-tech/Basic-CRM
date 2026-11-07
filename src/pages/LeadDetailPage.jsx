import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCrm } from '../context/CrmContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/Button.jsx';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  CalendarCheck2,
  PhoneCall,
  Save,
  CheckCircle2,
  Trash2,
  Clock,
  Plus,
} from 'lucide-react';

export const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchLeadById,
    updateLead,
    deleteLead,
    convertLead,
    createActivity,
    createFollowUp,
    updateFollowUp,
    teamUsers,
  } = useCrm();

  const { user } = useAuth();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable Lead Form State
  const [editStatus, setEditStatus] = useState('New');
  const [editQuality, setEditQuality] = useState('Warm');
  const [editOwner, setEditOwner] = useState('');
  const [editValue, setEditValue] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [leadErrors, setLeadErrors] = useState({});
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Activity Form State (controlled form with event.preventDefault())
  const [actType, setActType] = useState('Call');
  const [actSummary, setActSummary] = useState('');
  const [actDetails, setActDetails] = useState('');
  const [actErrors, setActErrors] = useState({});
  const [isSubmittingAct, setIsSubmittingAct] = useState(false);

  // Follow-Up Form State (controlled form with event.preventDefault())
  const [fupDate, setFupDate] = useState('');
  const [fupTime, setFupTime] = useState('10:00');
  const [fupType, setFupType] = useState('Call');
  const [fupNotes, setFupNotes] = useState('');
  const [fupErrors, setFupErrors] = useState({});
  const [isSubmittingFup, setIsSubmittingFup] = useState(false);

  // Load Lead
  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const data = await fetchLeadById(id);
    if (data) {
      setLead(data);
      setEditStatus(data.status);
      setEditQuality(data.quality);
      setEditOwner(data.assignedTo);
      setEditValue(data.estimatedValue);
      setEditNotes(data.notes || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setFupDate(tomorrow);
  }, [id]);

  // Handle Lead Info Update with event.preventDefault() and client validation
  const handleLeadUpdate = async (e) => {
    e.preventDefault();
    if (!id) return;

    const errors = {};
    if (Number(editValue) < 0) {
      errors.value = 'Estimated value cannot be negative';
    }
    if (Object.keys(errors).length > 0) {
      setLeadErrors(errors);
      return;
    }
    setLeadErrors({});
    setIsSubmittingLead(true);

    try {
      await updateLead(id, {
        status: editStatus,
        quality: editQuality,
        assignedTo: editOwner,
        estimatedValue: Number(editValue),
        notes: editNotes,
      });
      await loadData();
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Handle Log Activity with event.preventDefault() and inline validation
  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!id) return;

    const errors = {};
    if (!actSummary.trim()) {
      errors.summary = 'Activity summary is required';
    }
    if (Object.keys(errors).length > 0) {
      setActErrors(errors);
      return;
    }
    setActErrors({});
    setIsSubmittingAct(true);

    try {
      await createActivity({
        leadId: id,
        type: actType,
        summary: actSummary.trim(),
        details: actDetails.trim(),
      });
      setActSummary('');
      setActDetails('');
      await loadData();
    } finally {
      setIsSubmittingAct(false);
    }
  };

  // Handle Schedule Follow-Up with event.preventDefault() and inline validation
  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!id) return;

    const errors = {};
    if (!fupDate) {
      errors.date = 'Follow-up date is required';
    }
    if (!fupTime) {
      errors.time = 'Follow-up time is required';
    }
    if (Object.keys(errors).length > 0) {
      setFupErrors(errors);
      return;
    }
    setFupErrors({});
    setIsSubmittingFup(true);

    try {
      await createFollowUp({
        leadId: id,
        scheduledDate: fupDate,
        scheduledTime: fupTime,
        type: fupType,
        notes: fupNotes.trim(),
        assignedTo: editOwner || user?.id || 'usr_exec',
      });
      setFupNotes('');
      await loadData();
    } finally {
      setIsSubmittingFup(false);
    }
  };

  // Complete Follow-up
  const handleCompleteFollowUp = async (fupId) => {
    await updateFollowUp(fupId, { status: 'Completed' });
    await loadData();
  };

  // Lead Conversion
  const handleConvert = async () => {
    if (!id || !lead) return;
    if (window.confirm(`Convert qualified lead "${lead.name}" to permanent customer Contact and active Deal?`)) {
      await convertLead(id);
      await loadData();
    }
  };

  // Lead Deletion
  const handleDelete = async () => {
    if (!id || !lead) return;
    if (window.confirm(`Are you sure you want to permanently delete lead "${lead.name}"?`)) {
      await deleteLead(id);
      navigate('/leads');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
        <p className="text-xs">Loading lead details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-600">Lead record not found</p>
        <Link to="/leads" className="text-xs text-blue-600 hover:underline">
          Return to Leads List
        </Link>
      </div>
    );
  }

  const canDelete = user?.role === 'Admin' || user?.role === 'Sales Manager';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1b1f2b] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/leads"
            className="p-1.5 border border-[#262c3c] bg-[#141722] rounded hover:bg-[#1e2333] text-zinc-300 transition-colors"
            title="Back to leads list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{lead.name}</h1>
              <span className="text-xs bg-[#181c26] border border-[#272d3e] px-2 py-0.5 rounded font-medium text-zinc-300">
                {lead.company}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Captured via {lead.source} on {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {lead.status !== 'Converted' ? (
            <button
              onClick={handleConvert}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f43f5e] text-white rounded text-xs font-semibold hover:bg-[#e11d48] transition-colors shadow-sm shadow-[#f43f5e]/25"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Convert to Contact & Deal</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Converted Lead</span>
            </div>
          )}

          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 border border-[#4d1f2b] text-[#ff4b6e] hover:bg-[#251218] rounded transition-colors text-xs flex items-center gap-1"
              title="Delete lead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid: Lead Profile + Editable Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lead Information Form */}
        <div className="bg-[#12151e] border border-[#1f2432] rounded-lg p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white pb-2 border-b border-[#1b1f2b]">
            Lead Profile & Qualification
          </h2>

          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-zinc-500" />
              <span className="font-semibold text-zinc-200">{lead.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-500" />
              <span>{lead.email}</span>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span>{lead.phone}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleLeadUpdate} className="space-y-3 pt-3 border-t border-[#1b1f2b] text-xs">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Status</label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] rounded text-zinc-200 text-xs focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Quality</label>
              <select
                value={editQuality}
                onChange={e => setEditQuality(e.target.value)}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] rounded text-zinc-200 text-xs focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
              >
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Assigned Representative</label>
              <select
                value={editOwner}
                onChange={e => setEditOwner(e.target.value)}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] rounded text-zinc-200 text-xs focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
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
                value={editValue}
                onChange={e => {
                  setEditValue(Number(e.target.value));
                  if (leadErrors.value) setLeadErrors(prev => ({ ...prev, value: null }));
                }}
                className={`w-full p-2 border rounded text-xs bg-[#0e1017] text-zinc-100 focus:ring-1 focus:ring-[#f43f5e] focus:outline-none ${
                  leadErrors.value ? 'border-[#f43f5e] bg-[#221016]' : 'border-[#232838]'
                }`}
              />
              {leadErrors.value && (
                <p className="text-2xs text-[#ff4b6e] mt-1 font-medium">{leadErrors.value}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Notes</label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-100 rounded text-xs focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
              ></textarea>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingLead}
              className="w-full justify-center"
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Lead Updates
            </Button>
          </form>
        </div>

        {/* Right Columns: Follow-ups and Activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#12151e] border border-[#1f2432] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b1f2b]">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-[#ff4b6e]" />
                <h2 className="text-sm font-bold text-white">Scheduled Follow-Ups</h2>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {lead.followUps?.length || 0} total
              </span>
            </div>

            <div className="space-y-2">
              {(!lead.followUps || lead.followUps.length === 0) ? (
                <p className="text-xs text-zinc-500 py-2">No follow-ups scheduled for this lead.</p>
              ) : (
                lead.followUps.map(fup => (
                  <div
                    key={fup.id}
                    className={`flex items-center justify-between p-3 rounded border text-xs ${
                      fup.status === 'Completed'
                        ? 'bg-[#0e1017] border-[#1d2232] text-zinc-500'
                        : 'bg-[#151926] border-[#252c40] text-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100">{fup.type} Follow-Up</span>
                        <span className="flex items-center gap-1 text-zinc-400 text-2xs">
                          <Clock className="w-3 h-3 text-[#ff4b6e]" />
                          {fup.scheduledDate} at {fup.scheduledTime}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-2xs font-medium ${
                            fup.status === 'Completed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#f43f5e]/15 text-[#ff4b6e] border border-[#f43f5e]/30'
                          }`}
                        >
                          {fup.status}
                        </span>
                      </div>
                      {fup.notes && <p className="text-zinc-400 mt-1 text-2xs">{fup.notes}</p>}
                    </div>

                    {fup.status === 'Pending' && (
                      <button
                        onClick={() => handleCompleteFollowUp(fup.id)}
                        className="px-2 py-1 bg-[#181c26] border border-[#272d3e] text-zinc-300 hover:bg-[#202535] hover:text-white rounded text-2xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Mark Done</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleScheduleFollowUp} className="pt-3 border-t border-[#1b1f2b] space-y-2 text-xs">
              <span className="font-semibold text-zinc-200 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-[#ff4b6e]" />
                <span>Schedule Next Follow-Up</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-0.5">Date</label>
                  <input
                    type="date"
                    value={fupDate}
                    onChange={e => {
                      setFupDate(e.target.value);
                      if (fupErrors.date) setFupErrors(prev => ({ ...prev, date: null }));
                    }}
                    className={`w-full p-1.5 border rounded text-xs bg-[#0e1017] text-zinc-100 ${
                      fupErrors.date ? 'border-[#f43f5e] bg-[#221016]' : 'border-[#232838]'
                    }`}
                  />
                  {fupErrors.date && (
                    <p className="text-2xs text-[#ff4b6e] mt-0.5 font-medium">{fupErrors.date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-zinc-400 mb-0.5">Time</label>
                  <input
                    type="time"
                    value={fupTime}
                    onChange={e => {
                      setFupTime(e.target.value);
                      if (fupErrors.time) setFupErrors(prev => ({ ...prev, time: null }));
                    }}
                    className={`w-full p-1.5 border rounded text-xs bg-[#0e1017] text-zinc-100 ${
                      fupErrors.time ? 'border-[#f43f5e] bg-[#221016]' : 'border-[#232838]'
                    }`}
                  />
                  {fupErrors.time && (
                    <p className="text-2xs text-[#ff4b6e] mt-0.5 font-medium">{fupErrors.time}</p>
                  )}
                </div>
                <div>
                  <label className="block text-zinc-400 mb-0.5">Type</label>
                  <select
                    value={fupType}
                    onChange={e => setFupType(e.target.value)}
                    className="w-full p-1.5 border border-[#232838] bg-[#0e1017] text-zinc-200 rounded text-xs"
                  >
                    <option value="Call">Phone Call</option>
                    <option value="Demo">Product Demo</option>
                    <option value="Email">Follow-up Email</option>
                    <option value="Meeting">In-Person Meeting</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Notes for follow-up (e.g. discuss proposal revisions)"
                  value={fupNotes}
                  onChange={e => setFupNotes(e.target.value)}
                  className="w-full p-1.5 border border-[#232838] bg-[#0e1017] text-zinc-100 rounded text-xs focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="sm"
                isLoading={isSubmittingFup}
              >
                Schedule Follow-Up
              </Button>
            </form>
          </div>

          <div className="bg-[#12151e] border border-[#1f2432] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b1f2b]">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#ff4b6e]" />
                <h2 className="text-sm font-bold text-white">Interaction History & Call Notes</h2>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {lead.activities?.length || 0} entries
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {(!lead.activities || lead.activities.length === 0) ? (
                <p className="text-xs text-zinc-500 py-2">No activity history recorded yet.</p>
              ) : (
                lead.activities.map(act => (
                  <div key={act.id} className="p-3 rounded bg-[#0e1017] border border-[#1a1e2a] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-200">{act.summary}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#f43f5e]/15 text-[#ff4b6e] text-2xs font-medium border border-[#f43f5e]/30">
                          {act.type}
                        </span>
                      </div>
                      <span className="text-2xs text-zinc-500 font-mono">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {act.details && <p className="text-zinc-400 text-xs">{act.details}</p>}
                    <p className="text-2xs text-zinc-500">
                      Logged by: {act.performedByName || 'Staff Member'}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddActivity} className="pt-3 border-t border-[#1b1f2b] space-y-2 text-xs">
              <span className="font-semibold text-zinc-200 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-[#ff4b6e]" />
                <span>Log New Call, Meeting, or Note</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <select
                    value={actType}
                    onChange={e => setActType(e.target.value)}
                    className="w-full p-1.5 border border-[#232838] bg-[#0e1017] text-zinc-200 rounded text-xs"
                  >
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="Note">Note</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Brief summary (e.g. Conducted 20-minute discovery call)"
                    value={actSummary}
                    onChange={e => {
                      setActSummary(e.target.value);
                      if (actErrors.summary) setActErrors(prev => ({ ...prev, summary: null }));
                    }}
                    className={`w-full p-1.5 border rounded text-xs bg-[#0e1017] text-zinc-100 focus:ring-1 focus:ring-[#f43f5e] focus:outline-none ${
                      actErrors.summary ? 'border-[#f43f5e] bg-[#221016]' : 'border-[#232838]'
                    }`}
                  />
                  {actErrors.summary && (
                    <p className="text-2xs text-[#ff4b6e] mt-0.5 font-medium">{actErrors.summary}</p>
                  )}
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  placeholder="Key discussion points, customer feedback, next steps..."
                  value={actDetails}
                  onChange={e => setActDetails(e.target.value)}
                  className="w-full p-1.5 border border-[#232838] bg-[#0e1017] text-zinc-100 rounded text-xs focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
                ></textarea>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmittingAct}
              >
                Log Activity
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
