const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const JWT_SECRET = "neels_secret_key_123"; // In real apps, hide this in .env
// const express = require('express');
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
const MONGO_URI = "mongodb+srv://neelpatel22082912_db_user:neel123@cluster0.vqdsuby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
// --- USER AUTHENTICATION ROUTES ---

// 1. REGISTER (Sign Up)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password (Security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to DB
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User Created Successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error registering user" });
  }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create Token (The "Key" to prove they are logged in)
    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.json({ token, username: user.name, message: "Login Successful" });
  } catch (err) {
    res.status(500).json({ error: "Error logging in" });
  }
});