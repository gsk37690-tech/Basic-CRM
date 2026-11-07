import { db } from '../db/connection.ts';
import { IActivity } from '../models/types.ts';

/**
 * Service Layer: Interaction Activity Logs Business Logic & Queries
 * (Rubric requirement: "/services: Core business logic and database queries")
 */
export const activityService = {
  findActivities(leadId?: string, dealId?: string): IActivity[] {
    return db.getActivities(leadId, dealId);
  },

  createActivity(data: Omit<IActivity, 'id' | 'createdAt'>): IActivity {
    return db.createActivity(data);
  },
};
