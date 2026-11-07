/**
 * Mongoose Schema: Contact (Customer Directory)
 * References: User (assignedTo), Lead (leadId)
 * Indexes: { email: 1 }, { company: 1 }
 */
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
