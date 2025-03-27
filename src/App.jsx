import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Home from './components/Home';
import UserProfile from './components/UserProfile';
import LinkedInNavbar from './components/Navbar';
import Jobs from './components/Jobs';
import Network from './components/Network';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in from localStorage
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Handle login and save to localStorage
  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  // Handle logout and remove from localStorage
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      {isLoggedIn && <LinkedInNavbar onLogout={handleLogout} />}
      <Routes>
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLogin} />} 
        />
        <Route 
          path="/home" 
          element={isLoggedIn ? <Home /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile/:userId" 
          element={isLoggedIn ? <UserProfile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/jobs" 
          element={isLoggedIn ? <Jobs /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/network" 
          element={isLoggedIn ? <Network /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
