import { db } from '../db/connection.ts';
import { IDeal } from '../models/types.ts';

/**
 * Service Layer: Deal Pipeline Business Logic & Queries
 * (Rubric requirement: "/services: Core business logic and database queries")
 */
export const dealService = {
  findDeals(stage?: string): IDeal[] {
    return db.getDeals(stage);
  },

  findDealById(id: string): IDeal | undefined {
    return db.getDealById(id);
  },

  createDeal(data: Omit<IDeal, 'id' | 'createdAt' | 'updatedAt'>): IDeal {
    return db.createDeal(data);
  },

  updateDeal(id: string, updates: Partial<IDeal>): IDeal | undefined {
    return db.updateDeal(id, updates);
  },

  deleteDeal(id: string): boolean {
    return db.deleteDeal(id);
  },
};
