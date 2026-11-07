import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { db } from '../db/connection.ts';
import { connectMongo } from '../db/mongo.ts';
dotenv.config();

export interface DatabaseConfig {
  uri: string;
  options: {
    serverSelectionTimeoutMS: number;
  };
}

export const dbConfig: DatabaseConfig = {
  uri: process.env.MONGODB_URI || '',
  options: {
    serverSelectionTimeoutMS: 5000,
  },
};

let dbStatus = {
  connected: false,
  mode: 'Local development store',
};

export async function connectMongoDB(uri = process.env.MONGODB_URI): Promise<{ connected: boolean; mode: string }> {
  const mongoUri = uri?.trim();
  if (mongoUri) {
    process.env.MONGODB_URI = mongoUri;
    const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@');
    console.log(`[MongoDB] Connecting to MongoDB: ${maskedUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    await connectMongo();
    await db.waitUntilReady();
    await db.hydrateFromMongo();
    dbStatus = {
      connected: true,
      mode: 'MongoDB',
    };
    return dbStatus;
  }

  console.log('[MongoDB] MONGODB_URI not set; using the local development store.');
  dbStatus = { connected: false, mode: 'Local development store' };
  return dbStatus;
}

export function getDbStatus(): { connected: boolean; mode: string } {
  return dbStatus;
}
