import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// We will create these components in the next steps
const Home = () => <div className="p-5"><h1>Welcome to BloodDonation</h1><p>Home Page</p></div>;
const Register = () => <div className="p-5"><h1>Donor Registration</h1></div>;

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation bar will go here later */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;