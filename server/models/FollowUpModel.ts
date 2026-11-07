/**
 * Mongoose Schema: FollowUp (Scheduler)
 * References: User (assignedTo), Lead (leadId)
 * Indexes: { scheduledDate: 1, status: 1 }, { assignedTo: 1, status: 1 }
 */
export const FollowUpSchemaDefinition = {
  leadId: {
    type: 'ObjectId',
    ref: 'Lead',
    required: true,
    index: true,
  },
  scheduledDate: {
    type: 'String',
    required: [true, 'Scheduled date is required (YYYY-MM-DD)'],
    index: true,
  },
  scheduledTime: {
    type: 'String',
    required: [true, 'Scheduled time is required (HH:mm)'],
  },
  type: {
    type: 'String',
    enum: ['Call', 'Demo', 'Email', 'Meeting'],
    default: 'Call',
  },
  status: {
    type: 'String',
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending',
    index: true,
  },
  notes: {
    type: 'String',
    trim: true,
  },
  assignedTo: {
    type: 'ObjectId',
    ref: 'User',
    required: true,
    index: true,
  },
  createdAt: {
    type: 'Date',
    default: Date.now,
  },
  completedAt: {
    type: 'Date',
    default: null,
  },
};

export const FollowUpIndexes = [
  { fields: { scheduledDate: 1, status: 1 }, options: { name: 'schedule_status_idx' } },
  { fields: { assignedTo: 1, status: 1 }, options: { name: 'user_pending_followup_idx' } },
];
