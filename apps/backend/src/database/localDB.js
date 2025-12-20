/**
 * ABO ZIEN - Local Database
 * SQLite-based local database for offline/online operation
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path (local file)
const DB_PATH = path.join(__dirname, '../../data/abo-zien.db');
const DB_DIR = path.dirname(DB_PATH);

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db = null;

/**
 * Initialize local database
 */
export function initDatabase() {
  try {
    db = new Database(DB_PATH);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables
    createTables();
    
    console.log('✅ Local database initialized:', DB_PATH);
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create all tables
 */
function createTables() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      password_hash TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      token TEXT UNIQUE,
      expires_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      path TEXT,
      size INTEGER,
      type TEXT,
      folder TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Invoices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      client_name TEXT,
      items TEXT, -- JSON string
      subtotal REAL,
      tax REAL,
      tax_amount REAL,
      total REAL,
      currency TEXT DEFAULT 'SAR',
      status TEXT DEFAULT 'draft',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      due_date INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Journal entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      date INTEGER,
      description TEXT,
      debit REAL,
      credit REAL,
      account TEXT,
      category TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Cognitive interactions table (for learning)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cognitive_interactions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      input TEXT,
      decision TEXT, -- JSON string
      response TEXT,
      confidence REAL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Context store table
  db.exec(`
    CREATE TABLE IF NOT EXISTS context_store (
      user_id TEXT PRIMARY KEY,
      context_data TEXT, -- JSON string
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Emergency contacts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      phone TEXT,
      relationship TEXT,
      priority INTEGER DEFAULT 1,
      notify_on_sos INTEGER DEFAULT 1,
      share_location INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Portal links table
  db.exec(`
    CREATE TABLE IF NOT EXISTS portal_links (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT,
      url TEXT,
      token TEXT UNIQUE,
      expires_at INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Vault items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vault_items (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      type TEXT,
      size INTEGER,
      path TEXT,
      encrypted INTEGER DEFAULT 1,
      uploaded_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Database tables created');
}

/**
 * Get database instance
 */
export function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Database service helpers
 */
export const DB = {
  // Users
  users: {
    create: (user) => {
      const stmt = db.prepare(`
        INSERT INTO users (id, email, name, password_hash)
        VALUES (?, ?, ?, ?)
      `);
      return stmt.run(user.id, user.email, user.name, user.passwordHash);
    },
    findByEmail: (email) => {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      return stmt.get(email);
    },
    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      return stmt.get(id);
    },
  },

  // Sessions
  sessions: {
    create: (session) => {
      const stmt = db.prepare(`
        INSERT INTO sessions (id, user_id, token, expires_at)
        VALUES (?, ?, ?, ?)
      `);
      return stmt.run(session.id, session.userId, session.token, session.expiresAt);
    },
    findByToken: (token) => {
      const stmt = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?');
      return stmt.get(token, Math.floor(Date.now() / 1000));
    },
    delete: (token) => {
      const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
      return stmt.run(token);
    },
  },

  // Files
  files: {
    create: (file) => {
      const stmt = db.prepare(`
        INSERT INTO files (id, user_id, name, path, size, type, folder)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(file.id, file.userId, file.name, file.path, file.size, file.type, file.folder);
    },
    findByUser: (userId) => {
      const stmt = db.prepare('SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC');
      return stmt.all(userId);
    },
    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM files WHERE id = ?');
      return stmt.get(id);
    },
    delete: (id) => {
      const stmt = db.prepare('DELETE FROM files WHERE id = ?');
      return stmt.run(id);
    },
  },

  // Invoices
  invoices: {
    create: (invoice) => {
      const stmt = db.prepare(`
        INSERT INTO invoices (id, user_id, client_name, items, subtotal, tax, tax_amount, total, currency, status, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        invoice.id,
        invoice.userId,
        invoice.clientName,
        JSON.stringify(invoice.items),
        invoice.subtotal,
        invoice.tax,
        invoice.taxAmount,
        invoice.total,
        invoice.currency,
        invoice.status,
        invoice.dueDate
      );
    },
    findByUser: (userId, status) => {
      if (status) {
        const stmt = db.prepare('SELECT * FROM invoices WHERE user_id = ? AND status = ? ORDER BY created_at DESC');
        return stmt.all(userId, status);
      }
      const stmt = db.prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC');
      return stmt.all(userId);
    },
    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM invoices WHERE id = ?');
      const row = stmt.get(id);
      if (row) {
        row.items = JSON.parse(row.items);
      }
      return row;
    },
  },

  // Journal entries
  journal: {
    create: (entry) => {
      const stmt = db.prepare(`
        INSERT INTO journal_entries (id, user_id, date, description, debit, credit, account, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        entry.id,
        entry.userId,
        entry.date,
        entry.description,
        entry.debit,
        entry.credit,
        entry.account,
        entry.category
      );
    },
    findByUser: (userId, startDate, endDate) => {
      if (startDate && endDate) {
        const stmt = db.prepare(`
          SELECT * FROM journal_entries 
          WHERE user_id = ? AND date >= ? AND date <= ?
          ORDER BY date DESC
        `);
        return stmt.all(userId, startDate, endDate);
      }
      const stmt = db.prepare('SELECT * FROM journal_entries WHERE user_id = ? ORDER BY date DESC');
      return stmt.all(userId);
    },
  },

  // Vault items
  vault: {
    create: (item) => {
      const stmt = db.prepare(`
        INSERT INTO vault_items (id, user_id, name, type, path, encrypted)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(item.id, item.userId, item.name, item.type, item.path, item.encrypted ? 1 : 0);
    },
    findByUser: (userId) => {
      const stmt = db.prepare('SELECT * FROM vault_items WHERE user_id = ? ORDER BY uploaded_at DESC');
      return stmt.all(userId);
    },
    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM vault_items WHERE id = ?');
      return stmt.get(id);
    },
    delete: (id) => {
      const stmt = db.prepare('DELETE FROM vault_items WHERE id = ?');
      return stmt.run(id);
    },
  },

  // Cognitive interactions (for learning)
  cognitive: {
    create: (interaction) => {
      const stmt = db.prepare(`
        INSERT INTO cognitive_interactions (id, user_id, input, decision, response, confidence)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        interaction.id,
        interaction.userId,
        interaction.input,
        JSON.stringify(interaction.decision),
        interaction.response,
        interaction.confidence
      );
    },
    findByUser: (userId, limit = 100) => {
      const stmt = db.prepare(`
        SELECT * FROM cognitive_interactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `);
      return stmt.all(userId, limit);
    },
  },

  // Context store
  context: {
    upsert: (userId, contextData) => {
      const stmt = db.prepare(`
        INSERT INTO context_store (user_id, context_data, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          context_data = ?,
          updated_at = ?
      `);
      const now = Math.floor(Date.now() / 1000);
      return stmt.run(userId, JSON.stringify(contextData), now, JSON.stringify(contextData), now);
    },
    findByUser: (userId) => {
      const stmt = db.prepare('SELECT * FROM context_store WHERE user_id = ?');
      const row = stmt.get(userId);
      if (row) {
        row.context_data = JSON.parse(row.context_data);
      }
      return row;
    },
  },

  // Emergency contacts
  emergency: {
    create: (contact) => {
      const stmt = db.prepare(`
        INSERT INTO emergency_contacts (id, user_id, name, phone, relationship, priority, notify_on_sos, share_location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        contact.id,
        contact.userId,
        contact.name,
        contact.phone,
        contact.relationship,
        contact.priority,
        contact.notifyOnSOS ? 1 : 0,
        contact.shareLocation ? 1 : 0
      );
    },
    findByUser: (userId) => {
      const stmt = db.prepare('SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY priority DESC');
      const rows = stmt.all(userId);
      return rows.map(row => ({
        ...row,
        notify_on_sos: row.notify_on_sos === 1,
        share_location: row.share_location === 1,
      }));
    },
    delete: (id) => {
      const stmt = db.prepare('DELETE FROM emergency_contacts WHERE id = ?');
      return stmt.run(id);
    },
  },

  // Portal links
  portal: {
    create: (link) => {
      const stmt = db.prepare(`
        INSERT INTO portal_links (id, user_id, type, url, token, expires_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        link.id,
        link.userId,
        link.type,
        link.url,
        link.token,
        link.expiresAt,
        link.isActive ? 1 : 0
      );
    },
    findByUser: (userId) => {
      const stmt = db.prepare('SELECT * FROM portal_links WHERE user_id = ? ORDER BY created_at DESC');
      const rows = stmt.all(userId);
      return rows.map(row => ({
        ...row,
        is_active: row.is_active === 1,
      }));
    },
    findByToken: (token) => {
      const stmt = db.prepare('SELECT * FROM portal_links WHERE token = ? AND is_active = 1');
      const row = stmt.get(token);
      if (row) {
        row.is_active = row.is_active === 1;
      }
      return row;
    },
  },

  // Vault items
  vault: {
    insert: (item) => {
      const id = item.id || `vault-${Date.now()}`;
      const stmt = db.prepare(`
        INSERT INTO vault_items (id, user_id, name, type, size, path, encrypted, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        item.userId || 'default',
        item.name,
        item.type,
        item.size,
        item.path,
        item.encrypted ? 1 : 0,
        item.uploadedAt || Math.floor(Date.now() / 1000)
      );
      return { ...item, id };
    },
    findAll: (userId) => {
      const stmt = db.prepare('SELECT * FROM vault_items WHERE user_id = ? ORDER BY uploaded_at DESC');
      const rows = stmt.all(userId || 'default');
      return rows.map(row => ({
        ...row,
        encrypted: row.encrypted === 1,
      }));
    },
    findById: (id) => {
      const stmt = db.prepare('SELECT * FROM vault_items WHERE id = ?');
      const row = stmt.get(id);
      if (row) {
        row.encrypted = row.encrypted === 1;
      }
      return row;
    },
    delete: (id) => {
      const stmt = db.prepare('DELETE FROM vault_items WHERE id = ?');
      return stmt.run(id);
    },
  },
};








