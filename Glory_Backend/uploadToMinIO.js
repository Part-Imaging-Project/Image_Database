const fs = require('fs');
const { Client } = require('minio');
require('dotenv').config();

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

/**
 * Uploads a file to MinIO and returns the object URL.
 * Ensures the key (object path) matches the file_path saved in Postgres.
 *
 * @param {string} filePath - Local file path.
 * @param {string} fileName - File name to save in bucket.
 * @param {string|null} partNumber - Optional part folder name.
 * @returns {Promise<string>} - Public URL to the uploaded file.
 */
async function uploadToMinIO(filePath, fileName, partNumber = null) {
  const bucketName = process.env.MINIO_BUCKET;

  // Ensure bucket exists
  const exists = await minioClient.bucketExists(bucketName).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(bucketName, 'us-east-1');
    console.log(`🪣 Created bucket: ${bucketName}`);
  }

  // Build key (object name) → keep files under partNumber folder if provided
  const encodedFileName = encodeURIComponent(fileName);
  const objectKey = partNumber ? `${partNumber}/${encodedFileName}` : encodedFileName;

  // Upload file
  await minioClient.fPutObject(bucketName, objectKey, filePath);
  console.log(`⬆️ Uploaded ${fileName} to ${bucketName}/${objectKey}`);

  // Build public URL
  const objectUrl = `${process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectKey}`;
  return objectUrl;
}

module.exports = { uploadToMinIO };
