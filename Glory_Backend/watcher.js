// watcher.js
// Watches a folder for new images, uploads them to Azure Blob Storage, and saves metadata to PostgreSQL

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { uploadToBlob } = require('./uploadToBlob');
const { connectDB, saveToPostgres } = require('./postgresDb');

const WATCH_FOLDER = process.env.WATCH_FOLDER || './watched_images';
const INTERVAL = (parseInt(process.env.WATCH_INTERVAL) || 30) * 1000;

const uploadedSet = new Set();

async function processNewImages() {
  const files = fs.readdirSync(WATCH_FOLDER);

  for (const file of files) {
    const filePath = path.join(WATCH_FOLDER, file);

    // Skip if already uploaded or it's not a file
    if (!uploadedSet.has(file) && fs.statSync(filePath).isFile()) {
      try {
        const blobUrl = await uploadToBlob(filePath, file);
        await saveToPostgres(file, blobUrl);
        uploadedSet.add(file);
        console.log(`✅ Uploaded and saved metadata for ${file}`);
      } catch (err) {
        console.error(`❌ Failed to process ${file}:`, err.message);
      }
    }
  }
}

async function startWatcher() {
  try {
    await connectDB();
    console.log(` Watching ${WATCH_FOLDER} every ${INTERVAL / 1000}s...`);

    setInterval(() => {
      processNewImages();
    }, INTERVAL);
  } catch (err) {
    console.error(' Failed to start watcher:', err.message);
  }
}

startWatcher();
// Handle graceful shutdown