/**
 * Mongoose Schema: Lead
 * References: User (assignedTo), Contact (convertedContactId), Deal (convertedDealId)
 * Indexes: Compound index { email: 1, company: 1 }, { status: 1, assignedTo: 1 }
 */
export const LeadSchemaDefinition = {
  name: {
    type: 'String',
    required: [true, 'Lead contact name is required'],
    trim: true,
  },
  company: {
    type: 'String',
    required: [true, 'Lead company name is required'],
    trim: true,
  },
  email: {
    type: 'String',
    required: [true, 'Lead email is required'],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
  },
  phone: {
    type: 'String',
    trim: true,
  },
  source: {
    type: 'String',
    enum: ['Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Other'],
    default: 'Website',
  },
  status: {
    type: 'String',
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'],
    default: 'New',
    index: true,
  },
  quality: {
    type: 'String',
    enum: ['Hot', 'Warm', 'Cold'],
    default: 'Warm',
  },
  assignedTo: {
    type: 'ObjectId',
    ref: 'User',
    required: true,
    index: true,
  },
  estimatedValue: {
    type: 'Number',
    default: 0,
    min: [0, 'Estimated value cannot be negative'],
  },
  notes: {
    type: 'String',
    trim: true,
  },
  convertedContactId: {
    type: 'ObjectId',
    ref: 'Contact',
    default: null,
  },
  convertedDealId: {
    type: 'ObjectId',
    ref: 'Deal',
    default: null,
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

// Suitable Mongoose Indexes for Query Performance
export const LeadIndexes = [
  { fields: { email: 1, company: 1 }, options: { name: 'email_company_idx' } },
  { fields: { status: 1, assignedTo: 1 }, options: { name: 'status_assignedTo_idx' } },
  { fields: { quality: 1, estimatedValue: -1 }, options: { name: 'quality_value_idx' } },
];
