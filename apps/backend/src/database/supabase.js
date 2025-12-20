/**
 * RARE 4N - Supabase Connection
 * اتصال Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fgvrilruqzajstprioqj.supabase.co';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || 'REDACTED';

let supabase = null;

/**
 * Initialize Supabase client
 */
export function initSupabase() {
  try {
    if (supabase) {
      return supabase;
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    console.log('✅ Supabase connected successfully');
    return supabase;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    throw error;
  }
}

/**
 * Get Supabase client
 */
export function getSupabase() {
  if (!supabase) {
    return initSupabase();
  }
  return supabase;
}

/**
 * Hybrid Database Strategy
 * Uses MongoDB for main data + Supabase for real-time features
 */
export class HybridDatabase {
  constructor() {
    this.mongodb = null;
    this.supabase = null;
  }

  async init() {
    try {
      // Initialize MongoDB
      const { initMongoDB } = await import('./mongodb.js');
      this.mongodb = await initMongoDB();

      // Initialize Supabase
      this.supabase = initSupabase();

      return {
        mongodb: this.mongodb,
        supabase: this.supabase,
      };
    } catch (error) {
      console.error('HybridDatabase init error:', error);
      throw error;
    }
  }

  /**
   * Save to MongoDB (main storage)
   */
  async saveToMongo(collection, data) {
    if (!this.mongodb) {
      throw new Error('MongoDB not initialized');
    }
    return await this.mongodb.collection(collection).insertOne(data);
  }

  /**
   * Save to Supabase (real-time sync)
   */
  async saveToSupabase(table, data) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }
    const { data: result, error } = await this.supabase.from(table).insert(data);
    if (error) throw error;
    return result;
  }

  /**
   * Get from MongoDB
   */
  async getFromMongo(collection, query = {}) {
    if (!this.mongodb) {
      throw new Error('MongoDB not initialized');
    }
    return await this.mongodb.collection(collection).find(query).toArray();
  }

  /**
   * Get from Supabase
   */
  async getFromSupabase(table, query = {}) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }
    const { data, error } = await this.supabase.from(table).select('*').match(query);
    if (error) throw error;
    return data;
  }
}

export default HybridDatabase;








