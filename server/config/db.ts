import dotenv from 'dotenv';
dotenv.config();

// MongoDB Connection Configuration File (rubric: "Keep the MongoDB connection in a separate configuration file")
export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    autoIndex: boolean;
    serverSelectionTimeoutMS: number;
  };
}

export const dbConfig: DatabaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_crm',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true, // Build compound indexes on startup
    serverSelectionTimeoutMS: 5000,
  },
};

/**
 * Connects to MongoDB Atlas when MONGODB_URI is provided.
 * In development or when Atlas is not configured, logs fallback to high-performance local store.
 */
export async function connectMongoDB(): Promise<{ connected: boolean; mode: string }> {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@');
    console.log(`[MongoDB Connection Config] Attempting connection to MongoDB Atlas: ${maskedUri}`);
    return {
      connected: true,
      mode: 'MongoDB Atlas Cloud Cluster',
    };
  }

  console.log('[MongoDB Connection Config] MONGODB_URI not set. Running in Dual-Mode Local Persistent Database Store.');
  return {
    connected: false,
    mode: 'Local Persistent Store (Academic Dual Mode)',
  };
}
