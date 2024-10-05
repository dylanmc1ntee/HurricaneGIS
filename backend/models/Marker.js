const mongoose = require('mongoose');

const markerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    description: { type: String, required: true },
});

module.exports = mongoose.model('Marker', markerSchema);
