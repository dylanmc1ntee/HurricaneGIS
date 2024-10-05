const express = require('express');
const router = express.Router();
const Marker = require('../models/Marker'); // Adjust the path as necessary
const multer = require('multer');
const path = require('path'); // Import path here

// Multer configuration
const storage = multer.diskStorage({
    destination: './uploads/', // Directory where files will be stored
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Use path.extname
    }
});

// Initialize upload
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
}).single('image'); // Make sure this matches your form field name

// Add a marker route with multer middleware
router.post('/', upload, async (req, res) => {
    try {
        const { issueType, description, latitude, longitude } = req.body;

        const markerData = {
            issueType,
            description,
            latitude,
            longitude,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null, // Save the image URL if an image was uploaded
        };

        const marker = new Marker(markerData);
        await marker.save();

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

// Export the router
module.exports = router;
