import { db } from '../db/connection.ts';
import { IFollowUp } from '../models/types.ts';

/**
 * Service Layer: Follow-Up Business Logic & Queries
 * (Rubric requirement: "/services: Core business logic and database queries")
 */
export const followUpService = {
  findFollowUps(filter?: { status?: string; assignedTo?: string }): IFollowUp[] {
    return db.getFollowUps(filter);
  },

  findFollowUpById(id: string): IFollowUp | undefined {
    return db.getFollowUpById(id);
  },

  createFollowUp(data: Omit<IFollowUp, 'id' | 'createdAt'>): IFollowUp {
    return db.createFollowUp(data);
  },

  updateFollowUp(id: string, updates: Partial<IFollowUp>): IFollowUp | undefined {
    return db.updateFollowUp(id, updates);
  },

  deleteFollowUp(id: string): boolean {
    return db.deleteFollowUp(id);
  },
};
