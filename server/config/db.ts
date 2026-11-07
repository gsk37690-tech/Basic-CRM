import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../models/UserModel.ts';
import { LeadModel } from '../models/LeadModel.ts';
import { ContactModel } from '../models/ContactModel.ts';
import { DealModel } from '../models/DealModel.ts';
import { ActivityModel } from '../models/ActivityModel.ts';
import { FollowUpModel } from '../models/FollowUpModel.ts';
import bcrypt from 'bcryptjs';

dotenv.config();

export interface DatabaseConfig {
  uri: string;
  options: {
    autoIndex: boolean;
    serverSelectionTimeoutMS: number;
  };
}

export const dbConfig: DatabaseConfig = {
  uri: process.env.MONGODB_URI || '',
  options: {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
  },
};

/**
 * Connects to MongoDB (MongoDB Atlas or Local MongoDB) using Mongoose.
 * If uri is provided, connects directly. Otherwise checks process.env.MONGODB_URI.
 */
export async function connectMongoDB(customUri?: string): Promise<{
  connected: boolean;
  mode: string;
  message: string;
  database?: string;
  host?: string;
}> {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.log('[MongoDB Config] MONGODB_URI not provided. Running in Dual-Mode Memory Store.');
    return {
      connected: false,
      mode: 'Memory Store (Dual-Mode Fallback)',
      message: 'MONGODB_URI is not set. To see data in MongoDB Compass, provide your MongoDB connection string in .env or the Database Settings.',
    };
  }

  const trimmedUri = uri.trim();
  const maskedUri = trimmedUri.replace(/:([^@]+)@/, ':****@');

  try {
    // If already connected to college_crm
    if (mongoose.connection.readyState === 1 && mongoose.connection.name === 'college_crm') {
      const dbName = mongoose.connection.name;
      const host = mongoose.connection.host;
      return {
        connected: true,
        mode: 'MongoDB Atlas / Compass',
        message: `Already connected to MongoDB database [${dbName}] at ${host}`,
        database: dbName,
        host,
      };
    }

    // Disconnect previous if in connecting, connected, or disconnecting state
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Extract dbName from URI if explicitly provided, else fallback to 'college_crm'
    let targetDbName = 'college_crm';
    try {
      const parsedPath = trimmedUri.split('?')[0].split('/').pop();
      if (parsedPath && parsedPath.trim()) {
        targetDbName = parsedPath.trim();
      }
    } catch (_) {}

    console.log(`[MongoDB Config] Connecting to MongoDB: ${maskedUri} [Database: ${targetDbName}]...`);
    await mongoose.connect(trimmedUri, {
      dbName: targetDbName,
      serverSelectionTimeoutMS: 8000,
    });

    const dbName = mongoose.connection.name || targetDbName;
    const host = mongoose.connection.host || 'cluster';
    console.log(`[MongoDB Config] Connected to MongoDB host ${host}, database: "${dbName}"`);

    // Verify database permissions and seed default data
    try {
      await seedMongooseIfEmpty();
    } catch (permErr: any) {
      if (permErr.message && permErr.message.includes('not allowed to do action')) {
        console.warn(`[MongoDB Config] Atlas Permission Error: ${permErr.message}`);
        return {
          connected: false,
          mode: 'MongoDB Atlas (Permission Denied)',
          message: `Connected to MongoDB Atlas cluster, but your database user does not have permission to read/write to database "${dbName}". In MongoDB Atlas, navigate to Database Access -> Edit User -> select "Built-in Role: Read and write to any database".`,
          database: dbName,
          host,
        };
      }
    }

    return {
      connected: true,
      mode: 'MongoDB Atlas / Compass Live Connection',
      message: `Connected successfully to database "${dbName}"! All new users and records will reflect live in MongoDB Compass.`,
      database: dbName,
      host,
    };
  } catch (err: any) {
    console.error(`[MongoDB Config] Connection failure: ${err.message}`);
    return {
      connected: false,
      mode: 'Memory Store (Connection Failed)',
      message: `Failed to connect to MongoDB: ${err.message}. Please check your connection string, password, and Atlas Network Access (IP Whitelist 0.0.0.0/0).`,
    };
  }
}

/**
 * Returns the current live status of the database connection
 */
export function getDbStatus(): {
  connected: boolean;
  readyState: number;
  mode: string;
  database?: string;
  host?: string;
  uriMasked?: string;
} {
  const ready = mongoose.connection.readyState === 1;
  const uri = process.env.MONGODB_URI || '';
  const masked = uri ? uri.replace(/:([^@]+)@/, ':****@') : undefined;

  return {
    connected: ready,
    readyState: mongoose.connection.readyState,
    mode: ready ? 'MongoDB Atlas / Compass (Live)' : 'Dual-Mode Memory Store',
    database: ready ? mongoose.connection.name : undefined,
    host: ready ? mongoose.connection.host : undefined,
    uriMasked: masked,
  };
}

/**
 * Seeds initial academic users and leads to MongoDB if the collection is empty
 */
async function seedMongooseIfEmpty() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('[MongoDB Config] Empty collection detected. Seeding initial academic accounts to MongoDB...');
      const defaultPasswordHash = await bcrypt.hash('password123', 10);

      const adminUser = await UserModel.create({
        name: 'Alex Johnson (Admin)',
        email: 'admin@collegecrm.edu',
        passwordHash: defaultPasswordHash,
        role: 'Admin',
        phone: '+1 (555) 019-2831',
      });

      const managerUser = await UserModel.create({
        name: 'Sarah Connor (Sales Manager)',
        email: 'manager@collegecrm.edu',
        passwordHash: defaultPasswordHash,
        role: 'Sales Manager',
        phone: '+1 (555) 018-9944',
      });

      const execUser = await UserModel.create({
        name: 'David Miller (Sales Executive)',
        email: 'executive@collegecrm.edu',
        passwordHash: defaultPasswordHash,
        role: 'Sales Executive',
        phone: '+1 (555) 014-5521',
      });

      // Seed sample leads
      await LeadModel.create([
        {
          name: 'Robert Vance',
          company: 'Vance Refrigeration',
          email: 'robert@vancerefrig.com',
          phone: '+1 (555) 349-8812',
          source: 'Referral',
          status: 'Qualified',
          quality: 'Hot',
          assignedTo: execUser._id,
          estimatedValue: 45000,
          notes: 'Needs 25 commercial refrigeration units with 24/7 maintenance contract.',
        },
        {
          name: 'Angela Martin',
          company: 'Dunder Mifflin Accounting',
          email: 'angela@dundermifflin.com',
          phone: '+1 (555) 923-4411',
          source: 'Website',
          status: 'Proposal',
          quality: 'Warm',
          assignedTo: managerUser._id,
          estimatedValue: 18500,
          notes: 'Interested in automated invoice reconciliation and CRM integration.',
        },
        {
          name: 'Stanley Hudson',
          company: 'Hudson Logistics Ltd',
          email: 'stanley@hudsonlogistics.com',
          phone: '+1 (555) 881-2309',
          source: 'Cold Call',
          status: 'Contacted',
          quality: 'Cold',
          assignedTo: execUser._id,
          estimatedValue: 12000,
          notes: 'Requested product catalog and bulk pricing discount tiers.',
        },
      ]);

      console.log('[MongoDB Config] Database seed complete! Users and Leads are now visible in MongoDB Compass.');
    }
  } catch (err: any) {
    console.error('[MongoDB Config] Seeding error (non-fatal):', err.message);
  }
}
