// test-upload.js
const path = require('path');
const { uploadToMinIO } = require('./uploadToMinIO');

// Define the local image file to upload
const fileName = 'd.image.jpeg'; // Change this to match your test image
const filePath = path.join(__dirname, 'test-images', fileName);

(async () => {
  try {
    const blobUrl = await uploadToBlob(filePath, fileName);
    console.log(`File uploaded successfully to: ${blobUrl}`);
  } catch (err) {
    console.error(`Upload failed: ${err.message}`);
  }
})();
// This script tests the upload functionality by uploading a local image file to minIO Blob Storage.