const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  name: String,
  source: String,
  destination: String,
  departureTime: String,
  arrivalTime: String,
  price: Number,
  seats: {
    type: [Boolean], // Array representing seats (true = booked, false = available)
    default: new Array(40).fill(false) // 40 seat bus
  }
});

module.exports = mongoose.model('Bus', busSchema);