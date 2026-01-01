const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    name: String,
    source: String,
    destination: String,
    departureTime: String,
    arrivalTime: String,
    price: Number,
    category: String, // AC or Non-AC
    seats: [Boolean], // True = Booked, False = Available
});

module.exports = mongoose.model('Bus', busSchema);