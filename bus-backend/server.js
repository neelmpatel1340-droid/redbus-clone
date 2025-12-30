const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- IN-MEMORY DATABASE (Free, No Sign-up) ---
let buses = [
  // Let's add one default bus so the site isn't empty
  {
    _id: "1",
    name: "RedBus Starter",
    source: "Surat",
    destination: "Mumbai",
    departureTime: "10:00 AM",
    arrivalTime: "2:00 PM",
    price: 500,
    seats: new Array(40).fill(false)
  }
];

// --- ROUTES ---

// 1. Get all Buses
app.get('/api/buses', (req, res) => {
  const { from, to } = req.query;
  let filteredBuses = buses;

  // Filter if user searches
  if (from) {
    filteredBuses = filteredBuses.filter(bus =>
      bus.source.toLowerCase().includes(from.toLowerCase())
    );
  }
  if (to) {
    filteredBuses = filteredBuses.filter(bus =>
      bus.destination.toLowerCase().includes(to.toLowerCase())
    );
  }

  res.json(filteredBuses);
});

// 2. Book a Seat
app.post('/api/book/:id', (req, res) => {
  const { seatIndex } = req.body;
  const busId = req.params.id;

  // Find the bus in our list
  const bus = buses.find(b => b._id === busId);

  if (!bus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  if (bus.seats[seatIndex]) {
    return res.status(400).json({ message: "Seat already booked" });
  }

  // Book the seat
  bus.seats[seatIndex] = true;

  res.json({ message: "Booking Successful", bus });
});

// 3. Add a Bus
app.post('/api/add-bus', (req, res) => {
  const newBus = {
    _id: Date.now().toString(), // Generate a fake ID
    name: req.body.name,
    source: req.body.source,
    destination: req.body.destination,
    departureTime: req.body.departureTime,
    arrivalTime: req.body.arrivalTime,
    price: req.body.price,
    seats: new Array(40).fill(false)
  };

  buses.push(newBus);
  console.log("Bus Added:", newBus);
  res.json(newBus);
});

// For Vercel Deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));

module.exports = app;