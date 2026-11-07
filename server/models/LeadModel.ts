import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadDocument extends Document {
  name: string;
  company: string;
  email: string;
  phone?: string;
  source: string;
  status: string;
  quality: string;
  assignedTo: mongoose.Types.ObjectId;
  estimatedValue: number;
  notes?: string;
  convertedContactId?: mongoose.Types.ObjectId | null;
  convertedDealId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export const LeadIndexes = [
  { fields: { email: 1, company: 1 }, options: { name: 'email_company_idx' } },
  { fields: { status: 1, assignedTo: 1 }, options: { name: 'status_assignedTo_idx' } },
  { fields: { quality: 1, estimatedValue: -1 }, options: { name: 'quality_value_idx' } },
];

const leadSchema = new Schema<ILeadDocument>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Other'],
      default: 'Website',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'],
      default: 'New',
      index: true,
    },
    quality: {
      type: String,
      enum: ['Hot', 'Warm', 'Cold'],
      default: 'Warm',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    estimatedValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: { type: String, trim: true, default: '' },
    convertedContactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      default: null,
    },
    convertedDealId: {
      type: Schema.Types.ObjectId,
      ref: 'Deal',
      default: null,
    },
  },
  { timestamps: true }
);

leadSchema.index({ email: 1, company: 1 });
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ quality: 1, estimatedValue: -1 });

export const LeadModel = mongoose.models.Lead || mongoose.model<ILeadDocument>('Lead', leadSchema);

