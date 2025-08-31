const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
require('dotenv').config();

const { uploadToMinIO } = require('./uploadToMinIO');
const { connectDB, saveToPostgres, ensurePart } = require('./postgresDb');

const WATCH_FOLDER = process.env.WATCH_FOLDER || './watched_images';
const uploadedSet = new Set();

async function processFile(filePath, fileName, partNumber = null) {
  try {
    if (uploadedSet.has(fileName)) {
      console.log(`🟡 Already processed in this session: ${fileName}`);
      return false;
    }
    // Check if already exists in DB
    const { client } = require('./postgresDb');
    const checkQuery = 'SELECT 1 FROM images WHERE file_name = $1';
    const checkResult = await client.query(checkQuery, [fileName]);
    if (checkResult.rowCount > 0) {
      console.log(`� Duplicate detected in DB: Skipping ${fileName}`);
      uploadedSet.add(fileName);
      return false;
    }
    console.log(`�📂 Processing new file: ${fileName}`);
    // Upload to MinIO
    const objectUrl = await uploadToMinIO(filePath, fileName, partNumber);
    // Get part_id from DB
    let part_id = null;
    if (partNumber) {
      part_id = await ensurePart(partNumber);
    }
    // Prepare metadata
    const imageData = {
      file_path: objectUrl,
      file_name: fileName,
      file_type: mime.lookup(filePath) || 'application/octet-stream',
      image_size: fs.statSync(filePath).size,
      captured_at: new Date().toISOString(),
      bucket_name: process.env.MINIO_BUCKET,
      part_id,
      camera_id: null,
      resolution: '1920x1080',
      capture_mode: 'Auto',
      notes: 'Uploaded via Node.js watcher'
    };
  // Save metadata to PostgreSQL, always pass partNumber
  await saveToPostgres(imageData, partNumber);
    uploadedSet.add(fileName);
    console.log(`✅ Uploaded and saved metadata for ${fileName}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to process ${fileName}:`, err.message);
    return false;
  }
}

async function startWatcher() {
  await connectDB();
  console.log(`👀 Watching folder: ${WATCH_FOLDER}`);

  const watcher = chokidar.watch(WATCH_FOLDER, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    awaitWriteFinish: true,
    depth: 2
  });

  watcher.on('add', async (filePath) => {
    const parentDir = path.dirname(filePath);
    const fileName = path.basename(filePath);

    if (parentDir === path.resolve(WATCH_FOLDER)) {
      await processFile(filePath, fileName);
    } else {
      const partNumber = path.basename(parentDir);
      await processFile(filePath, fileName, partNumber);
    }
  });

  watcher.on('addDir', async (folderPath) => {
    const partNumber = path.basename(folderPath);
    fs.readdir(folderPath, async (err, files) => {
      if (err) return;
      for (const file of files) {
        const imagePath = path.join(folderPath, file);
        if (fs.statSync(imagePath).isFile()) {
          await processFile(imagePath, file, partNumber);
        }
      }
    });
    watcher.add(folderPath + '/**/*');
  });

  watcher.on('ready', async () => {
    console.log('✅ Watcher started. Scanning for missed files...');
    let newFilesUploaded = 0;
    const walk = async (dir) => {
      for (const file of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          await walk(fullPath);
        } else {
          const parentDir = path.dirname(fullPath);
          const fileName = path.basename(fullPath);
          let uploaded;
          if (parentDir === path.resolve(WATCH_FOLDER)) {
            uploaded = await processFile(fullPath, fileName);
          } else {
            const partNumber = path.basename(parentDir);
            uploaded = await processFile(fullPath, fileName, partNumber);
          }
          if (uploaded) newFilesUploaded++;
        }
      }
    };
    await walk(WATCH_FOLDER);
    if (newFilesUploaded === 0) {
      console.log('No new files to upload. All files are already in the database.');
    } else {
      console.log(`${newFilesUploaded} new files uploaded.`);
    }
  });
}

startWatcher();
