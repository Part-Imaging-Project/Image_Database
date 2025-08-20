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
// Accepts optional partNumber for folder uploads
async function processFile(filePath, fileName, partNumber = null) {
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
      // fs.unlinkSync(filePath); // Commented out: Do not delete duplicate file
      // console.log(`🗑️ Deleted duplicate file: ${filePath}`);
      uploadedSet.add(fileName);
      return;
    }

    // Upload to MinIO
  // Pass partNumber if available
  const objectUrl = await uploadToMinIO(filePath, fileName, partNumber);

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
  // fs.unlinkSync(filePath); // Commented out: Do not delete file after upload
  console.log(`✅ Uploaded and saved metadata for ${fileName}`);
  // console.log(`🗑️ Deleted local file: ${filePath}`);

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

      depth: 2 // allow folder detection one level deep
    });

    // Handle single image file addition
    watcher.on('add', async (filePath) => {
      const parentDir = path.dirname(filePath);
      const fileName = path.basename(filePath);
      // If file is directly in WATCH_FOLDER, treat as single image
      if (parentDir === path.resolve(WATCH_FOLDER)) {
        console.log(`Detected new image: ${fileName} in root folder.`);
        await processFile(filePath, fileName);
      } else {
        // If file is inside a folder, treat folder name as part number
        const partNumber = path.basename(parentDir);
        console.log(`Detected new image: ${fileName} in folder ${partNumber}.`);
        await processFile(filePath, fileName, partNumber);
      }
    });

    // Handle new folder addition (batch upload)
    watcher.on('addDir', async (folderPath) => {
      const partNumber = path.basename(folderPath);
      fs.readdir(folderPath, async (err, files) => {
        if (err) return;
        for (const file of files) {
          const imagePath = path.join(folderPath, file);
          if (fs.statSync(imagePath).isFile()) {
            console.log(`Detected image in new folder: ${file} (part: ${partNumber})`);
            await processFile(imagePath, file, partNumber);
          }
        }
      });
      // Also watch for new files added to this folder after creation
      watcher.add(folderPath + '/**/*');
    });

    // On startup, scan all files in watched_images and subfolders for missed uploads
    watcher.on('ready', async () => {
      console.log('Watcher is ready. Scanning for missed files...');
      const walk = (dir) => {
        fs.readdirSync(dir).forEach(file => {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
          } else {
            const parentDir = path.dirname(fullPath);
            const fileName = path.basename(fullPath);
            if (parentDir === path.resolve(WATCH_FOLDER)) {
              processFile(fullPath, fileName);
            } else {
              const partNumber = path.basename(parentDir);
              processFile(fullPath, fileName, partNumber);
            }
          }
        });
      };
      walk(WATCH_FOLDER);
    });

    console.log('✅ Watcher started successfully.');
  } catch (err) {
    console.error('❌ Failed to start watcher:', err.message);
  }
}

startWatcher();