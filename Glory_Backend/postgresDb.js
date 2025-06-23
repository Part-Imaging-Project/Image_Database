const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Create DB client using environment variables
const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: {
       rejectUnauthorized: true
  }
});

// Connect to database
let isConnected = false; // Keep track of connection status

const connectDB = async () => {
  if (!isConnected) {
    try {
      await client.connect();
      console.log('Connected to Azure PostgreSQL!');
      isConnected = true;
    } catch (err) {
      console.error('Connection error:', err);
      throw err;
    }
  }
};

// Save filename and blob URL to the database
const saveToPostgres = async (filename, blobUrl) => {
  try {
    // Check if the filename already exists
    const checkQuery = 'SELECT 1 FROM images WHERE filename = $1';
    const checkResult = await client.query(checkQuery, [filename]);

    if (checkResult.rowCount > 0) {
      console.log(`Duplicate detected: Skipping ${filename}`);
      return null;
    }

    const insertQuery = `
      INSERT INTO images (filename, blob_url, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *;
    `;
    const values = [filename, blobUrl];
    const result = await client.query(insertQuery, values);
    console.log('Saved to DB:', result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('Error saving to DB:', err);
    throw err;
  }
};

// Retrieve all images
const getImages = async () => {
  try {
    const result = await client.query('SELECT * FROM images ORDER BY created_at DESC');
    return result.rows;
  } catch (err) {
    console.error('Query error:', err);
    return [];
  }
};

module.exports = {
  connectDB,
  saveToPostgres,
  getImages
};
// This module connects to a PostgreSQL database using the pg library.
// It provides functions to save image metadata (filename and blob URL) to the database
// and retrieve all images. The connection details are stored in environment variables.