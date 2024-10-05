const mongoose = require('mongoose');

// Define the schema for markers
const markerSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Reference to the User model
        required: false 
    },
    issueType: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    latitude: { 
        type: Number, 
        required: true 
    },
    longitude: { 
        type: Number, 
        required: true 
    },
    imageUrl: { 
        type: String, 
        required: false 
    }, // This will hold the URL of the uploaded image
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

// Create the Marker model from the schema
const Marker = mongoose.model('Marker', markerSchema);

// Export the Marker model
module.exports = Marker;
