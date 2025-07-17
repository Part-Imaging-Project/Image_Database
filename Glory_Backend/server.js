// server.js
const express = require('express');
const { connectDB, saveToPostgres, getImages, deleteImage, updateImage } = require('./postgresDb');
const bodyParser = require('body-parser');
const cors = require('cors');

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

// Retrieve all images
app.get('/images', async (req, res) => {
    try {
        const images = await getImages();
        res.json(images);
    } catch (err) {
        console.error('Error fetching images:', err.message);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Retrieve image by ID
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
            ORDER BY i.created_at DESC;
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

// Manual upload endpoint (for testing)
app.post('/upload', async (req, res) => {
    const { filename, blobUrl } = req.body;
    if (!filename || !blobUrl) {
        return res.status(400).json({ error: 'Missing required fields: filename or blobUrl' });
    }

    try {
        const saved = await saveToPostgres(filename, blobUrl);
        res.status(201).json(saved);
    } catch (err) {
        console.error('Upload failed:', err.message);
        res.status(500).json({ error: 'Failed to save image data' });
    }
});

// Update image metadata
app.put('/images/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body;

    // Ensure at least one field is provided
    const keys = Object.keys(updatedFields);
    if (keys.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
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

// Start server
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`✅ Server running on http://localhost:${port}`);
    });
});