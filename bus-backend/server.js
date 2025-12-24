const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Bus = require('./models/Bus');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://neelmpatel1340_db_user:i22lZQ8Qh0oAJpG0@cluster0.d76dkob.mongodb.net/?appName=Cluster0')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// --- ROUTES ---

// 1. Get all Buses
app.get('/api/buses', async (req, res) => {
  const { from, to } = req.query;
  const query = {};
  if (from) query.source = new RegExp(from, 'i');
  if (to) query.destination = new RegExp(to, 'i');
  
  const buses = await Bus.find(query);
  res.json(buses);
});

// 2. Book a Seat
app.post('/api/book/:id', async (req, res) => {
  const { seatIndex } = req.body;
  const bus = await Bus.findById(req.params.id);
  
  if (bus.seats[seatIndex]) {
    return res.status(400).json({ message: "Seat already booked" });
  }

  bus.seats[seatIndex] = true;
  await bus.save();
  res.json({ message: "Booking Successful", bus });
});

// 3. Add a Fake Bus (For testing)
app.post('/api/add-bus', async (req, res) => {
  const newBus = new Bus(req.body);
  await newBus.save();
  res.json(newBus);
});

// --- OLD CODE (DELETE THIS) ---
// app.listen(5000, () => console.log('Server running on port 5000'));

// --- NEW CODE (PASTE THIS) ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));

module.exports = app; // <--- IMPORTANT: This lets Vercel run the server