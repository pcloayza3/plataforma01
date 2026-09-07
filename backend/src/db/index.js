import pkg from "pg";
const { Pool } = pkg;

const connectionString = process.env.POSTGRES_URL || "postgresql://platuser:platpassword@localhost:5432/plataforma01_db";

export let pool = null;
let isConnected = false;

// Fallback in-memory para garantizar aislamiento y velocidad
export const memoryDb = {
  users: new Map(),
  profiles: new Map(),
  consultantProfiles: new Map(),
  companyProfiles: new Map(),
  institutionProfiles: new Map()
};

export async function initDbConnection() {
  if (pool) return pool;

  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000
    });

    const client = await pool.connect();
    isConnected = true;
    client.release();
    console.log(`[Database] Conectado exitosamente a PostgreSQL.`);
    return pool;
  } catch (err) {
    console.warn(`[Database] PostgreSQL no disponible (${err.message}). Utilizando persistencia adaptativa in-memory.`);
    isConnected = false;
    return null;
  }
}

export function isDbConnected() {
  return isConnected;
}

export async function query(text, params = []) {
  if (isConnected && pool) {
    return pool.query(text, params);
  }
  return null;
}
