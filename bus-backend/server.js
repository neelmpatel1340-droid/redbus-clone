const express = require('express');
const mongoose = require('mongoose'); // Import Mongoose
const cors = require('cors');
const Bus = require('./models/Bus'); // Import Bus Model
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. CONNECT TO DATABASE ---
// Replace this string with YOUR MongoDB Link from Step 2
// REPLACE YOUR OLD LINE WITH THIS EXACT CODE:
const MONGO_URI = "mongodb+srv://neelpatel22082912_db_user:neelpatel22082912_db_user@cluster0.vqdsuby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ DB Error:", err));

// --- 2. ROUTES ---

// GET ALL BUSES
app.get('/api/buses', async (req, res) => {
  try {
    const { from, to, category } = req.query;
    let query = {};

    if (from) query.source = new RegExp(from, 'i'); // Case-insensitive
    if (to) query.destination = new RegExp(to, 'i');
    if (category && category !== 'All') query.category = category;

    const buses = await Bus.find(query);
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch buses" });
  }
});

// BOOK A SEAT
app.post('/api/book/:id', async (req, res) => {
  try {
    const { seatIndex } = req.body;
    const bus = await Bus.findById(req.params.id);

    if (!bus) return res.status(404).json({ message: "Bus not found" });
    if (bus.seats[seatIndex]) return res.status(400).json({ message: "Seat booked" });

    bus.seats[seatIndex] = true; // Mark as booked
    await bus.save(); // Save to Real DB

    res.json({ message: "Booking Successful", bus });
  } catch (err) {
    res.status(500).json({ error: "Booking Failed" });
  }
});

// RESET / SEED DATABASE (Run this once to load 100 buses!)
app.get('/api/seed', async (req, res) => {
  try {
    await Bus.deleteMany({}); // Clear old data

    const cities = ["Surat", "Mumbai", "Ahmedabad", "Rajkot", "Delhi", "Pune", "Goa"];
    const names = ["RedBus Express", "Gujrat Travels", "Neel's Luxury"];

    let newBuses = [];
    for (let i = 0; i < 100; i++) {
      const from = cities[Math.floor(Math.random() * cities.length)];
      let to = cities[Math.floor(Math.random() * cities.length)];
      while (to === from) to = cities[Math.floor(Math.random() * cities.length)];

      const isAC = Math.random() > 0.5;

      newBuses.push({
        name: names[Math.floor(Math.random() * names.length)],
        source: from,
        destination: to,
        departureTime: "10:00 AM",
        arrivalTime: "6:00 PM",
        price: isAC ? 800 : 400,
        category: isAC ? "AC" : "Non-AC",
        seats: new Array(isAC ? 40 : 50).fill(false)
      });
    }

    await Bus.insertMany(newBuses);
    res.json({ message: "Database Populated with 100 Buses!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Backend with MongoDB is Live!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));