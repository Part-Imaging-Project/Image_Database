// This script saves the filename and blob URL to a PostgreSQL database
// uploadToBlob.js
// This script uploads a file to Azure Blob Storage and saves metadata to PostgreSQL.

const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { connectDB, saveToPostgres } = require('./postgresDb.js');

// Construct the connection string from environment variables
const AZURE_STORAGE_CONNECTION_STRING = `DefaultEndpointsProtocol=https;AccountName=${process.env.AZURE_STORAGE_ACCOUNT};AccountKey=${process.env.AZURE_STORAGE_KEY};EndpointSuffix=core.windows.net`;

// Create Blob service client
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Reference the container
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);

/**
 * Upload a file to Azure Blob Storage and save metadata to PostgreSQL
 * @param {string} filePath - Full path to the file
 * @param {string} fileName - File name for blob
 */
async function uploadToBlob(filePath, fileName) {
  try {
    // Connect to PostgreSQL
    await connectDB();

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    console.log(`Uploading ${fileName} to Azure Blob Storage...`);

    // Upload the file
    const uploadResponse = await blockBlobClient.uploadFile(filePath);
    console.log(`Upload completed. Request ID: ${uploadResponse.requestId}`);

    const blobUrl = blockBlobClient.url;

    // Save metadata to PostgreSQL
    await saveToPostgres(fileName, blobUrl);

    console.log(`Metadata saved to database.`);
    return blobUrl;
  } catch (err) {
    console.error("Upload or DB save failed:", err.message);
    throw err;
  }
}

module.exports = { uploadToBlob };
