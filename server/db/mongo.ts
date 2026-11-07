import { Collection, MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { IUser, UserRole } from '../models/types.ts';

type UserDocument = IUser & {
  _id?: ObjectId;
  updatedAt?: string;
  __v?: number;
};

let client: MongoClient | null = null;
let users: Collection<UserDocument> | null = null;

const temporaryUsers: Array<Omit<IUser, 'passwordHash'>> = [
  {
    id: 'usr_admin',
    name: 'Alex Johnson (Admin)',
    email: 'admin@collegecrm.edu',
    role: 'Admin',
    phone: '+1 (555) 019-2831',
    createdAt: new Date('2026-01-10T09:00:00Z').toISOString(),
  },
  {
    id: 'usr_manager',
    name: 'Sarah Connor (Sales Manager)',
    email: 'manager@collegecrm.edu',
    role: 'Sales Manager',
    phone: '+1 (555) 018-9944',
    createdAt: new Date('2026-01-12T10:00:00Z').toISOString(),
  },
  {
    id: 'usr_exec',
    name: 'David Miller (Sales Executive)',
    email: 'executive@collegecrm.edu',
    role: 'Sales Executive',
    phone: '+1 (555) 014-5521',
    createdAt: new Date('2026-01-15T11:00:00Z').toISOString(),
  },
];

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;

  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const database = client.db();
  users = database.collection<UserDocument>('users');
  await users.createIndex({ email: 1 }, { unique: true });

  const passwordHash = await bcrypt.hash('password123', 10);
  for (const temporaryUser of temporaryUsers) {
    await users.updateOne(
      { email: temporaryUser.email },
      {
        $setOnInsert: {
          ...temporaryUser,
          passwordHash,
        },
      },
      { upsert: true },
    );
  }
}

export function isMongoConnected(): boolean {
  return users !== null;
}

export function mongoUsersCollection(): Collection<UserDocument> {
  if (!users) {
    throw new Error('MongoDB user collection is not connected');
  }
  return users;
}

export function closeMongo(): Promise<void> {
  return client?.close() ?? Promise.resolve();
}

export function toUserDocument(input: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}): UserDocument {
  return {
    ...input,
    email: input.email.trim().toLowerCase(),
    phone: input.phone || '',
  };
}

export function toUser(input: UserDocument): IUser {
  return {
    id: input.id || String(input._id),
    name: input.name,
    email: input.email.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    role: input.role,
    phone: input.phone || '',
    createdAt: input.createdAt,
  };
}
