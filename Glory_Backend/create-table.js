const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: { rejectUnauthorized: false } // This works if your connection is already working
});

async function createTable() {
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        blob_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log(" Table 'images' is ready.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await client.end();
  }
}

createTable();
// This script connects to a PostgreSQL database and creates a table named 'images' if it does not already exist.