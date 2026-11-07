import mongoose, { Schema, Document } from 'mongoose';

export interface IContactDocument extends Document {
  name: string;
  company: string;
  email: string;
  phone?: string;
  position: string;
  leadId?: mongoose.Types.ObjectId | null;
  assignedTo: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

export const ContactSchemaDefinition = {
  name: {
    type: 'String',
    required: [true, 'Contact name is required'],
    trim: true,
  },
  company: {
    type: 'String',
    required: [true, 'Company name is required'],
    trim: true,
    index: true,
  },
  email: {
    type: 'String',
    required: [true, 'Contact email is required'],
    lowercase: true,
    trim: true,
    index: true,
  },
  phone: {
    type: 'String',
    trim: true,
  },
  position: {
    type: 'String',
    trim: true,
    default: 'Client',
  },
  leadId: {
    type: 'ObjectId',
    ref: 'Lead',
    default: null,
  },
  assignedTo: {
    type: 'ObjectId',
    ref: 'User',
    required: true,
    index: true,
  },
  notes: {
    type: 'String',
    trim: true,
  },
  createdAt: {
    type: 'Date',
    default: Date.now,
  },
};

const contactSchema = new Schema<IContactDocument>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    phone: { type: String, trim: true, default: '' },
    position: { type: String, default: 'Client' },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    notes: { type: String, trim: true, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ContactModel = mongoose.models.Contact || mongoose.model<IContactDocument>('Contact', contactSchema);
