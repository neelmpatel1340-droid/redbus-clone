import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [buses, setBuses] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);

  // --- IMPORTANT: PASTE YOUR BACKEND LINK HERE ---
  // Example: const API_URL = 'https://redbus-backend.vercel.app';
  const API_URL = 'https://redbus-clone-iqzk-patel-neels-projects-29295fa5.vercel.app/';

  // SEARCH FUNCTION
  const searchBuses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/buses?from=${from}&to=${to}`);
      setBuses(res.data);
      setSelectedBus(null);
    } catch (error) {
      console.error("Error fetching buses:", error);
      alert("Error connecting to server. Check console for details.");
    }
  };

  // LOAD BUSES ON START
  useEffect(() => {
    searchBuses();
  }, []);

  // BOOKING FUNCTION
  const bookSeat = async (busId, index) => {
    try {
      await axios.post(`${API_URL}/api/book/${busId}`, { seatIndex: index });
      alert('Booking Confirmed!');
      searchBuses(); // Refresh to show the seat as taken
    } catch (err) {
      alert('Error booking seat.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-danger">RedBus Clone</h1>
        <p className="lead text-secondary">Live Project by [Your Name]</p>
      </div>

      {/* SEARCH BAR */}
      <div className="card p-4 shadow-lg border-0 mb-5 search-card">
        <div className="row g-3">
          <div className="col-md-5">
            <input type="text" className="form-control form-control-lg" placeholder="Source (e.g., Surat)"
              value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col-md-5">
            <input type="text" className="form-control form-control-lg" placeholder="Destination (e.g., Mumbai)"
              value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-danger btn-lg w-100" onClick={searchBuses}>Search</button>
          </div>
        </div>
      </div>

      {/* BUS LIST */}
      <div className="list-group">
        {buses.map(bus => (
          <div key={bus._id} className="list-group-item p-4 mb-4 shadow-sm border rounded bus-card">
            <div className="d-flex w-100 justify-content-between align-items-center">
              <div>
                <h4 className="mb-1 fw-bold text-primary">{bus.name}</h4>
                <p className="mb-1 text-muted">{bus.source} ➝ {bus.destination}</p>
                <small>Departs: {bus.departureTime} | Arrives: {bus.arrivalTime}</small>
              </div>
              <div className="text-end">
                <h3 className="text-success fw-bold">₹{bus.price}</h3>
                <button className="btn btn-outline-primary mt-2" onClick={() => setSelectedBus(bus === selectedBus ? null : bus)}>
                  {selectedBus === bus ? 'Hide Seats' : 'View Seats'}
                </button>
              </div>
            </div>

            {selectedBus && selectedBus._id === bus._id && (
              <div className="mt-4 p-4 bg-light rounded seat-section">
                <h5>Select a Seat</h5>
                <div className="d-flex flex-wrap gap-2">
                  {bus.seats.map((isBooked, index) => (
                    <button
                      key={index}
                      disabled={isBooked}
                      className={`btn ${isBooked ? 'btn-secondary' : 'btn-success'}`}
                      style={{ width: '40px' }}
                      onClick={() => bookSeat(bus._id, index)}
                    >
                      {index + 1}
                    </button>
                  ))}
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