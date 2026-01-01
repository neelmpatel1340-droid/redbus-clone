const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- CONSTANTS ---
const cities = ["Surat", "Mumbai", "Ahmedabad", "Rajkot", "Delhi", "Pune", "Vadodara", "Bangalore", "Goa", "Jaipur"];
const busNames = ["RedBus Express", "Gujrat Travels", "Neel's Luxury", "City Connect", "SafeJourney", "Speedy Wheels"];

// --- GENERATE 100 BUSES WITH AC/NON-AC ---
let buses = [];
for (let i = 1; i <= 100; i++) {
  const from = cities[Math.floor(Math.random() * cities.length)];
  let to = cities[Math.floor(Math.random() * cities.length)];
  while (to === from) to = cities[Math.floor(Math.random() * cities.length)];

  const isAC = Math.random() > 0.5; // 50% chance of being AC

  buses.push({
    _id: i.toString(),
    name: busNames[Math.floor(Math.random() * busNames.length)],
    category: isAC ? "AC" : "Non-AC",
    source: from,
    destination: to,
    departureTime: `${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
    arrivalTime: `${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
    price: isAC ? Math.floor(Math.random() * 500) + 800 : Math.floor(Math.random() * 300) + 300,
    seats: new Array(isAC ? 40 : 50).fill(false) // AC has 40 seats, Non-AC has 50
  });
}

// --- ROUTES ---

// 1. Get Buses with Filter
app.get('/api/buses', (req, res) => {
  const { from, to, category } = req.query;
  let filteredBuses = buses;

  if (from) filteredBuses = filteredBuses.filter(bus => bus.source.toLowerCase() === from.toLowerCase());
  if (to) filteredBuses = filteredBuses.filter(bus => bus.destination.toLowerCase() === to.toLowerCase());

  // New Filter: AC vs Non-AC
  if (category && category !== 'All') {
    filteredBuses = filteredBuses.filter(bus => bus.category === category);
  }

  res.json(filteredBuses);
});

// 2. Book a Seat
app.post('/api/book/:id', (req, res) => {
  const { seatIndex } = req.body;
  const bus = buses.find(b => b._id === req.params.id);
  if (!bus || bus.seats[seatIndex]) return res.status(400).json({ message: "Error" });

  bus.seats[seatIndex] = true;
  res.json({ message: "Booked", bus });
});

// Home
app.get('/', (req, res) => res.send('Backend Online!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running`));

module.exports = app;