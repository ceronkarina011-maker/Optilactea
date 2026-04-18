const { Pool } = require('pg');
require('dotenv').config();

let db;
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // Use SQLite for development
  const sqlite3 = require('sqlite3').verbose();
  db = new sqlite3.Database('./optilactea.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database (development mode).');
    }
  });
} else {
  // Use PostgreSQL for production
  const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
  });

  pool.on('connect', () => {
    console.log('Connected to PostgreSQL database.');
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  db = pool;
}

async function initDb() {
  if (isDevelopment) {
    // SQLite initialization
    return new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS app_state (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          data TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          db.get('SELECT id FROM app_state WHERE slug = ?', ['default'], (err, row) => {
            if (err) {
              reject(err);
            } else if (!row) {
              const defaultData = JSON.stringify({
                productores: [],
                acopios: [],
                plantas: [],
                destinos: [],
                flujos: [],
                legales: [],
                params: { km: 1.2, cap: 2500, dem: 100 }
              });
              db.run('INSERT INTO app_state (slug, data) VALUES (?, ?)', ['default', defaultData], (err) => {
                if (err) reject(err);
                else resolve();
              });
            } else {
              resolve();
            }
          });
        }
      });
    });
  } else {
    // PostgreSQL initialization
    const client = await db.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS app_state (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          data TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const result = await client.query('SELECT id FROM app_state WHERE slug = $1', ['default']);
      if (result.rows.length === 0) {
        const defaultData = JSON.stringify({
          productores: [],
          acopios: [],
          plantas: [],
          destinos: [],
          flujos: [],
          legales: [],
          params: { km: 1.2, cap: 2500, dem: 100 }
        });
        await client.query('INSERT INTO app_state (slug, data) VALUES ($1, $2)', ['default', defaultData]);
      }
    } finally {
      client.release();
    }
  }
}

async function getState() {
  if (isDevelopment) {
    // SQLite getState
    return new Promise((resolve, reject) => {
      db.get('SELECT data FROM app_state WHERE slug = ?', ['default'], (err, row) => {
        if (err) {
          reject(err);
        } else {
          try {
            const data = row ? JSON.parse(row.data) : {
              productores: [],
              acopios: [],
              plantas: [],
              destinos: [],
              flujos: [],
              legales: [],
              params: { km: 1.2, cap: 2500, dem: 100 }
            };
            resolve(data);
          } catch (e) {
            reject(e);
          }
        }
      });
    });
  } else {
    // PostgreSQL getState
    const client = await db.connect();
    try {
      const result = await client.query('SELECT data FROM app_state WHERE slug = $1', ['default']);
      if (result.rows.length > 0) {
        return JSON.parse(result.rows[0].data);
      } else {
        return {
          productores: [],
          acopios: [],
          plantas: [],
          destinos: [],
          flujos: [],
          legales: [],
          params: { km: 1.2, cap: 2500, dem: 100 }
        };
      }
    } finally {
      client.release();
    }
  }
}

async function saveState(state) {
  if (isDevelopment) {
    // SQLite saveState
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(state);
      db.run(
        'INSERT OR REPLACE INTO app_state (slug, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        ['default', data],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  } else {
    // PostgreSQL saveState
    const client = await db.connect();
    try {
      const data = JSON.stringify(state);
      await client.query(
        'INSERT INTO app_state (slug, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP',
        ['default', data]
      );
    } finally {
      client.release();
    }
  }
}

module.exports = { initDb, getState, saveState };
