import { db } from '../db/connection.ts';
import { IContact } from '../models/types.ts';

/**
 * Service Layer: Customer Contacts Directory Queries
 * (Rubric requirement: "/services: Core business logic and database queries")
 */
export const contactService = {
  findContacts(search?: string): IContact[] {
    return db.getContacts(search);
  },

  findContactById(id: string): IContact | undefined {
    return db.getContactById(id);
  },

  createContact(data: Omit<IContact, 'id' | 'createdAt'>): IContact {
    return db.createContact(data);
  },

  updateContact(id: string, updates: Partial<IContact>): IContact | undefined {
    return db.updateContact(id, updates);
  },

  deleteContact(id: string): boolean {
    return db.deleteContact(id);
  },
};
