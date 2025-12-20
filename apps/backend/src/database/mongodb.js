/**
 * RARE 4N - MongoDB Connection
 * اتصال MongoDB
 */

import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://algeneralns_db_user:XWeCOl0X8fd9IVjc@cluster0.u5c1uim.mongodb.net/?appName=Cluster0';

let client = null;
let db = null;

/**
 * Initialize MongoDB connection
 */
export async function initMongoDB() {
  try {
    if (client) {
      return db;
    }

    client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    await client.db('admin').command({ ping: 1 });
    
    db = client.db('rare4n');
    console.log('✅ MongoDB connected successfully');

    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Get MongoDB database instance
 */
export function getMongoDB() {
  if (!db) {
    throw new Error('MongoDB not initialized. Call initMongoDB() first.');
  }
  return db;
}

/**
 * Close MongoDB connection
 */
export async function closeMongoDB() {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      console.log('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ MongoDB close error:', error);
  }
}

/**
 * MongoDB Collections
 */
export const Collections = {
  users: 'users',
  sessions: 'sessions',
  conversations: 'conversations',
  files: 'files',
  vault: 'vault',
  builds: 'builds',
  logs: 'logs',
  settings: 'settings',
  awareness: 'awareness',
  consciousness: 'consciousness',
};
