import dotenv from 'dotenv';
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

export async function connectMongoDB(): Promise<{ connected: boolean; mode: string }> {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@');
    console.log(`[MongoDB] Connecting to MongoDB: ${maskedUri}`);
    await connectMongo();
    return {
      connected: true,
      mode: 'MongoDB',
    };
  }

  console.log('[MongoDB] MONGODB_URI not set; using the local development store.');
  return {
    connected: false,
    mode: 'Local development store',
  };
}
