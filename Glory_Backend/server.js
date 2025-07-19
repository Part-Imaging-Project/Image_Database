//node server.js
const express = require('express');
const { connectDB, saveToPostgres, getImages } = require('./postgresDb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
// Set the port for the server  
const port = 8000;
// Middleware setup
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));         

//testing root endpoint 
app.get('/', (req, res) => {
    res.send('Welcome to the Azure Blob Storage and PostgreSQL demo!');
});

// testing basic post endpoint for retrieving image data
app.get('/image', (req, res) => {
    // Here you would typically retrieve image data from a database or perform some operation
    const imageData = {
        id: 1,
        imageUrl: 'https://example.com/image.jpg',
        description: 'Sample image'
    };

    // Respond with the image data
    res.json(imageData);
});


app.get('/images', async (req, res) => {
  try {
    const images = await getImages();
    res.json(images);
  } catch (err) {
    console.error(' Error fetching images:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/upload', async (req, res) => {
  const { filename, blobUrl } = req.body;
  if (!filename || !blobUrl) {
    return res.status(400).json({ error: 'Missing filename or blobUrl' });
  }

  try {
    const saved = await saveToPostgres(filename, blobUrl);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save image data' });
  }
});

// Connect to PostgreSQL database
// Start the server
connectDB().then(() => {
 app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
});
// // and retrieve all images from the database. The connection details are stored in environment variables.
// // The server listens on port 8000 and provides two endpoints: /images to fetch all images