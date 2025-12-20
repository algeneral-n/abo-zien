/**
 * RARE 4N - Supabase Connection
 * ?????????? Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_KEY=REPLACE_ME
const SUPABASE_KEY=REPLACE_ME

let supabase_KEY=REPLACE_ME

/**
 * Initialize Supabase client
 */
export function initSupabase() {
  try {
    if (supabase) {
      return supabase;
    }

    supabase_KEY=REPLACE_ME
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    console.log('??? Supabase connected successfully');
    return supabase;
  } catch (error) {
    console.error('??? Supabase connection error:', error);
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
    this.supabase_KEY=REPLACE_ME
  }

  async init() {
    try {
      // Initialize MongoDB
      const { initMongoDB } = await import('./mongodb.js');
      this.mongodb = await initMongoDB();

      // Initialize Supabase
      this.supabase_KEY=REPLACE_ME

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










