/**
 * Mongoose Schema: Deal (Sales Pipeline)
 * Stages: Prospecting, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
 * References: User (assignedTo), Contact (contactId), Lead (leadId)
 * Indexes: { stage: 1, assignedTo: 1 }, { value: -1 }
 */
export const DealSchemaDefinition = {
  title: {
    type: 'String',
    required: [true, 'Deal title is required'],
    trim: true,
  },
  value: {
    type: 'Number',
    required: [true, 'Deal value is required'],
    min: [0, 'Value must be positive'],
  },
  stage: {
    type: 'String',
    enum: ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Prospecting',
    index: true,
  },
  expectedCloseDate: {
    type: 'String',
    required: true,
  },
  leadId: {
    type: 'ObjectId',
    ref: 'Lead',
    default: null,
  },
  contactId: {
    type: 'ObjectId',
    ref: 'Contact',
    default: null,
  },
  company: {
    type: 'String',
    required: true,
    trim: true,
  },
  assignedTo: {
    type: 'ObjectId',
    ref: 'User',
    required: true,
    index: true,
  },
  probability: {
    type: 'Number',
    min: 0,
    max: 100,
    default: 40,
  },
  notes: {
    type: 'String',
    trim: true,
  },
  createdAt: {
    type: 'Date',
    default: Date.now,
  },
  updatedAt: {
    type: 'Date',
    default: Date.now,
  },
};

export const DealIndexes = [
  { fields: { stage: 1, assignedTo: 1 }, options: { name: 'stage_assignedTo_idx' } },
  { fields: { expectedCloseDate: 1 }, options: { name: 'closeDate_idx' } },
];
