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
async function uploadToMinIO(filePath, fileName, partId, cameraId) {
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
    const imageData = {
      file_path: objectUrl,
      file_name: fileName,
      file_type: contentType,
      image_size: fileSize,
      captured_at: new Date().toISOString(),
      bucket_name: bucketName,
      part_id: partId,
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