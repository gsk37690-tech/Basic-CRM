import mongoose, { Schema, Document } from 'mongoose';

export interface IDealDocument extends Document {
  title: string;
  value: number;
  stage: string;
  expectedCloseDate: string;
  leadId?: mongoose.Types.ObjectId | null;
  contactId?: mongoose.Types.ObjectId | null;
  company: string;
  assignedTo: mongoose.Types.ObjectId;
  probability: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

const dealSchema = new Schema<IDealDocument>(
  {
    title: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0 },
    stage: {
      type: String,
      enum: ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
      default: 'Prospecting',
      index: true,
    },
    expectedCloseDate: { type: String, required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', default: null },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null },
    company: { type: String, required: true, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    probability: { type: Number, min: 0, max: 100, default: 40 },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

dealSchema.index({ stage: 1, assignedTo: 1 });
dealSchema.index({ expectedCloseDate: 1 });

export const DealModel = mongoose.models.Deal || mongoose.model<IDealDocument>('Deal', dealSchema);

