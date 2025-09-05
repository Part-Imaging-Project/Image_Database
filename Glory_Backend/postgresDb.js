const { Client } = require('pg');
require('dotenv').config();

// Create DB client using environment variables
const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: false 
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

/**
 * Ensure part exists in DB, return its ID.
 * If not found, insert it with fallback part_name = "Part <partNumber>".
 */
const ensurePart = async (partNumber) => {
  try {
    const checkQuery = 'SELECT id FROM parts WHERE part_number = $1';
    const checkResult = await client.query(checkQuery, [partNumber]);

    if (checkResult.rowCount > 0) {
      return checkResult.rows[0].id;
    }

    // Fallback — insert new part with placeholder name
    const insertQuery = `
      INSERT INTO parts (part_number, part_name)
      VALUES ($1, $2)
      RETURNING id
    `;
    const insertResult = await client.query(insertQuery, [
      partNumber,
      `Part ${partNumber}`
    ]);

    return insertResult.rows[0].id;
  } catch (err) {
    console.error('Error ensuring part:', err.message);
    throw err;
  }
};

// Save image metadata to the database
const saveToPostgres = async (imageData, partNumber = null) => {
  try {
    // Check if the filename already exists
    const checkQuery = 'SELECT 1 FROM images WHERE file_name = $1';
    const checkResult = await client.query(checkQuery, [imageData.file_name]);

    if (checkResult.rowCount > 0) {
      console.log(`Duplicate detected: Skipping ${imageData.file_name}`);
      return null;
    }

    // If partNumber provided, ensure part exists
    let partId = null;
    if (partNumber) {
      partId = await ensurePart(partNumber);
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
      partId,
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
      imageResult.rows[0].id, // this uses the ID of the newly inserted image
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

const getImagesByPartNumber = async (partNumber) => {
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
      WHERE p.part_number = $1
      ORDER BY i.captured_at DESC;
    `;

    const result = await client.query(query, [partNumber]);
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
  getImagesByPartNumber,
  updateImage,
  deleteImage,
  ensurePart,
  ensurePart
};
