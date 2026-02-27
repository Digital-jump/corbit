import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// --- System Database (Global) ---
const systemDbPath = path.join(DATA_DIR, 'system.db');
export const systemDb = new Database(systemDbPath);

// Initialize System Schema
systemDb.exec(`
  CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'trial', -- 'trial', 'small_business', 'enterprise'
    status TEXT DEFAULT 'active',
    trial_ends_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users_lookup (
    email TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL, -- 'super_admin', 'admin', 'hr', 'manager', 'employee'
    FOREIGN KEY(tenant_id) REFERENCES tenants(id)
  );
`);

// --- Tenant Database Manager ---
const tenantDbs: Record<string, Database.Database> = {};

export function getTenantDb(tenantId: string): Database.Database {
  if (tenantDbs[tenantId]) {
    return tenantDbs[tenantId];
  }

  const dbPath = path.join(DATA_DIR, `tenant_${tenantId}.db`);
  const db = new Database(dbPath);
  
  // Initialize Tenant Schema (Idempotent)
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      department TEXT,
      job_title TEXT,
      role TEXT NOT NULL,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      status TEXT, -- 'present', 'absent', 'late'
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS payroll (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      base_salary INTEGER NOT NULL,
      bonuses INTEGER DEFAULT 0,
      deductions INTEGER DEFAULT 0,
      net_pay INTEGER NOT NULL,
      status TEXT DEFAULT 'draft', -- 'draft', 'processed', 'paid'
      generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT,
      assigned_by TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      channel TEXT DEFAULT 'general',
      sender_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      details TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  tenantDbs[tenantId] = db;
  return db;
}
