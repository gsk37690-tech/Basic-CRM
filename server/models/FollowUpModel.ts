import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUpDocument extends Document {
  leadId: mongoose.Types.ObjectId;
  scheduledDate: string;
  scheduledTime: string;
  type: 'Call' | 'Demo' | 'Email' | 'Meeting';
  status: 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
  assignedTo: mongoose.Types.ObjectId;
  createdAt: Date;
  completedAt?: Date | null;
}

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

const followUpSchema = new Schema<IFollowUpDocument>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    scheduledDate: { type: String, required: true, index: true },
    scheduledTime: { type: String, required: true },
    type: {
      type: String,
      enum: ['Call', 'Demo', 'Email', 'Meeting'],
      default: 'Call',
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    notes: { type: String, trim: true, default: '' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

followUpSchema.index({ scheduledDate: 1, status: 1 });
followUpSchema.index({ assignedTo: 1, status: 1 });

export const FollowUpModel = mongoose.models.FollowUp || mongoose.model<IFollowUpDocument>('FollowUp', followUpSchema);

