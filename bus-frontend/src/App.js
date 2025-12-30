import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; 

function App() {
  const [buses, setBuses] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);

  // SEARCH FUNCTION
  const searchBuses = async () => {
    try {
      // NOTE: Ensure your backend is running on port 5000
      const res = await axios.get(`http://localhost:5000/api/buses?from=${from}&to=${to}`);
      setBuses(res.data);
      setSelectedBus(null);
    } catch (error) {
      console.error("Error fetching buses:", error);
      alert("Backend not connected! Make sure server.js is running.");
    }
  };

  // BOOKING FUNCTION
  const bookSeat = async (busId, index) => {
    try {
      await axios.post(`http://localhost:5000/api/book/${busId}`, { seatIndex: index });
      alert('Booking Confirmed!');
      searchBuses(); // Refresh to show the seat as taken
    } catch (err) {
      alert('Error booking seat: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container mt-5">
      {/* HEADER */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-danger">RedBus Clone</h1>
        <p className="lead text-secondary">Book your bus tickets safely & quickly</p>
      </div>
      
      {/* SEARCH BAR */}
      <div className="card p-4 shadow-lg border-0 mb-5 search-card">
        <div className="row g-3">
          <div className="col-md-5">
            <label className="form-label text-muted">From</label>
            <input type="text" className="form-control form-control-lg" placeholder="Source (e.g., Surat)" 
              value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col-md-5">
            <label className="form-label text-muted">To</label>
            <input type="text" className="form-control form-control-lg" placeholder="Destination (e.g., Mumbai)" 
              value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-danger btn-lg w-100 fw-bold" onClick={searchBuses}>Search</button>
          </div>
        </div>
      </div>

      {/* BUS LIST */}
      <div className="list-group">
        {buses.length === 0 && <p className="text-center text-muted">No buses found. Try searching or adding buses to backend.</p>}
        
        {buses.map(bus => (
          <div key={bus._id} className="list-group-item p-4 mb-4 shadow-sm border rounded bus-card">
            <div className="d-flex w-100 justify-content-between align-items-center flex-wrap">
              <div>
                <h4 className="mb-1 fw-bold text-primary">{bus.name}</h4>
                <p className="mb-1 text-muted fs-5">{bus.source} <span className="mx-2">➝</span> {bus.destination}</p>
                <small className="text-secondary">Departs: {bus.departureTime} | Arrives: {bus.arrivalTime}</small>
              </div>
              <div className="text-end mt-2 mt-md-0">
                <h3 className="text-success fw-bold">₹{bus.price}</h3>
                <button className="btn btn-outline-primary mt-2" onClick={() => setSelectedBus(bus === selectedBus ? null : bus)}>
                  {selectedBus === bus ? 'Hide Seats' : 'View Seats'}
                </button>
              </div>
            </div>

            {/* SEAT SELECTION UI */}
            {selectedBus && selectedBus._id === bus._id && (
              <div className="mt-4 p-4 bg-light rounded seat-section fade-in">
                <h5 className="mb-3">Select a Seat</h5>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {bus.seats.map((isBooked, index) => (
                    <button 
                      key={index}
                      disabled={isBooked}
                      className={`seat-btn ${isBooked ? 'booked' : 'available'}`}
                      onClick={() => bookSeat(bus._id, index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <span className="badge bg-secondary me-2">Booked</span>
                  <span className="badge border text-dark">Available</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;