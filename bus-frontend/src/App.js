import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import './App.css';

function App() {
  // --- STATE VARIABLES ---
  const [user, setUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);
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

  // Payment State
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null); // Stores seat info while paying

  // --- 👇 YOUR BACKEND LINK 👇 ---
  const API_URL = 'https://redbus-clone-iqzk.vercel.app';

  // --- AUTH FUNCTIONS ---
  const handleAuth = async () => {
    const endpoint = isLoginView ? '/api/login' : '/api/register';
    const payload = isLoginView ? { email, password } : { name: username, email, password };
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      if (isLoginView) setUser(res.data.username);
      else { alert("Registration Successful! Now please Login."); setIsLoginView(true); }
    } catch (err) { alert(err.response?.data?.message || "Error Occurred"); }
  };

  const handleLogout = () => { setUser(null); setTicket(null); };

  // --- BUS FUNCTIONS ---
  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/buses`, { params: { from, to, category } });
      setBuses(res.data);
    } catch (error) { console.error("Search Error:", error); }
  };

  const handleSearch = () => { setTicket(null); setSelectedBus(null); fetchBuses(); };
  useEffect(() => { fetchBuses(); }, []);

  // --- 1. USER CLICKS SEAT -> OPENS PAYMENT POPUP ---
  const initiateBooking = (bus, index) => {
    setBookingDetails({ bus, index }); // Save details
    setShowPayment(true); // Open Payment Modal
  };

  // --- 2. USER CLICKS "PAY NOW" -> PROCESS FAKE PAYMENT ---
  const processPayment = async () => {
    setPaymentProcessing(true);

    // Fake wait for 2 seconds (Simulating Bank Server)
    setTimeout(async () => {
      try {
        const { bus, index } = bookingDetails;

        // Call Backend to Book
        await axios.post(`${API_URL}/api/book/${bus._id}`, { seatIndex: index });

        // Generate Ticket
        setTicket({
          busName: bus.name,
          from: bus.source,
          to: bus.destination,
          seat: index + 1,
          price: bus.price,
          passenger: user,
          date: new Date().toLocaleDateString()
        });

        fetchBuses(); // Refresh Data
        setPaymentProcessing(false);
        setShowPayment(false); // Close Modal
      } catch (err) {
        alert('Booking Failed! Seat might be taken.');
        setPaymentProcessing(false);
        setShowPayment(false);
      }
    }, 2000);
  };

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card shadow p-4 text-center" style={{ width: '350px' }}>
          <h2 className="text-danger fw-bold">Neel's Bus App</h2>
          <h4 className="mb-3">{isLoginView ? "Login" : "Register"}</h4>
          {!isLoginView && <input className="form-control mb-2" placeholder="Full Name" onChange={e => setUsername(e.target.value)} />}
          <input className="form-control mb-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input className="form-control mb-3" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button className="btn btn-danger w-100 mb-2" onClick={handleAuth}>{isLoginView ? "Login" : "Register"}</button>
          <p className="text-muted" style={{ cursor: 'pointer' }} onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? "New user? Register" : "Already have account? Login"}
          </p>
        </div>
      </div>
    );
  }

  // --- MAIN APP SCREEN ---
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-danger fw-bold">Welcome, {user} 👋</h2>
        <button className="btn btn-outline-dark" onClick={handleLogout}>Logout</button>
      </div>

      {/* SEARCH */}
      <div className="card p-4 shadow mb-4">
        <div className="row g-3">
          <div className="col-md-3"><input className="form-control" placeholder="From" onChange={e => setFrom(e.target.value)} /></div>
          <div className="col-md-3"><input className="form-control" placeholder="To" onChange={e => setTo(e.target.value)} /></div>
          <div className="col-md-3">
            <select className="form-select" onChange={e => setCategory(e.target.value)}>
              <option value="All">All Types</option>
              <option value="AC">AC Only</option>
              <option value="Non-AC">Non-AC Only</option>
            </select>
          </div>
          <div className="col-md-3"><button className="btn btn-danger w-100" onClick={handleSearch}>Search</button></div>
        </div>
      </div>

      {/* PAYMENT MODAL (FAKE GATEWAY) */}
      {showPayment && bookingDetails && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">💳 Secure Payment Gateway</h5>
                <button className="btn-close" onClick={() => setShowPayment(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Paying for:</strong> {bookingDetails.bus.name}</p>
                <p><strong>Amount:</strong> ₹{bookingDetails.bus.price}</p>
                <hr />
                <div className="mb-3">
                  <label>Card Number</label>
                  <input className="form-control" placeholder="XXXX-XXXX-XXXX-XXXX" />
                </div>
                <div className="row">
                  <div className="col-6"><input className="form-control" placeholder="MM/YY" /></div>
                  <div className="col-6"><input className="form-control" placeholder="CVV" /></div>
                </div>
              </div>
              <div className="modal-footer">
                {paymentProcessing ? (
                  <button className="btn btn-primary w-100" disabled>Processing Payment...</button>
                ) : (
                  <button className="btn btn-success w-100" onClick={processPayment}>Pay ₹{bookingDetails.bus.price}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TICKET */}
      {ticket && (
        <div className="alert alert-success text-center shadow">
          <h4>✅ Payment Successful!</h4>
          <div className="card p-4 mt-3 d-inline-block text-start shadow-sm border-success">
            <h5 className="text-center text-success">🎫 TICKET</h5> <hr />
            <p><strong>Passenger:</strong> {ticket.passenger}</p>
            <p><strong>Bus:</strong> {ticket.busName}</p>
            <p><strong>Seat:</strong> {ticket.seat} | <strong>Price:</strong> ₹{ticket.price}</p>
            <button className="btn btn-primary w-100" onClick={() => window.print()}>Print Ticket</button>
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
                  <h5 className="card-title text-primary">{bus.name}</h5>
                  <p className="mb-0">{bus.source} ➝ {bus.destination}</p>
                </div>
                <div className="text-end">
                  <h4 className="text-success">₹{bus.price}</h4>
                  <button className="btn btn-outline-danger" onClick={() => setSelectedBus(bus === selectedBus ? null : bus)}>Select Seat</button>
                </div>
              </div>
              {selectedBus === bus && (
                <div className="card-footer bg-light text-center">
                  <p className="small text-muted">Select a seat to proceed to payment</p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {bus.seats.map((booked, i) => (
                      <button key={i} disabled={booked}
                        className={`btn btn-sm ${booked ? 'btn-secondary' : 'btn-outline-success'}`}
                        style={{ width: '40px' }}
                        onClick={() => initiateBooking(bus, i)}
                      >
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