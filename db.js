const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  const result = await pool.query('SELECT id FROM app_state WHERE slug = $1', ['default']);
  if (result.rowCount === 0) {
    await pool.query('INSERT INTO app_state (slug, data) VALUES ($1, $2)', ['default', {
      productores: [],
      acopios: [],
      plantas: [],
      destinos: [],
      flujos: [],
      legales: [],
      params: { km: 1.2, cap: 2500, dem: 100 }
    }]);
  }
}

async function getState() {
  const result = await pool.query('SELECT data FROM app_state WHERE slug = $1', ['default']);
  return result.rows[0]?.data || {
    productores: [],
    acopios: [],
    plantas: [],
    destinos: [],
    flujos: [],
    legales: [],
    params: { km: 1.2, cap: 2500, dem: 100 }
  };
}

async function saveState(state) {
  await pool.query(
    'INSERT INTO app_state (slug, data) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()',
    ['default', state]
  );
}

module.exports = { initDb, getState, saveState };
