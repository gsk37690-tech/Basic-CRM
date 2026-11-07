import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Sales Manager' | 'Sales Executive';
  phone?: string;
  createdAt: Date;
}

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

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['Admin', 'Sales Manager', 'Sales Executive'],
      default: 'Sales Executive',
      index: true,
    },
    phone: { type: String, trim: true, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);
