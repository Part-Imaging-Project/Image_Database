const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
require('dotenv').config();
const { connectDB, saveToPostgres } = require('./postgresDb');
const { Client } = require('minio');

// MinIO client setup
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Upload file to MinIO and save metadata
// Accepts filePath, fileName, and optionally partNumber (from folder)
async function uploadToMinIO(filePath, fileName, partNumber = null, cameraId = null) {
  try {
    await connectDB();

    const bucketName = process.env.MINIO_BUCKET;
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    const fileSize = fs.statSync(filePath).size;

    // Make sure the bucket exists
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Created bucket: ${bucketName}`);
    }

    // Upload file
    const metaData = { 'Content-Type': contentType };
    await minioClient.fPutObject(bucketName, fileName, filePath, metaData);
    console.log(`Uploaded to MinIO: ${fileName}`);

    // Generate public URL (if configured)
    const objectUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${fileName}`;

    // Prepare metadata for PostgreSQL
    // If partNumber is provided, look up part_id from DB
    let part_id = null;
    if (partNumber) {
      // Check if part exists
      const partRes = await connectDB().then(async () => {
        return await require('./postgresDb').client.query('SELECT id FROM parts WHERE part_number = $1', [partNumber]);
      });
      if (partRes && partRes.rows.length > 0) {
        part_id = partRes.rows[0].id;
      } else {
        // Create new part entry with default values
        const insertPartRes = await require('./postgresDb').client.query(
          'INSERT INTO parts (part_name, part_number, description, category, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
          [partNumber, partNumber, 'Auto-created by watcher', 'Uncategorized']
        );
        part_id = insertPartRes.rows[0].id;
        console.log(`Created new part entry for part number: ${partNumber}`);
      }
    }
    const imageData = {
      file_path: objectUrl,
      file_name: fileName,
      file_type: contentType,
      image_size: fileSize,
      captured_at: new Date().toISOString(),
      bucket_name: bucketName,
      part_id: part_id,
      camera_id: cameraId,
      resolution: '1920x1080', // Example value; can be dynamic
      capture_mode: 'Auto',     // Example value; can be dynamic
      notes: 'Uploaded via Node.js watcher' // Example note
    };

    // Save to PostgreSQL
    await saveToPostgres(imageData);
    console.log(`Saved metadata to DB.`);

    return objectUrl;
  } catch (err) {
    console.error("Upload or DB save failed:", err.message);
    throw err;
  }
}

module.exports = { uploadToMinIO };