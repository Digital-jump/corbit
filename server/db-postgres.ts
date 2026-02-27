import { Pool } from 'pg';

// NOTE: This file demonstrates the PostgreSQL implementation for the Multi-Tenant Database Strategy.
// In this preview environment, we are using SQLite (server/db.ts) because a persistent PostgreSQL service is not available.
// To switch to production:
// 1. Provision a PostgreSQL instance (e.g., AWS RDS, Google Cloud SQL).
// 2. Set DATABASE_URL env var.
// 3. Swap imports in server/routes.ts to use this file instead of server/db.ts.

const systemPool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g. postgres://user:pass@host:5432/system_db
  max: 20,
});

// Cache for tenant pools to avoid recreating connections
const tenantPools: Record<string, Pool> = {};

export async function getTenantDb(tenantId: string) {
  if (tenantPools[tenantId]) {
    return tenantPools[tenantId];
  }

  // In a real Postgres multi-tenant setup, we have two main strategies:
  // 1. Schema-per-tenant (Shared Database, Separate Schemas) - Cost effective, good isolation.
  // 2. Database-per-tenant (Separate Databases) - Maximum isolation, higher overhead.
  
  // Implements Strategy 2: Database-per-tenant (as requested)
  
  // Note: The system user needs 'CREATEDB' permission to provision new tenants.
  // Here we assume the DB already exists or we connect to a specific one.
  // For dynamic creation, we would use the systemPool to run `CREATE DATABASE "tenant_${tenantId}"`.

  const tenantPool = new Pool({
    connectionString: process.env.DATABASE_URL?.replace('system_db', `tenant_${tenantId}`),
    max: 10,
  });

  tenantPools[tenantId] = tenantPool;
  return tenantPool;
}

export const systemDb = {
  query: (text: string, params?: any[]) => systemPool.query(text, params),
};
