const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. DEFINE CITIES FOR RANDOM GENERATION ---
const cities = ["Surat", "Mumbai", "Ahmedabad", "Rajkot", "Delhi", "Pune", "Vadodara", "Bangalore", "Goa", "Jaipur"];

// --- 2. CREATE MANUAL BUSES ---
let buses = [
  {
    _id: "1",
    name: "RedBus Express",
    source: "Surat",
    destination: "Mumbai",
    departureTime: "10:00 AM",
    arrivalTime: "2:00 PM",
    price: 500,
    seats: new Array(40).fill(false)
  },
  {
    _id: "2",
    name: "Gujrat Travels",
    source: "Ahmedabad",
    destination: "Rajkot",
    departureTime: "8:00 AM",
    arrivalTime: "12:00 PM",
    price: 350,
    seats: new Array(40).fill(false)
  },
  {
    _id: "3",
    name: "Neel's Luxury Sleeper",
    source: "Surat",
    destination: "Delhi",
    departureTime: "9:00 PM",
    arrivalTime: "8:00 AM",
    price: 1200,
    seats: new Array(50).fill(false) // 50 Seats
  }
];

// --- 3. GENERATE 100 RANDOM BUSES AUTOMATICALLY ---
for (let i = 1; i <= 100; i++) {
  // Pick random cities
  const from = cities[Math.floor(Math.random() * cities.length)];
  let to = cities[Math.floor(Math.random() * cities.length)];

  // Make sure Source and Destination are not the same
  while (to === from) {
    to = cities[Math.floor(Math.random() * cities.length)];
  }

  // Add to the list
  buses.push({
    _id: (i + 3).toString(), // IDs start from 4
    name: `Bus Service ${i}`,
    source: from,
    destination: to,
    departureTime: `${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
    arrivalTime: `${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
    price: Math.floor(Math.random() * 1000) + 300, // Random price between 300 and 1300
    seats: new Array(40).fill(false)
  });
}

// --- ROUTES ---

// Get all Buses
app.get('/api/buses', (req, res) => {
  const { from, to } = req.query;
  let filteredBuses = buses;

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

// Book a Seat
app.post('/api/book/:id', (req, res) => {
  const { seatIndex } = req.body;
  const busId = req.params.id;
  const bus = buses.find(b => b._id === busId);

  if (!bus) return res.status(404).json({ message: "Bus not found" });
  if (bus.seats[seatIndex]) return res.status(400).json({ message: "Seat already booked" });

  bus.seats[seatIndex] = true;
  res.json({ message: "Booking Successful", bus });
});

// Home Route
app.get('/', (req, res) => {
  res.send('Backend is Working! Go to /api/buses to see data.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));

module.exports = app;