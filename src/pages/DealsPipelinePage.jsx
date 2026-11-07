import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import {
  Plus,
  Building,
  Calendar,
  Trash2,
} from 'lucide-react';

export const DealsPipelinePage = () => {
  const { deals, createDeal, updateDeal, deleteDeal, teamUsers } = useCrm();
  const { user } = useAuth();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newDeal, setNewDeal] = useState({
    title: '',
    company: '',
    value: 20000,
    stage: 'Prospecting',
    expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    assignedTo: user?.id || 'usr_exec',
    contactId: '',
    contactName: '',
    probability: 40,
    notes: '',
  });

  const stages = [
    'Prospecting',
    'Qualified',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost',
  ];

  const validateForm = () => {
    const errors = {};
    if (!newDeal.title.trim()) errors.title = 'Deal title is required';
    if (!newDeal.company.trim()) errors.company = 'Company name is required';
    if (newDeal.value === '' || Number(newDeal.value) < 0) {
      errors.value = 'Please specify a positive deal value';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await createDeal({
      ...newDeal,
      value: Number(newDeal.value),
      probability: Number(newDeal.probability),
    });
    setIsSubmitting(false);

    setIsAddOpen(false);
    setFormErrors({});
    setNewDeal({
      title: '',
      company: '',
      value: 20000,
      stage: 'Prospecting',
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assignedTo: user?.id || 'usr_exec',
      contactId: '',
      contactName: '',
      probability: 40,
      notes: '',
    });
  };

  const handleStageChange = async (dealId, nextStage) => {
    await updateDeal(dealId, { stage: nextStage });
  };

  const handleDeleteDeal = async (dealId, title) => {
    if (window.confirm(`Delete deal "${title}" from the pipeline?`)) {
      await deleteDeal(dealId);
    }
  };

  const canDelete = user?.role === 'Admin' || user?.role === 'Sales Manager';

  // Compute total pipeline value & won revenue
  const totalPipeline = deals
    .filter(d => d.stage !== 'Closed Lost')
    .reduce((sum, d) => sum + d.value, 0);

  const wonRevenue = deals
    .filter(d => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1b1f2b] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Deals & Revenue Pipeline</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Track revenue opportunities, manage stages from prospecting to closed contract, and review probability.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs">
            <span className="text-zinc-500">Pipeline Total:</span>{' '}
            <strong className="text-white font-bold tabular-nums">
              ${totalPipeline.toLocaleString()}
            </strong>
            <span className="mx-2 text-zinc-700">|</span>
            <span className="text-[#ff4b6e]">Won:</span>{' '}
            <strong className="text-[#ff4b6e] font-bold tabular-nums">
              ${wonRevenue.toLocaleString()}
            </strong>
          </div>

          <Button
            onClick={() => setIsAddOpen(true)}
            icon={Plus}
            variant="primary"
            size="md"
          >
            Create Deal
          </Button>
        </div>
      </div>

      {/* Visual Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stages.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

          let headerColor = 'bg-[#151926] text-zinc-300 border-[#222736]';
          if (stage === 'Qualified') headerColor = 'bg-[#181d2e] text-zinc-200 border-[#252c42]';
          if (stage === 'Proposal') headerColor = 'bg-[#1f1e2e] text-zinc-200 border-[#2f2e46]';
          if (stage === 'Negotiation') headerColor = 'bg-[#29131a] text-[#ff6b87] border-[#4a1c27]';
          if (stage === 'Closed Won') headerColor = 'bg-[#0f241a] text-emerald-400 border-[#1d442e] font-bold';
          if (stage === 'Closed Lost') headerColor = 'bg-[#16171d] text-zinc-500 border-[#252733]';

          return (
            <div key={stage} className="bg-[#0f121a] border border-[#1e2332] rounded-lg flex flex-col min-h-[500px]">
              {/* Stage Header */}
              <div className={`p-2.5 rounded-t-lg border-b ${headerColor}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{stage}</span>
                  <span className="px-1.5 py-0.2 bg-[#090b10] border border-white/10 rounded text-2xs font-mono">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="text-2xs font-medium mt-1 tabular-nums">
                  ${stageValue.toLocaleString()}
                </div>
              </div>

              {/* Cards in this Stage */}
              <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-6 text-2xs text-zinc-500">
                    No deals in {stage}
                  </div>
                ) : (
                  stageDeals.map(deal => (
                    <div
                      key={deal.id}
                      className="bg-[#131620] border border-[#222735] rounded p-3 shadow-xs space-y-2 text-xs hover:border-[#333a4e] transition-colors"
                    >
                      <div>
                        <h3 className="font-bold text-white text-xs">{deal.title}</h3>
                        <div className="flex items-center gap-1 text-zinc-400 text-2xs mt-0.5">
                          <Building className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span>{deal.company}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between font-semibold text-xs pt-1 border-t border-[#1d2232]">
                        <span className="tabular-nums text-[#ff4b6e] font-bold">${deal.value.toLocaleString()}</span>
                        <span className="text-2xs font-normal text-zinc-400 font-mono">
                          {deal.probability}% prob
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-zinc-400 text-2xs">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>Close: {deal.expectedCloseDate}</span>
                      </div>

                      <div className="flex items-center justify-between text-2xs text-zinc-400 pt-1">
                        <span className="truncate max-w-[100px]">{deal.assignedToName || 'Unassigned'}</span>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteDeal(deal.id, deal.title)}
                            className="p-1 text-zinc-500 hover:text-[#f43f5e] hover:bg-[#28131a] rounded transition-colors"
                            title="Delete Deal"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Move Stage Selector */}
                      <div className="pt-2 border-t border-[#1d2232]">
                        <label className="block text-2xs text-zinc-400 mb-0.5">Shift Stage:</label>
                        <select
                          value={deal.stage}
                          onChange={e => handleStageChange(deal.id, e.target.value)}
                          className="w-full p-1 border border-[#232838] rounded text-2xs bg-[#0e1017] text-zinc-200 hover:bg-[#151824] focus:outline-none"
                        >
                          {stages.map(s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE DEAL MODAL (Reusable Modal Component) */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Deal to Pipeline"
        subtitle="Track potential revenue opportunities across pipeline stages."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Deal Title *</label>
            <input
              type="text"
              placeholder="e.g. Acme Corp Enterprise License"
              value={newDeal.title}
              onChange={e => {
                setNewDeal({ ...newDeal, title: e.target.value });
                if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' }));
              }}
              className={`w-full p-2 border rounded bg-[#0e1017] text-zinc-100 placeholder:text-zinc-500 focus:ring-1 focus:ring-[#f43f5e] focus:border-[#f43f5e] focus:outline-none ${
                formErrors.title ? 'border-[#f43f5e] bg-[#221016]' : 'border-[#232838]'
              }`}
            />
            {formErrors.title && (
              <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Company *</label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={newDeal.company}
              onChange={e => {
                setNewDeal({ ...newDeal, company: e.target.value });
                if (formErrors.company) setFormErrors(prev => ({ ...prev, company: '' }));
              }}
              className={`w-full p-2 border rounded bg-[#0e1017] text-zinc-100 placeholder:text-zinc-500 focus:ring-1 focus:ring-[#f43f5e] focus:border-[#f43f5e] focus:outline-none ${
                formErrors.company ? 'border-[#f43f5e] bg-[#221016]' : 'border-[#232838]'
              }`}
            />
            {formErrors.company && (
              <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{formErrors.company}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Deal Value ($) *</label>
              <input
                type="number"
                min="0"
                step="500"
                value={newDeal.value}
                onChange={e => {
                  setNewDeal({ ...newDeal, value: e.target.value });
                  if (formErrors.value) setFormErrors(prev => ({ ...prev, value: '' }));
                }}
                className={`w-full p-2 border rounded bg-[#0e1017] text-zinc-100 focus:ring-1 focus:ring-[#f43f5e] focus:border-[#f43f5e] focus:outline-none ${
                  formErrors.value ? 'border-[#f43f5e] bg-[#221016]' : 'border-[#232838]'
                }`}
              />
              {formErrors.value && (
                <p className="text-[#ff4b6e] text-2xs mt-1 font-medium">{formErrors.value}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Stage</label>
              <select
                value={newDeal.stage}
                onChange={e => setNewDeal({ ...newDeal, stage: e.target.value })}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-200 rounded text-xs focus:ring-1 focus:ring-[#f43f5e]"
              >
                {stages.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Expected Close Date</label>
              <input
                type="date"
                required
                value={newDeal.expectedCloseDate}
                onChange={e => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-100 rounded focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Win Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newDeal.probability}
                onChange={e => setNewDeal({ ...newDeal, probability: e.target.value })}
                className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-100 rounded focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Assigned Sales Rep</label>
            <select
              value={newDeal.assignedTo}
              onChange={e => setNewDeal({ ...newDeal, assignedTo: e.target.value })}
              className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-200 rounded text-xs focus:ring-1 focus:ring-[#f43f5e]"
            >
              {teamUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Notes & Scope</label>
            <textarea
              rows={2}
              value={newDeal.notes}
              onChange={e => setNewDeal({ ...newDeal, notes: e.target.value })}
              placeholder="Terms, payment schedules, or customer expectations..."
              className="w-full p-2 border border-[#232838] bg-[#0e1017] text-zinc-100 placeholder:text-zinc-500 rounded focus:ring-1 focus:ring-[#f43f5e] focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1d2232]">
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
              Save Deal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
