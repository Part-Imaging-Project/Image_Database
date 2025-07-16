const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mime = require('mime-types'); // ✅ Now imported

const { uploadToMinIO } = require('./uploadToMinIO');
const { client, connectDB, saveToPostgres } = require('./postgresDb');

// Configuration
const WATCH_FOLDER = process.env.WATCH_FOLDER || './watched_images';

// Track uploaded files
const uploadedSet = new Set();

/**
 * Process a single file for upload and metadata saving.
 * @param {string} filePath - Path to the file.
 * @param {string} fileName - Name of the file.
 */
async function processFile(filePath, fileName) {
  try {
    // Skip if already processed
    if (uploadedSet.has(fileName)) {
      console.log(`🟡 Already processed: ${fileName}`);
      return;
    }

    console.log(`📂 Processing new file: ${fileName}`);

    // Check if already exists in DB
    const checkQuery = 'SELECT 1 FROM images WHERE file_name = $1';
    const checkResult = await client.query(checkQuery, [fileName]);

    if (checkResult.rowCount > 0) {
      console.log(`🟠 Duplicate detected: Skipping ${fileName}`);

      // Optional: Delete local duplicate file immediately
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted duplicate file: ${filePath}`);
      uploadedSet.add(fileName);
      return;
    }

    // Upload to MinIO
    const objectUrl = await uploadToMinIO(filePath, fileName);

    // Prepare metadata for PostgreSQL
    const imageData = {
      file_path: objectUrl,
      file_name: fileName,
      file_type: mime.lookup(filePath) || 'application/octet-stream',
      image_size: fs.statSync(filePath).size,
      captured_at: new Date().toISOString(),
      bucket_name: process.env.MINIO_BUCKET,
      part_id: null,
      camera_id: null,
      resolution: '1920x1080',
      capture_mode: 'Auto',
      notes: 'Uploaded via Node.js watcher'
    };

    // Save metadata to PostgreSQL
    await saveToPostgres(imageData);
    uploadedSet.add(fileName);

    // Optional: Delete local file after successful upload and DB save
    fs.unlinkSync(filePath);
    console.log(`✅ Uploaded and saved metadata for ${fileName}`);
    console.log(`🗑️ Deleted local file: ${filePath}`);

  } catch (err) {
    console.error(`❌ Failed to process ${fileName}:`, err.message);
  }
}

/**
 * Start watching the folder for new files
 */
async function startWatcher() {
  try {
    await connectDB();
    console.log(`👀 Watching folder: ${WATCH_FOLDER}`);

    const watcher = chokidar.watch(WATCH_FOLDER, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      awaitWriteFinish: true,
    });

    watcher.on('add', async (filePath) => {
      const fileName = path.basename(filePath);
      await processFile(filePath, fileName);
    });

    console.log('✅ Watcher started successfully.');
  } catch (err) {
    console.error('❌ Failed to start watcher:', err.message);
  }
}

startWatcher();