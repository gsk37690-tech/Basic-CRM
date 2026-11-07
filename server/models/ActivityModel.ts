import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityDocument extends Document {
  leadId?: mongoose.Types.ObjectId | null;
  dealId?: mongoose.Types.ObjectId | null;
  type: 'Call' | 'Email' | 'Meeting' | 'Note';
  summary: string;
  details?: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

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

const activitySchema = new Schema<IActivityDocument>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', default: null, index: true },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', default: null },
    type: { type: String, enum: ['Call', 'Email', 'Meeting', 'Note'], required: true },
    summary: { type: String, required: true, trim: true },
    details: { type: String, trim: true, default: '' },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

activitySchema.index({ leadId: 1, createdAt: -1 });

export const ActivityModel = mongoose.models.Activity || mongoose.model<IActivityDocument>('Activity', activitySchema);

