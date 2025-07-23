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
  ssl: false // no need for SSL in local development
});

// Connect to database
let isConnected = false; // Keep track of connection status

const connectDB = async () => {
  if (!isConnected) {
    try {
      await client.connect();
      console.log('Connected to local PostgreSQL!');
      isConnected = true;
    } catch (err) {
      console.error('Connection error:', err);
      throw err;
    }
  }
};

// Save image metadata to the database
const saveToPostgres = async (imageData) => {
  try {
    // Check if the filename already exists
    const checkQuery = 'SELECT 1 FROM images WHERE file_name = $1';
    const checkResult = await client.query(checkQuery, [imageData.file_name]);

    if (checkResult.rowCount > 0) {
      console.log(`Duplicate detected: Skipping ${imageData.file_name}`);
      return null;
    }

    // Insert into images table
    const insertImageQuery = `
      INSERT INTO images (
        file_path, file_name, file_type, image_size, captured_at, bucket_name, part_id, camera_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      imageData.file_path,
      imageData.file_name,
      imageData.file_type,
      imageData.image_size,
      imageData.captured_at,
      imageData.bucket_name,
      imageData.part_id,
      imageData.camera_id
    ];
    const imageResult = await client.query(insertImageQuery, values);

    // Insert into metadata table
    const insertMetadataQuery = `
      INSERT INTO metadata (
        image_id, resolution, capture_mode, notes
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const metadataValues = [
      imageResult.rows[0].id, // Use the ID of the newly inserted image
      imageData.resolution,
      imageData.capture_mode,
      imageData.notes
    ];
    const metadataResult = await client.query(insertMetadataQuery, metadataValues);

    console.log('Saved metadata to DB:', imageResult.rows[0], metadataResult.rows[0]);
    return { image: imageResult.rows[0], metadata: metadataResult.rows[0] };
  } catch (err) {
    console.error('Error saving to DB:', err);
    throw err;
  }
};

// Retrieve all images with metadata
const getImages = async () => {
  try {
const query = `
  SELECT 
    i.id AS image_id,
    i.file_path, i.file_name, i.file_type, i.image_size, i.captured_at, i.bucket_name,
    p.part_name, p.part_number,
    c.device_model, c.location, c.serial_number,
    m.resolution, m.capture_mode, m.notes
  FROM images i
  LEFT JOIN parts p ON i.part_id = p.id
  LEFT JOIN camera c ON i.camera_id = c.id
  LEFT JOIN metadata m ON i.id = m.image_id
  ORDER BY i.captured_at DESC;
`;
    const result = await client.query(query);
    return result.rows;
  } catch (err) {
    console.error('Query error:', err);
    return [];
  }
};

const updateImage = async (id, fields) => {
    const keys = Object.keys(fields).filter(key => fields[key] !== undefined);
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = keys.map(key => fields[key]);

    try {
        const query = `
            UPDATE images
            SET ${setClause}
            WHERE id = $${values.length + 1}
            RETURNING *
        `;
        const result = await client.query(query, [...values, id]);
        return result.rows[0];
    } catch (err) {
        console.error('Error updating image:', err.message);
        throw err;
    }
};

const deleteImage = async (id) => {
    try {
        const query = 'DELETE FROM images WHERE id = $1 RETURNING *';
        const result = await client.query(query, [id]);
        return result.rows[0];
    } catch (err) {
        console.error('Error deleting image:', err.message);
        throw err;
    }
};

module.exports = {
   client, 
  connectDB,
  saveToPostgres,
  getImages,
  updateImage,
  deleteImage
};