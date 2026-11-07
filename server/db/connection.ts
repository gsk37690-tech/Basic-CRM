import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { IUser, ILead, IActivity, IFollowUp, IContact, IDeal } from '../models/types.ts';
import { UserModel } from '../models/UserModel.ts';
import { LeadModel } from '../models/LeadModel.ts';
import { ContactModel } from '../models/ContactModel.ts';
import { DealModel } from '../models/DealModel.ts';
import { ActivityModel } from '../models/ActivityModel.ts';
import { FollowUpModel } from '../models/FollowUpModel.ts';

// In-Memory & Persistent Dual Store
class DatabaseService {
  private users: IUser[] = [];
  private leads: ILead[] = [];
  private activities: IActivity[] = [];
  private followUps: IFollowUp[] = [];
  private contacts: IContact[] = [];
  private deals: IDeal[] = [];
  private isConnected: boolean = false;
  private mongoUri: string | null = null;
  private ready: Promise<void>;

  constructor() {
    this.ready = this.initDatabase();
  }

  async waitUntilReady(): Promise<void> {
    await this.ready;
  }

  async hydrateFromMongo(): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;

    const [users, leads, activities, followUps, contacts, deals] = await Promise.all([
      UserModel.find().lean(),
      LeadModel.find().lean(),
      ActivityModel.find().lean(),
      FollowUpModel.find().lean(),
      ContactModel.find().lean(),
      DealModel.find().lean(),
    ]);

