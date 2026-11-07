export type UserRole = 'Admin' | 'Sales Manager' | 'Sales Executive';

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Converted' | 'Lost';
export type LeadQuality = 'Hot' | 'Warm' | 'Cold';
export type LeadSource = 'Website' | 'Referral' | 'Cold Call' | 'Social Media' | 'Event' | 'Other';

export interface ILead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  quality: LeadQuality;
  assignedTo: string; // User ID
  assignedToName?: string;
  estimatedValue: number;
  notes: string;
  convertedContactId?: string;
  convertedDealId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Note';

export interface IActivity {
  id: string;
  leadId?: string;
  dealId?: string;
  type: ActivityType;
  summary: string;
  details: string;
  performedBy: string; // User ID
  performedByName?: string;
  createdAt: string;
}

export type FollowUpType = 'Call' | 'Demo' | 'Email' | 'Meeting';
export type FollowUpStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface IFollowUp {
  id: string;
  leadId: string;
  leadName?: string;
  company?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  type: FollowUpType;
  status: FollowUpStatus;
  notes: string;
  assignedTo: string; // User ID
  assignedToName?: string;
  createdAt: string;
  completedAt?: string;
}

export interface IContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  position?: string;
  leadId?: string;
  assignedTo: string; // User ID
  assignedToName?: string;
  notes: string;
  createdAt: string;
}

export type DealStage = 'Prospecting' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface IDeal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: string; // YYYY-MM-DD
  leadId?: string;
  contactId?: string;
  contactName?: string;
  company: string;
  assignedTo: string; // User ID
  assignedToName?: string;
  probability: number; // 0 - 100
  notes: string;
  createdAt: string;
  updatedAt: string;
}
