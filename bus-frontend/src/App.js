import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [buses, setBuses] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedBus, setSelectedBus] = useState(null);
  const [ticket, setTicket] = useState(null);

  // --- 👇 PASTE YOUR BACKEND LINK HERE 👇 ---
  const API_URL = 'https://redbus-clone-iqzk.vercel.app';

  // 1. Search Function (Refreshes Data)
  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/buses`, {
        params: { from, to, category }
      });
      setBuses(res.data);
      // ❌ NO setTicket(null) HERE!
    } catch (error) {
      console.error("Search Error:", error);
    }
  };

  // 2. Handle Search Button Click (Clears old ticket)
  const handleSearch = () => {
    setTicket(null); // Clear old ticket only when searching manually
    setSelectedBus(null);
    fetchBuses();
  };

  useEffect(() => { fetchBuses(); }, []);

  // 3. Book Function
  const bookSeat = async (bus, index) => {
    try {
      await axios.post(`${API_URL}/api/book/${bus._id}`, { seatIndex: index });

      // Show Success Ticket
      setTicket({
        busName: bus.name,
        from: bus.source,
        to: bus.destination,
        seat: index + 1,
        price: bus.price,
        time: bus.departureTime,
        date: new Date().toLocaleDateString()
      });

      // Refresh data (Update Grey Seats) WITHOUT closing the ticket
      fetchBuses();
    } catch (err) {
      alert('Seat already booked or Server Error!');
    }
  };

  const downloadTicket = () => {
    window.print();
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-danger fw-bold mb-4">Neel's Bus Booking v2</h1>

      {/* SEARCH BAR */}
      <div className="card p-4 shadow mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input className="form-control" placeholder="From (e.g. Surat)" onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="col-md-3">
            <input className="form-control" placeholder="To (e.g. Mumbai)" onChange={e => setTo(e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="All">All Types</option>
              <option value="AC">AC Only</option>
              <option value="Non-AC">Non-AC Only</option>
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn btn-danger w-100" onClick={handleSearch}>Search Buses</button>
          </div>
        </div>
      </div>

      {/* 🎟️ TICKET POPUP */}
      {ticket && (
        <div className="alert alert-success text-center shadow">
          <h4 className="fw-bold">✅ Booking Confirmed!</h4>
          <div className="card p-4 mt-3 d-inline-block text-start bg-white border-success shadow-sm" style={{ minWidth: '300px' }}>
            <h5 className="text-center text-success">🎫 YOUR TICKET</h5>
            <hr />
            <p><strong>Bus:</strong> {ticket.busName}</p>
            <p><strong>Route:</strong> {ticket.from} ➝ {ticket.to}</p>
            <p><strong>Seat No:</strong> {ticket.seat}</p>
            <p><strong>Price:</strong> ₹{ticket.price}</p>
            <p><strong>Date:</strong> {ticket.date}</p>

            <button className="btn btn-primary w-100 mt-2" onClick={downloadTicket}>Download / Print Ticket</button>
            <button className="btn btn-secondary w-100 mt-2" onClick={() => setTicket(null)}>Close</button>
          </div>
        </div>
      )}

      {/* BUS LIST */}
      <div className="row">
        {buses.map(bus => (
          <div key={bus._id} className="col-12 mb-3">
            <div className="card shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title text-primary">{bus.name} <span className="badge bg-secondary">{bus.category}</span></h5>
                  <p className="mb-0 fw-bold">{bus.source} ➝ {bus.destination}</p>
                  <small className="text-muted">{bus.departureTime} - {bus.arrivalTime}</small>
                </div>
                <div className="text-end">
                  <h4 className="text-success">₹{bus.price}</h4>
                  <button className="btn btn-outline-danger" onClick={() => setSelectedBus(bus === selectedBus ? null : bus)}>
                    {selectedBus === bus ? 'Close Seats' : 'View Seats'}
                  </button>
                </div>
              </div>

              {/* SEAT LAYOUT */}
              {selectedBus === bus && (
                <div className="card-footer bg-light">
                  <p className="text-center text-muted small">Front of Bus</p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {bus.seats.map((booked, i) => (
                      <button key={i} disabled={booked}
                        className={`btn btn-sm ${booked ? 'btn-secondary' : 'btn-outline-success'}`}
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => bookSeat(bus, i)}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;