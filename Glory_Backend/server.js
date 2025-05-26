//node server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 4000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));         

//testing root endpoint 
app.get('/', (req, res) => {
    res.send('Hello World!');
});


//testing basic post endpoint for image URL
app.post('/api/image', (req, res) => {
    const imageUrl = req.body.imageUrl;
    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    // Here you would typically process the image URL, e.g., save it to a database or perform some operation
    console.log(`Received image URL: ${imageUrl}`);

    // Respond with a success message
    res.json({ message: 'Image URL received successfully', imageUrl });
});

// testing basic post endpoint for retrieving image data
app.get('/api/image', (req, res) => {
    // Here you would typically retrieve image data from a database or perform some operation
    const imageData = {
        id: 1,
        imageUrl: 'https://example.com/image.jpg',
        description: 'Sample image'
    };

    // Respond with the image data
    res.json(imageData);
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});