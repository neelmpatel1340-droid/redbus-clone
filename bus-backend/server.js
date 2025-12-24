const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Bus = require('./models/Bus');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB (Replace with your connection string later)
// NEW CODE (Cloud)

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://neelmpatel1340_db_user:i22lZQ8Qh0oAJpG0@cluster0.d76dkob.mongodb.net/?appName=Cluster0') // <-- NO semicolon here!
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// 1. Get all Buses (Search Function)
app.get('/api/buses', async (req, res) => {
  const { from, to } = req.query;
  // Simple filter: if 'from' and 'to' are provided, filter by them
  const query = {};
  if (from) query.source = new RegExp(from, 'i'); // Case insensitive
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

  bus.seats[seatIndex] = true; // Mark seat as booked
  await bus.save();
  res.json({ message: "Booking Successful", bus });
});

// 3. Add a Fake Bus (For testing)
app.post('/api/add-bus', async (req, res) => {
  const newBus = new Bus(req.body);
  await newBus.save();
  res.json(newBus);
});

app.listen(5000, () => console.log('Server running on port 5000'));