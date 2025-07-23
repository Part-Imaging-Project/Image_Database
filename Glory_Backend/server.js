// server.js
const express = require('express');

const { client, connectDB, saveToPostgres, getImages, deleteImage, updateImage } = require('./postgresDb');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client: MinioClient } = require('minio'); // Add MinIO import

// MinIO client setup
const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const app = express();
const port = process.env.SERVER_PORT || 8000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
    res.send('📷 MinIO + PostgreSQL Image Database Service');
});

// Test endpoint
app.get('/image', (req, res) => {
    const imageData = {
        id: 1,
        imageUrl: 'https://example.com/image.jpg ',
        description: 'Sample image'
    };
    res.json(imageData);
});

// Place all specific /images routes BEFORE the generic /images/:id route
app.get('/images', async (req, res) => {
    try {
        const images = await getImages();
        res.json(images);
    } catch (err) {
        console.error('Error fetching images:', err.message);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Move these above /images/:id
app.get('/images/stats', async (req, res) => {
  try {
    const count = await client.query('SELECT COUNT(*) FROM images'); // Correct table name
    const recent = await client.query('SELECT * FROM images ORDER BY captured_at DESC LIMIT 5');
    res.json({
      total_images: parseInt(count.rows[0].count),
      recent_uploads: recent.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/images/download/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM images WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    const { bucket_name, file_name } = result.rows[0]; // Use file_name as object key
    const stream = await minioClient.getObject(bucket_name, file_name);
    stream.on('error', err => {
      console.error('MinIO stream error:', err);
      res.status(500).json({ error: err && err.message ? err.message : 'Error streaming file from MinIO' });
    });
    stream.pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: err && err.message ? err.message : 'Unknown error during download' });
  }
});

// Place this route AFTER all specific /images routes
app.get('/images/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                i.id AS image_id,
                i.file_path, i.file_name, i.file_type, i.image_size, i.captured_at, i.bucket_name,
                p.part_name, p.part_number,
                c.device_model, c.location, c.serial_number,
                m.resolution, m.capture_mode, m.notes
            FROM images i
            LEFT JOIN parts p ON i.part_id = p.id
            LEFT JOIN camera c ON i.camera_id = c.id
            LEFT JOIN metadata m ON i.id = m.image_id
            WHERE i.id = $1
             ORDER BY i.captured_at DESC;
        `;
        const result = await client.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching image:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Image upload endpoint 
app.post('/upload', async (req, res) => {
  const {
    file_name,
    file_path,
    file_type,
    image_size,
    captured_at,
    bucket_name,
    part_id,
    camera_id,
    resolution,
    capture_mode,
    notes
  } = req.body;

  if (!file_name || !file_path) {
    return res.status(400).json({ error: 'Missing required fields: file_name or file_path' });
  }

  try {
    const imageData = {
      file_path,
      file_name,
      file_type: file_type || 'application/octet-stream',
      image_size: image_size || 0,
      captured_at: captured_at || new Date().toISOString(),
      bucket_name: bucket_name || process.env.MINIO_BUCKET,
      part_id: part_id || null,
      camera_id: camera_id || null,
      resolution: resolution || '1920x1080',
      capture_mode: capture_mode || 'Auto',
      notes: notes || 'Manual upload'
    };

    const saved = await saveToPostgres(imageData);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Upload failed:', err.message);
    res.status(500).json({ error: 'Failed to save image data' });
  }
});

// server.js

app.put('/images/:id', async (req, res) => {
  const { id } = req.params;
  let updatedFields = req.body;

  // Ensure we have fields to update
  if (!updatedFields || typeof updatedFields !== 'object' || Array.isArray(updatedFields)) {
    return res.status(400).json({ error: 'Invalid update data' });
  }

  // Remove any undefined values so they don't overwrite DB fields
  updatedFields = Object.fromEntries(
    Object.entries(updatedFields).filter(([_, value]) => value !== undefined)
  );

  if (Object.keys(updatedFields).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const result = await updateImage(id, updatedFields);
    if (!result) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json(result);
  } catch (err) {
    console.error('Update failed:', err.message);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Delete image by ID
app.delete('/images/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await deleteImage(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Image not found' });
        }
        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        console.error('Delete failed:', err.message);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});
// Validate part numbers during upload
app.get('/parts/:partNumber', async (req, res) => {
  const { partNumber } = req.params;
  try {
    const result = await client.query('SELECT * FROM parts WHERE part_number = $1', [partNumber]);
    if (result.rows.length === 0) {
      return res.status(404).json({ exists: false });
    }
    res.json({ exists: true, part: result.rows[0] });
  } catch (err) {
    console.error('Error validating part:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List available categories (assume category field exists in parts table)
app.get('/categories', async (req, res) => {
  try {
    const result = await client.query('SELECT DISTINCT category FROM parts'); // Correct table name
    res.json(result.rows.map(r => r.category).filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Delete multiple images at once
app.post('/images/batch-delete', async (req, res) => {
  const { ids } = req.body; // array of IDs
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  try {
    const result = await client.query('SELECT * FROM images WHERE id = ANY($1)', [ids]);
    // Delete from MinIO
    for (let row of result.rows) {
      await minioClient.removeObject(row.bucket_name, row.file_name); // Use file_name as object key
    }
    // Delete from Database
    await client.query('DELETE FROM images WHERE id = ANY($1)', [ids]);
    res.json({ message: 'Images deleted successfully', count: result.rows.length });
  } catch (err) {
    console.error('Batch delete error:', err);
    res.status(500).json({ error: err && err.message ? err.message : 'Unknown error during batch delete' });
  }
});






// Start server
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`✅ Server running on http://localhost:${port}`);
    });
});