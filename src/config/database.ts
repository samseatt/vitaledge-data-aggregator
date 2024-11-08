// src/config/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://samseatt:password@localhost:5432/vitaledge_datalake',
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL with TimescaleDB');
});

export default pool;
