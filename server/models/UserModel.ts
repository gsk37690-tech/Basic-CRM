/**
 * Mongoose Schema: User
 * Roles: Admin, Sales Manager, Sales Executive
 * Indexes: email (unique index)
 */
export const UserSchemaDefinition = {
  name: {
    type: 'String',
    required: [true, 'User name is required'],
    trim: true,
  },
  email: {
    type: 'String',
    required: [true, 'User email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  passwordHash: {
    type: 'String',
    required: [true, 'Password hash is required'],
  },
  role: {
    type: 'String',
    enum: ['Admin', 'Sales Manager', 'Sales Executive'],
    default: 'Sales Executive',
    index: true,
  },
  phone: {
    type: 'String',
    trim: true,
  },
  createdAt: {
    type: 'Date',
    default: Date.now,
  },
};
