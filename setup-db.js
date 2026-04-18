const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  // Connect to default postgres database first
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('Creating database...');
    await pool.query('CREATE DATABASE optilactea;');
    console.log('Database created successfully!');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database already exists.');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }

  // Now connect to the optilactea database and create tables
  const appPool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
  });

  try {
    console.log('Creating tables...');
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tables created successfully!');
  } finally {
    await appPool.end();
  }
}

setupDatabase().catch(console.error);