const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Use the CORS middleware
app.use(cors());

// Use Express's built-in body parser middleware for JSON
app.use(express.json());

mongoose.connect(
    "mongodb+srv://teamHurricane:firstPlace1@hurricanedata.tfo8r.mongodb.net/?retryWrites=true&w=majority&appName=hurricaneData",
    { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB Atlas");
});

// Pin Schema
const pinSchema = new mongoose.Schema({
    lat: Number,
    lng: Number,
    description: String,
});

const Pin = mongoose.model("Pin", pinSchema);

// API route to save pin data
app.post("/api/pins", async (req, res) => {
    try {
        const newPin = new Pin({
            lat: req.body.lat,
            lng: req.body.lng,
            description: req.body.description,
        });

        // Save using async/await
        const savedPin = await newPin.save();
        res.status(200).send(savedPin);
    } catch (err) {
        res.status(500).send(err);
    }
});

// API route to get all pins
app.get("/api/pins", async (req, res) => {
    try {
        const pins = await Pin.find({});
        res.status(200).send(pins);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
