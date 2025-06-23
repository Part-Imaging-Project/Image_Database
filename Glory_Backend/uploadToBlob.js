const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
require('dotenv').config();
const { connectDB, saveToPostgres } = require('./postgresDb.js');

const AZURE_STORAGE_CONNECTION_STRING = `DefaultEndpointsProtocol=https;AccountName=${process.env.AZURE_STORAGE_ACCOUNT};AccountKey=${process.env.AZURE_STORAGE_KEY};EndpointSuffix=core.windows.net`;
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);

/**
 * Upload a file to Azure Blob Storage and save metadata to PostgreSQL
 * @param {string} filePath - Full path to the file
 * @param {string} fileName - File name for blob
 */
async function uploadToBlob(filePath, fileName) {
  try {
    await connectDB();

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    console.log(`Uploading ${fileName} to Azure Blob Storage...`);

    // Automatically determine content type
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    const uploadResponse = await blockBlobClient.uploadFile(filePath, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });

    console.log(`Upload completed. Request ID: ${uploadResponse.requestId}`);
    const blobUrl = blockBlobClient.url;

    await saveToPostgres(fileName, blobUrl);
    console.log(`Metadata saved to database.`);

    return blobUrl;
  } catch (err) {
    console.error("Upload or DB save failed:", err.message);
    throw err;
  }
}

module.exports = { uploadToBlob };
