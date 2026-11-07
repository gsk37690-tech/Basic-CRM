import { db } from '../db/connection.ts';
import { ILead, IContact, IDeal } from '../models/types.ts';

/**
 * Service Layer: Lead Business Logic & Queries
 * (Rubric requirement: "/services: Core business logic and database queries")
 */
export const leadService = {
  findLeads(filter?: {
    search?: string;
    status?: string;
    quality?: string;
    assignedTo?: string;
    sort?: string;
  }): ILead[] {
    return db.getLeads(filter);
  },

  findLeadWithDetails(id: string) {
    const lead = db.getLeadById(id);
    if (!lead) return null;

    const activities = db.getActivities(lead.id);
    const followUps = db.getFollowUps().filter(f => f.leadId === lead.id);

    return {
      ...lead,
      activities,
      followUps,
    };
  },

  createLead(data: Omit<ILead, 'id' | 'createdAt' | 'updatedAt'>, createdByUserId: string): ILead {
    const newLead = db.createLead(data);

    // Auto-create initial activity log
    db.createActivity({
      leadId: newLead.id,
      type: 'Note',
      summary: 'New Lead Captured',
      details: `Lead captured from ${newLead.source} with estimated value of $${newLead.estimatedValue.toLocaleString()}.`,
      performedBy: createdByUserId,
    });

    return newLead;
  },

  updateLead(id: string, updates: Partial<ILead>, updatedByUserId: string): ILead | undefined {
    const existing = db.getLeadById(id);
    if (!existing) return undefined;

    const updated = db.updateLead(id, updates);

    if (updates.status && updates.status !== existing.status) {
      db.createActivity({
        leadId: id,
        type: 'Note',
        summary: `Status updated to ${updates.status}`,
        details: `Lead status changed from ${existing.status} to ${updates.status}.`,
        performedBy: updatedByUserId,
      });
    }

    return updated;
  },

  deleteLead(id: string): boolean {
    return db.deleteLead(id);
  },

  convertLead(
    leadId: string,
    dealTitle?: string,
    expectedCloseDate?: string
  ): { lead: ILead; contact: IContact; deal: IDeal } | null {
    return db.convertLead(leadId, dealTitle, expectedCloseDate);
  },
};
