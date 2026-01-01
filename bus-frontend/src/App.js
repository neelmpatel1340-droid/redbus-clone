import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // --- STATE VARIABLES ---
  const [user, setUser] = useState(null); // Stores logged-in user
  const [isLoginView, setIsLoginView] = useState(true); // Toggle Login vs Register
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Bus App State
  const [buses, setBuses] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedBus, setSelectedBus] = useState(null);
  const [ticket, setTicket] = useState(null);

  // --- 👇 PASTE YOUR BACKEND LINK HERE 👇 ---
  const API_URL = 'https://redbus-clone-iqzk.vercel.app';

  // --- AUTH FUNCTIONS ---
  const handleAuth = async () => {
    const endpoint = isLoginView ? '/api/login' : '/api/register';
    const payload = isLoginView ? { email, password } : { name: username, email, password };

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      if (isLoginView) {
        setUser(res.data.username); // Log user in
      } else {
        alert("Registration Successful! Now please Login.");
        setIsLoginView(true); // Switch to login
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error Occurred");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTicket(null);
  };

  // --- BUS APP FUNCTIONS ---
  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/buses`, { params: { from, to, category } });
      setBuses(res.data);
    } catch (error) { console.error("Search Error:", error); }
  };

  const handleSearch = () => {
    setTicket(null);
    setSelectedBus(null);
    fetchBuses();
  };

  useEffect(() => { fetchBuses(); }, []);

  const bookSeat = async (bus, index) => {
    try {
      await axios.post(`${API_URL}/api/book/${bus._id}`, { seatIndex: index });
      setTicket({
        busName: bus.name,
        from: bus.source,
        to: bus.destination,
        seat: index + 1,
        price: bus.price,
        time: bus.departureTime,
        date: new Date().toLocaleDateString(),
        passenger: user // Add passenger name to ticket
      });
      fetchBuses();
    } catch (err) { alert('Seat already booked!'); }
  };

  // --- 🔒 IF NOT LOGGED IN: SHOW LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="container mt-5" style={{ maxWidth: '400px' }}>
        <div className="card shadow p-4 text-center">
          <h2 className="text-danger fw-bold">Neel's Bus App</h2>
          <h4 className="mb-3">{isLoginView ? "Login" : "Register"}</h4>

          {!isLoginView && (
            <input className="form-control mb-2" placeholder="Full Name" onChange={e => setUsername(e.target.value)} />
          )}
          <input className="form-control mb-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input className="form-control mb-3" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

          <button className="btn btn-danger w-100 mb-2" onClick={handleAuth}>
            {isLoginView ? "Login" : "Register"}
          </button>

          <p className="text-muted" style={{ cursor: 'pointer' }} onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? "New user? Register here" : "Already have account? Login"}
          </p>
        </div>
      </div>
    );
  }

  // --- 🔓 IF LOGGED IN: SHOW MAIN APP ---
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-danger fw-bold">Welcome, {user} 👋</h2>
        <button className="btn btn-outline-dark" onClick={handleLogout}>Logout</button>
      </div>

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

      {/* TICKET POPUP */}
      {ticket && (
        <div className="alert alert-success text-center shadow">
          <h4>✅ Booking Confirmed!</h4>
          <div className="card p-4 mt-3 d-inline-block text-start bg-white border-success shadow-sm">
            <h5 className="text-center text-success">🎫 TICKET</h5>
            <hr />
            <p><strong>Passenger:</strong> {ticket.passenger}</p>
            <p><strong>Bus:</strong> {ticket.busName}</p>
            <p><strong>Route:</strong> {ticket.from} ➝ {ticket.to}</p>
            <p><strong>Seat:</strong> {ticket.seat}</p>
            <p><strong>Price:</strong> ₹{ticket.price}</p>
            <button className="btn btn-primary w-100 mt-2" onClick={() => window.print()}>Download</button>
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
              {selectedBus === bus && (
                <div className="card-footer bg-light">
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {bus.seats.map((booked, i) => (
                      <button key={i} disabled={booked} className={`btn btn-sm ${booked ? 'btn-secondary' : 'btn-outline-success'}`} style={{ width: '40px' }} onClick={() => bookSeat(bus, i)}>{i + 1}</button>
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