    if (users.length > 0) {
      this.users = users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        phone: user.phone || '',
        createdAt: new Date(user.createdAt).toISOString(),
      }));
    }

    if (leads.length > 0) {
      this.leads = leads.map(lead => ({
        id: lead._id.toString(),
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone || '',
        source: lead.source as ILead['source'],
        status: lead.status as ILead['status'],
        quality: lead.quality as ILead['quality'],
        assignedTo: lead.assignedTo.toString(),
        assignedToName: this.users.find(user => user.id === lead.assignedTo.toString())?.name,
        estimatedValue: lead.estimatedValue,
        notes: lead.notes || '',
        convertedContactId: lead.convertedContactId?.toString(),
        convertedDealId: lead.convertedDealId?.toString(),
        createdAt: new Date(lead.createdAt).toISOString(),
        updatedAt: new Date(lead.updatedAt).toISOString(),
      }));
    }

    if (activities.length > 0) {
      this.activities = activities.map(activity => ({
        id: activity._id.toString(),
        leadId: activity.leadId?.toString(),
        dealId: activity.dealId?.toString(),
        type: activity.type,
        summary: activity.summary,
        details: activity.details || '',
        performedBy: activity.performedBy.toString(),
        performedByName: this.users.find(user => user.id === activity.performedBy.toString())?.name,
        createdAt: new Date(activity.createdAt).toISOString(),
      }));
    }

    if (followUps.length > 0) {
      this.followUps = followUps.map(followUp => ({
        id: followUp._id.toString(),
        leadId: followUp.leadId.toString(),
        leadName: this.leads.find(lead => lead.id === followUp.leadId.toString())?.name,
        company: this.leads.find(lead => lead.id === followUp.leadId.toString())?.company,
        scheduledDate: followUp.scheduledDate,
        scheduledTime: followUp.scheduledTime,
        type: followUp.type,
        status: followUp.status,
        notes: followUp.notes || '',
        assignedTo: followUp.assignedTo.toString(),
        assignedToName: this.users.find(user => user.id === followUp.assignedTo.toString())?.name,
        createdAt: new Date(followUp.createdAt).toISOString(),
        completedAt: followUp.completedAt ? new Date(followUp.completedAt).toISOString() : undefined,
      }));
    }

    if (contacts.length > 0) {
      this.contacts = contacts.map(contact => ({
        id: contact._id.toString(),
        name: contact.name,
        company: contact.company,
        email: contact.email,
        phone: contact.phone || '',
        position: contact.position,
        leadId: contact.leadId?.toString(),
        assignedTo: contact.assignedTo.toString(),
        assignedToName: this.users.find(user => user.id === contact.assignedTo.toString())?.name,
        notes: contact.notes || '',
        createdAt: new Date(contact.createdAt).toISOString(),
      }));
    }

    if (deals.length > 0) {
      this.deals = deals.map(deal => ({
        id: deal._id.toString(),
        title: deal.title,
        value: deal.value,
        stage: deal.stage as IDeal['stage'],
        expectedCloseDate: deal.expectedCloseDate,
        leadId: deal.leadId?.toString(),
        contactId: deal.contactId?.toString(),
        company: deal.company,
        assignedTo: deal.assignedTo.toString(),
        assignedToName: this.users.find(user => user.id === deal.assignedTo.toString())?.name,
        probability: deal.probability,
        notes: deal.notes || '',
        createdAt: new Date(deal.createdAt).toISOString(),
        updatedAt: new Date(deal.updatedAt).toISOString(),
      }));
    }
  }

  private async initDatabase() {
    this.mongoUri = process.env.MONGODB_URI || null;
    if (this.mongoUri) {
      console.log(`[Database] MongoDB URI configured: ${this.mongoUri.replace(/:([^@]+)@/, ':****@')}`);
    } else {
      console.log('[Database] Running in Dual-Mode Local Store (Pre-seeded College Project Database)');
    }

    await this.seedInitialData();
    this.isConnected = true;
  }

  private async seedInitialData() {
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    // 1. Seed Users (Admin, Sales Manager, Sales Executive)
    this.users = [
      {
        id: 'usr_admin',
        name: 'Alex Johnson (Admin)',
        email: 'admin@collegecrm.edu',
        passwordHash: defaultPasswordHash,
        role: 'Admin',
        phone: '+1 (555) 019-2831',
        createdAt: new Date('2026-01-10T09:00:00Z').toISOString(),
      },
      {
        id: 'usr_manager',
        name: 'Sarah Connor (Sales Manager)',
        email: 'manager@collegecrm.edu',
        passwordHash: defaultPasswordHash,
        role: 'Sales Manager',
        phone: '+1 (555) 018-9944',
        createdAt: new Date('2026-01-12T10:00:00Z').toISOString(),
      },
      {
        id: 'usr_exec',
        name: 'David Miller (Sales Executive)',
        email: 'executive@collegecrm.edu',
        passwordHash: defaultPasswordHash,
        role: 'Sales Executive',
        phone: '+1 (555) 014-5521',
        createdAt: new Date('2026-01-15T11:00:00Z').toISOString(),
      },
    ];

    // 2. Seed Leads
    this.leads = [
      {
        id: 'lead_101',
        name: 'Robert Vance',
        company: 'Vance Refrigeration',
        email: 'robert@vancerefrig.com',
        phone: '+1 (555) 349-8812',
        source: 'Referral',
        status: 'Qualified',
        quality: 'Hot',
        assignedTo: 'usr_exec',
        assignedToName: 'David Miller (Sales Executive)',
        estimatedValue: 45000,
        notes: 'Needs 25 commercial refrigeration units with 24/7 maintenance contract.',
        createdAt: new Date('2026-02-01T14:20:00Z').toISOString(),
        updatedAt: new Date('2026-02-10T11:15:00Z').toISOString(),
      },
      {
        id: 'lead_102',
        name: 'Angela Martin',
        company: 'Dunder Mifflin Accounting',
        email: 'angela@dundermifflin.com',
        phone: '+1 (555) 923-4411',
        source: 'Website',
        status: 'Proposal',
        quality: 'Warm',
        assignedTo: 'usr_manager',
        assignedToName: 'Sarah Connor (Sales Manager)',
        estimatedValue: 18500,
        notes: 'Interested in automated invoice reconciliation and CRM integration.',
        createdAt: new Date('2026-02-05T09:45:00Z').toISOString(),
        updatedAt: new Date('2026-02-12T16:00:00Z').toISOString(),
      },
      {
        id: 'lead_103',
        name: 'Stanley Hudson',
        company: 'Hudson Logistics Ltd',
        email: 'stanley@hudsonlogistics.com',
        phone: '+1 (555) 431-7722',
        source: 'Cold Call',
        status: 'Contacted',
        quality: 'Cold',
        assignedTo: 'usr_exec',
        assignedToName: 'David Miller (Sales Executive)',
        estimatedValue: 12000,
        notes: 'Initial discovery call conducted. Requested product brochure before next quarter.',
        createdAt: new Date('2026-02-11T13:00:00Z').toISOString(),
        updatedAt: new Date('2026-02-11T13:30:00Z').toISOString(),
      },
      {
        id: 'lead_104',
        name: 'Jan Levinson',
        company: 'Serenity Scented Candles',
        email: 'jan@serenitycandles.com',
        phone: '+1 (555) 887-2311',
        source: 'Event',
        status: 'New',
        quality: 'Hot',
        assignedTo: 'usr_exec',
        assignedToName: 'David Miller (Sales Executive)',
        estimatedValue: 60000,
        notes: 'Met at National Retailers Expo. Looking for multi-location inventory & CRM sync.',
        createdAt: new Date('2026-02-18T10:15:00Z').toISOString(),
        updatedAt: new Date('2026-02-18T10:15:00Z').toISOString(),
      },
      {
        id: 'lead_105',
        name: 'David Wallace',
        company: 'Suck It Enterprises',
        email: 'dwallace@suckit.com',
        phone: '+1 (555) 662-1100',
        source: 'Referral',
        status: 'Converted',
        quality: 'Hot',
        assignedTo: 'usr_manager',
        assignedToName: 'Sarah Connor (Sales Manager)',
        estimatedValue: 95000,
        notes: 'Successfully closed enterprise subscription license. Converted to Contact and Deal.',
        convertedContactId: 'cnt_201',
        convertedDealId: 'deal_301',
        createdAt: new Date('2026-01-20T11:00:00Z').toISOString(),
        updatedAt: new Date('2026-02-02T15:40:00Z').toISOString(),
      },
    ];

    // 3. Seed Contacts (Converted or directly captured customers)
    this.contacts = [
      {
        id: 'cnt_201',
        name: 'David Wallace',
        company: 'Suck It Enterprises',
        email: 'dwallace@suckit.com',
        phone: '+1 (555) 662-1100',
        position: 'Chief Executive Officer',
        leadId: 'lead_105',
        assignedTo: 'usr_manager',
        assignedToName: 'Sarah Connor (Sales Manager)',
        notes: 'Converted from hot inbound referral. Key enterprise account.',
        createdAt: new Date('2026-02-02T15:40:00Z').toISOString(),
      },
      {
        id: 'cnt_202',
        name: 'Karen Filippelli',
        company: 'Utica Industrial Supplies',
        email: 'karen@uticaindustrial.com',
        phone: '+1 (555) 334-9090',
        position: 'Regional Director',
        assignedTo: 'usr_exec',
        assignedToName: 'David Miller (Sales Executive)',
        notes: 'Key decision maker for upstate warehouse branch.',
        createdAt: new Date('2026-01-25T14:10:00Z').toISOString(),
      },
    ];

    // 4. Seed Deals (Sales Pipeline)
    this.deals = [
      {
        id: 'deal_301',
        title: 'Suck It - Enterprise CRM Suite',
        value: 95000,
        stage: 'Closed Won',
        expectedCloseDate: '2026-02-02',
        leadId: 'lead_105',
        contactId: 'cnt_201',
        contactName: 'David Wallace',
        company: 'Suck It Enterprises',
        assignedTo: 'usr_manager',
        assignedToName: 'Sarah Connor (Sales Manager)',
        probability: 100,
        notes: 'Annual recurring contract signed with tier-1 SLA.',
        createdAt: new Date('2026-02-02T15:40:00Z').toISOString(),
        updatedAt: new Date('2026-02-02T15:40:00Z').toISOString(),
      },
      {
        id: 'deal_302',
        title: 'Vance Refrigeration Expansion',
        value: 45000,
        stage: 'Negotiation',
        expectedCloseDate: '2026-03-15',
        leadId: 'lead_101',
        company: 'Vance Refrigeration',
        assignedTo: 'usr_exec',
        assignedToName: 'David Miller (Sales Executive)',
        probability: 80,
        notes: 'Reviewing hardware maintenance terms and payment schedules.',
        createdAt: new Date('2026-02-10T11:15:00Z').toISOString(),
        updatedAt: new Date('2026-02-14T09:20:00Z').toISOString(),
      },
      {
        id: 'deal_303',
        title: 'Dunder Mifflin Invoice Module',
        value: 18500,
        stage: 'Proposal',
        expectedCloseDate: '2026-03-30',
        leadId: 'lead_102',
        company: 'Dunder Mifflin Accounting',
        assignedTo: 'usr_manager',
        assignedToName: 'Sarah Connor (Sales Manager)',
        probability: 50,
        notes: 'Formal RFP proposal submitted; awaiting board review.',
        createdAt: new Date('2026-02-12T16:00:00Z').toISOString(),
        updatedAt: new Date('2026-02-12T16:00:00Z').toISOString(),
      },
      {
        id: 'deal_304',
        title: 'Serenity Candles Pilot Program',
        value: 60000,
        stage: 'Prospecting',
        expectedCloseDate: '2026-04-10',
        leadId: 'lead_104',
        company: 'Serenity Scented Candles',
        assignedTo: 'usr_exec',
        assignedToName: 'David Miller (Sales Executive)',
        probability: 30,
        notes: 'Initial scope discussions on multi-location cloud sync.',
        createdAt: new Date('2026-02-18T10:15:00Z').toISOString(),
        updatedAt: new Date('2026-02-18T10:15:00Z').toISOString(),
      },
    ];

    // 5. Seed Activities (Calls, Emails, Notes, Meetings)
    this.activities = [
      {
        id: 'act_401',
        leadId: 'lead_101',
        type: 'Call',
        summary: 'Introductory Discovery Call',
        details: 'Spoke with Robert regarding specs for warehouse coolers. Sent quote sheet.',
        performedBy: 'usr_exec',
        performedByName: 'David Miller (Sales Executive)',
        createdAt: new Date('2026-02-03T10:00:00Z').toISOString(),
      },
      {
        id: 'act_402',
        leadId: 'lead_101',
        dealId: 'deal_302',
        type: 'Meeting',
        summary: 'Technical Architecture Review',
        details: 'Walked through telemetry monitoring API. Client was pleased with 99.9% uptime guarantee.',
        performedBy: 'usr_exec',
        performedByName: 'David Miller (Sales Executive)',
        createdAt: new Date('2026-02-09T14:30:00Z').toISOString(),
      },
      {
        id: 'act_403',
        leadId: 'lead_102',
        type: 'Email',
        summary: 'Sent Product Demo & Pricing Tier',
        details: 'Shared standard Enterprise pricing deck and sample CSV upload template.',
        performedBy: 'usr_manager',
        performedByName: 'Sarah Connor (Sales Manager)',
        createdAt: new Date('2026-02-07T11:20:00Z').toISOString(),
      },
      {
        id: 'act_404',
        leadId: 'lead_105',
        dealId: 'deal_301',
        type: 'Note',
        summary: 'Contract Signed & Onboarding Scheduled',
        details: 'Final master agreement executed. Transferred account to customer success.',
        performedBy: 'usr_manager',
        performedByName: 'Sarah Connor (Sales Manager)',
        createdAt: new Date('2026-02-02T15:45:00Z').toISOString(),
      },
    ];

    // 6. Seed FollowUps
    this.followUps = [
      {
        id: 'fup_501',
        leadId: 'lead_101',
        leadName: 'Robert Vance',
        company: 'Vance Refrigeration',
        scheduledDate: '2026-03-05',
        scheduledTime: '10:30',
        type: 'Call',
        status: 'Pending',
        notes: 'Review revised SLA clauses with Robert before contract finalization.',
        assignedTo: 'usr_exec',
        assignedToName: 'David Miller (Sales Executive)',
        createdAt: new Date('2026-02-12T09:00:00Z').toISOString(),
      },
      {
        id: 'fup_502',
        leadId: 'lead_102',
        leadName: 'Angela Martin',
        company: 'Dunder Mifflin Accounting',
        scheduledDate: '2026-03-08',
        scheduledTime: '14:00',
        type: 'Meeting',
        status: 'Pending',
        notes: 'Follow up on proposal feedback from the finance committee.',
        assignedTo: 'usr_manager',
        assignedToName: 'Sarah Connor (Sales Manager)',
        createdAt: new Date('2026-02-13T11:00:00Z').toISOString(),
      },
      {
        id: 'fup_503',
        leadId: 'lead_104',
        leadName: 'Jan Levinson',
        company: 'Serenity Scented Candles',
        scheduledDate: '2026-03-10',
        scheduledTime: '15:30',
        type: 'Demo',
        status: 'Pending',
        notes: 'Live software walkthrough of multi-location inventory dashboard.',
        assignedTo: 'usr_exec',
        assignedToName: 'David Miller (Sales Executive)',
        createdAt: new Date('2026-02-18T10:30:00Z').toISOString(),
      },
      {
        id: 'fup_504',
        leadId: 'lead_103',
        leadName: 'Stanley Hudson',
        company: 'Hudson Logistics Ltd',
        scheduledDate: '2026-02-15',
        scheduledTime: '11:00',
        type: 'Call',
        status: 'Completed',
        notes: 'Called Stanley; confirmed catalog receipt. Will re-engage in Q2.',
        assignedTo: 'usr_exec',
        assignedToName: 'David Miller (Sales Executive)',
        createdAt: new Date('2026-02-11T13:30:00Z').toISOString(),
        completedAt: new Date('2026-02-15T11:20:00Z').toISOString(),
      },
    ];
  }

  // --- User Repository ---
  getUsers(): IUser[] {
    return this.users;
  }

  getUserById(id: string): IUser | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): IUser | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<IUser, 'id' | 'createdAt'>): IUser {
    const newUser: IUser = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);

    // Save directly to MongoDB Atlas / Compass if connected
    if (mongoose.connection.readyState === 1) {
      UserModel.create({
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        phone: user.phone || '',
      })
        .then(doc => {
          console.log(`[MongoDB Compass Sync] Created user "${doc.name}" in collection 'users'. Doc ID: ${doc._id}`);
          newUser.id = doc._id.toString();
        })
        .catch(err => console.error('[MongoDB Error writing user]:', err.message));
    }

    return newUser;
  }

  updateUser(id: string, updates: Partial<IUser>): IUser | undefined {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...updates };

    if (mongoose.connection.readyState === 1) {
      UserModel.updateOne(
        { email: this.users[index].email },
        { $set: updates }
      ).catch(err => console.error('[MongoDB Error updating user]:', err.message));
    }

    return this.users[index];
  }

  // --- Lead Repository ---
  getLeads(filter?: { search?: string; status?: string; quality?: string; assignedTo?: string; sort?: string }): ILead[] {
    let result = [...this.leads];

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q)
      );
    }

    if (filter?.status && filter.status !== 'All') {
      result = result.filter(l => l.status === filter.status);
    }

    if (filter?.quality && filter.quality !== 'All') {
      result = result.filter(l => l.quality === filter.quality);
    }

    if (filter?.assignedTo && filter.assignedTo !== 'All') {
      result = result.filter(l => l.assignedTo === filter.assignedTo);
    }

    // Sorting
    if (filter?.sort === 'value_desc') {
      result.sort((a, b) => b.estimatedValue - a.estimatedValue);
    } else if (filter?.sort === 'value_asc') {
      result.sort((a, b) => a.estimatedValue - b.estimatedValue);
    } else if (filter?.sort === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default newest first
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }

  getLeadById(id: string): ILead | undefined {
    return this.leads.find(l => l.id === id);
  }

  createLead(data: Omit<ILead, 'id' | 'createdAt' | 'updatedAt'>): ILead {
    const assignedUser = this.getUserById(data.assignedTo);
    const mongoId = mongoose.connection.readyState === 1 ? new mongoose.Types.ObjectId() : null;
    const newLead: ILead = {
      ...data,
      id: mongoId?.toString() || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      assignedToName: assignedUser ? assignedUser.name : 'Unassigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.leads.unshift(newLead);

    if (mongoose.connection.readyState === 1) {
      LeadModel.create({
        _id: mongoId,
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone || '',
        source: data.source,
        status: data.status,
        quality: data.quality,
        assignedTo: mongoose.isValidObjectId(data.assignedTo) ? data.assignedTo : new mongoose.Types.ObjectId(),
        estimatedValue: data.estimatedValue,
        notes: data.notes || '',
      }).then(doc => {
        newLead.id = doc._id.toString();
      }).catch(err => console.error('[MongoDB Error writing lead]:', err.message));
    }

    return newLead;
  }

  updateLead(id: string, updates: Partial<ILead>): ILead | undefined {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) return undefined;

    let assignedToName = this.leads[index].assignedToName;
    if (updates.assignedTo && updates.assignedTo !== this.leads[index].assignedTo) {
      const user = this.getUserById(updates.assignedTo);
      assignedToName = user ? user.name : 'Unassigned';
    }

    this.leads[index] = {
      ...this.leads[index],
      ...updates,
      assignedToName,
      updatedAt: new Date().toISOString(),
    };
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      LeadModel.findByIdAndUpdate(id, updates, { new: true }).catch(err =>
        console.error('[MongoDB Error updating lead]:', err.message),
      );
    }
    return this.leads[index];
  }

  deleteLead(id: string): boolean {
    const initialLen = this.leads.length;
    this.leads = this.leads.filter(l => l.id !== id);
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      LeadModel.findByIdAndDelete(id).catch(err =>
        console.error('[MongoDB Error deleting lead]:', err.message),
      );
    }
    return this.leads.length < initialLen;
  }

  // --- Lead Conversion Workflow ---
  convertLead(leadId: string, dealTitle?: string, expectedCloseDate?: string): { lead: ILead; contact: IContact; deal: IDeal } | null {
    const lead = this.getLeadById(leadId);
    if (!lead) return null;

    // 1. Create permanent Contact
    const contact: IContact = {
      id: `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      position: 'Primary Contact',
      leadId: lead.id,
      assignedTo: lead.assignedTo,
      assignedToName: lead.assignedToName,
      notes: `Converted from Lead ${lead.name} (${lead.company}). Original notes: ${lead.notes}`,
      createdAt: new Date().toISOString(),
    };
    this.contacts.unshift(contact);

    // 2. Create Deal
    const deal: IDeal = {
      id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: dealTitle || `${lead.company} - Contract`,
      value: lead.estimatedValue,
      stage: 'Prospecting',
      expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      leadId: lead.id,
      contactId: contact.id,
      contactName: contact.name,
      company: lead.company,
      assignedTo: lead.assignedTo,
      assignedToName: lead.assignedToName,
      probability: 40,
      notes: `Generated on lead conversion. Estimated value: $${lead.estimatedValue.toLocaleString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.deals.unshift(deal);

    // 3. Update Lead status to Converted
    lead.status = 'Converted';
    lead.convertedContactId = contact.id;
    lead.convertedDealId = deal.id;
    lead.updatedAt = new Date().toISOString();

    // 4. Log conversion activity
    this.createActivity({
      leadId: lead.id,
      dealId: deal.id,
      type: 'Note',
      summary: 'Lead Converted to Contact & Deal',
      details: `Lead converted to Contact ${contact.name} and Deal "${deal.title}" with value $${deal.value.toLocaleString()}.`,
      performedBy: lead.assignedTo,
    });

    return { lead, contact, deal };
  }

  // --- Activities ---
  getActivities(leadId?: string, dealId?: string): IActivity[] {
    let result = [...this.activities];
    if (leadId) result = result.filter(a => a.leadId === leadId);
    if (dealId) result = result.filter(a => a.dealId === dealId);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createActivity(data: Omit<IActivity, 'id' | 'createdAt'>): IActivity {
    const user = this.getUserById(data.performedBy);
    const activity: IActivity = {
      ...data,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      performedByName: user ? user.name : 'Unknown',
      createdAt: new Date().toISOString(),
    };
    this.activities.unshift(activity);
    return activity;
  }

  // --- FollowUps ---
  getFollowUps(filter?: { status?: string; assignedTo?: string }): IFollowUp[] {
    let result = [...this.followUps];
    if (filter?.status && filter.status !== 'All') {
      result = result.filter(f => f.status === filter.status);
    }
    if (filter?.assignedTo && filter.assignedTo !== 'All') {
      result = result.filter(f => f.assignedTo === filter.assignedTo);
    }
    return result.sort((a, b) => `${a.scheduledDate} ${a.scheduledTime}`.localeCompare(`${b.scheduledDate} ${b.scheduledTime}`));
  }

  getFollowUpById(id: string): IFollowUp | undefined {
    return this.followUps.find(f => f.id === id);
  }

  createFollowUp(data: Omit<IFollowUp, 'id' | 'createdAt'>): IFollowUp {
    const user = this.getUserById(data.assignedTo);
    const lead = this.getLeadById(data.leadId);
    const followUp: IFollowUp = {
      ...data,
      id: `fup_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      assignedToName: user ? user.name : 'Unassigned',
      leadName: lead ? lead.name : 'Lead',
      company: lead ? lead.company : '',
      createdAt: new Date().toISOString(),
    };
    this.followUps.unshift(followUp);
    return followUp;
  }

  updateFollowUp(id: string, updates: Partial<IFollowUp>): IFollowUp | undefined {
    const index = this.followUps.findIndex(f => f.id === id);
    if (index === -1) return undefined;
    this.followUps[index] = { ...this.followUps[index], ...updates };
    return this.followUps[index];
  }

  deleteFollowUp(id: string): boolean {
    const initial = this.followUps.length;
    this.followUps = this.followUps.filter(f => f.id !== id);
    return this.followUps.length < initial;
  }

  // --- Contacts ---
  getContacts(search?: string): IContact[] {
    let result = [...this.contacts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getContactById(id: string): IContact | undefined {
    return this.contacts.find(c => c.id === id);
  }

  createContact(data: Omit<IContact, 'id' | 'createdAt'>): IContact {
    const user = this.getUserById(data.assignedTo);
    const contact: IContact = {
      ...data,
      id: `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      assignedToName: user ? user.name : 'Unassigned',
      createdAt: new Date().toISOString(),
    };
    this.contacts.unshift(contact);
    return contact;
  }

  updateContact(id: string, updates: Partial<IContact>): IContact | undefined {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.contacts[index] = { ...this.contacts[index], ...updates };
    return this.contacts[index];
  }

  deleteContact(id: string): boolean {
    const initial = this.contacts.length;
    this.contacts = this.contacts.filter(c => c.id !== id);
    return this.contacts.length < initial;
  }

  // --- Deals ---
  getDeals(stage?: string): IDeal[] {
    let result = [...this.deals];
    if (stage && stage !== 'All') {
      result = result.filter(d => d.stage === stage);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getDealById(id: string): IDeal | undefined {
    return this.deals.find(d => d.id === id);
  }

  createDeal(data: Omit<IDeal, 'id' | 'createdAt' | 'updatedAt'>): IDeal {
    const user = this.getUserById(data.assignedTo);
    const deal: IDeal = {
      ...data,
      id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      assignedToName: user ? user.name : 'Unassigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.deals.unshift(deal);
    return deal;
  }

  updateDeal(id: string, updates: Partial<IDeal>): IDeal | undefined {
    const index = this.deals.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    this.deals[index] = {
      ...this.deals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.deals[index];
  }

  deleteDeal(id: string): boolean {
    const initial = this.deals.length;
    this.deals = this.deals.filter(d => d.id !== id);
    return this.deals.length < initial;
  }

  // --- Summary & Dashboard Aggregates ---
  getDashboardStats() {
    const totalLeads = this.leads.length;
    const convertedLeads = this.leads.filter(l => l.status === 'Converted').length;
    const hotLeads = this.leads.filter(l => l.quality === 'Hot').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    const totalDeals = this.deals.length;
    const wonDeals = this.deals.filter(d => d.stage === 'Closed Won');
    const totalRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);
    const pipelineValue = this.deals
      .filter(d => d.stage !== 'Closed Lost')
      .reduce((sum, d) => sum + d.value, 0);

    const pendingFollowUps = this.followUps.filter(f => f.status === 'Pending').length;

    // Stage breakdown
    const stageCounts: Record<string, { count: number; value: number }> = {
      'Prospecting': { count: 0, value: 0 },
      'Qualified': { count: 0, value: 0 },
      'Proposal': { count: 0, value: 0 },
      'Negotiation': { count: 0, value: 0 },
      'Closed Won': { count: 0, value: 0 },
      'Closed Lost': { count: 0, value: 0 },
    };

    this.deals.forEach(d => {
      if (stageCounts[d.stage]) {
        stageCounts[d.stage].count += 1;
        stageCounts[d.stage].value += d.value;
      }
    });

    // Leads by source breakdown
    const sourceCounts: Record<string, number> = {};
    this.leads.forEach(l => {
      sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
    });

    // Executive performance
    const executiveStats = this.users.map(u => {
      const userLeads = this.leads.filter(l => l.assignedTo === u.id);
      const userWon = this.deals.filter(d => d.assignedTo === u.id && d.stage === 'Closed Won');
      const revenue = userWon.reduce((sum, d) => sum + d.value, 0);
      return {
        userId: u.id,
        userName: u.name,
        role: u.role,
        leadCount: userLeads.length,
        wonDeals: userWon.length,
        revenue,
      };
    });

    return {
      totalLeads,
      convertedLeads,
      hotLeads,
      conversionRate,
      totalContacts: this.contacts.length,
      totalDeals,
      totalRevenue,
      pipelineValue,
      pendingFollowUps,
      totalActivities: this.activities.length,
      stageCounts,
      sourceCounts,
      executiveStats,
    };
  }

  // Reset demo data helper
  async resetDemoData() {
    await this.seedInitialData();
  }
}

export const db = new DatabaseService();
