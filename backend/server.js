const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Enable URL-encoded data
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Multer Configuration
const storage = multer.diskStorage({
    destination: './uploads/', // Directory where files will be stored
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit the file size to 1MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('image'); // Change this to match the field name in your form

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Import routes
const authRoutes = require('./routes/auth');
const markerRoutes = require('./routes/markers');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/markers', markerRoutes);

// Add multer to the marker route
app.post('/api/markers', upload, async (req, res) => {
    try {
        const { issueType, description, latitude, longitude } = req.body;

        // Construct marker data
        const markerData = {
            issueType,
            description,
            latitude,
            longitude,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null, // Save the image URL if an image was uploaded
        };

        // Create and save your marker using the Marker model
        const Marker = require('./models/Marker'); // Import the Marker model here if needed
        const marker = new Marker(markerData);
        await marker.save();

        // Respond with success message and marker data
        res.status(201).json({
            message: "Marker created successfully",
            markerData: {
                issueType,
                description,
                latitude,
                longitude,
                imageUrl: markerData.imageUrl, // Use the image URL you just constructed
            },
        });
    } catch (error) {
        console.error("Error adding marker:", error);
        res.status(500).json({ error: 'Error adding marker' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
