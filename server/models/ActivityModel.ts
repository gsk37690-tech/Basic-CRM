/**
 * Mongoose Schema: Activity (Call & Meeting Interaction Log)
 * References: User (performedBy), Lead (leadId), Deal (dealId)
 * Indexes: { leadId: 1, createdAt: -1 }
 */
export const ActivitySchemaDefinition = {
  leadId: {
    type: 'ObjectId',
    ref: 'Lead',
    default: null,
    index: true,
  },
  dealId: {
    type: 'ObjectId',
    ref: 'Deal',
    default: null,
  },
  type: {
    type: 'String',
    enum: ['Call', 'Email', 'Meeting', 'Note'],
    required: true,
  },
  summary: {
    type: 'String',
    required: [true, 'Activity summary is required'],
    trim: true,
  },
  details: {
    type: 'String',
    trim: true,
  },
  performedBy: {
    type: 'ObjectId',
    ref: 'User',
    required: true,
    index: true,
  },
  createdAt: {
    type: 'Date',
    default: Date.now,
    index: true,
  },
};

export const ActivityIndexes = [
  { fields: { leadId: 1, createdAt: -1 }, options: { name: 'lead_activity_timeline_idx' } },
];
