const express = require('express');
const Marker = require('../models/Marker');

const router = express.Router();

// Get all markers
router.get('/', async (req, res) => {
    const markers = await Marker.find();
    res.json(markers);
});

// Add a new marker
router.post('/', async (req, res) => {
    const { userId, latitude, longitude, description } = req.body;
    const newMarker = new Marker({ userId, latitude, longitude, description });

    try {
        await newMarker.save();
        res.status(201).json(newMarker);
    } catch (error) {
        res.status(400).send('Error adding marker: ' + error.message);
    }
});

module.exports = router;
