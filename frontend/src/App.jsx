import React, { useState, useEffect } from 'react';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leaderboard from './pages/Leaderboard.jsx';

import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import DragDropBuilder from './components/DragDropBuilder.jsx';
import CalendarBooking from './components/CalendarBooking.jsx';
import AIMealPlanner from './components/AIMealPlanner.jsx';
import LiveChat from './components/LiveChat.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('aegisfit_token');
    const storedUser = localStorage.getItem('aegisfit_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setCurrentPage('dashboard');
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('aegisfit_token');
    localStorage.removeItem('aegisfit_user');
    setUser(null);
    setToken('');
    setCurrentPage('home');
  };

  // Callback to increase User XP and sync with backend
  const handleXpGain = async (xpValue) => {
    if (!user || !token) return;
    const newXp = (user.xp || 0) + xpValue;
    
    try {
      const response = await fetch(`/api/auth/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ xp: newXp })
      });
      const data = await response.json();
      if (response.ok) {
        // Sync local state
        const updatedUser = { ...user, xp: data.xp, badges: data.badges };
        setUser(updatedUser);
        localStorage.setItem('aegisfit_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error('Error synchronizing XP:', e);
    }
  };

  const handleUpdateUser = (updatedProfile) => {
    const updatedUser = { ...user, ...updatedProfile };
    setUser(updatedUser);
    localStorage.setItem('aegisfit_user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <span style={styles.spinner}>🛡️</span>
        <h3>Connecting to AegisFit console...</h3>
      </div>
    );
  }

  // Public/Authentication Routing
  if (!user) {
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={setCurrentPage} onAuthSuccess={handleAuthSuccess} />;
      case 'register':
        return <Register onNavigate={setCurrentPage} onAuthSuccess={handleAuthSuccess} />;
      case 'home':
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  }

  // Authenticated Dashboard Layout Routing
  return (
    <div style={styles.appContainer}>
      <Sidebar
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />
      
      <div style={styles.mainContent}>
        <Navbar user={user} currentPage={currentPage} />
        
        <main style={styles.bodyWrapper}>
          {currentPage === 'dashboard' && (
            <Dashboard
              user={user}
              token={token}
              onXpGain={handleXpGain}
              onUpdateUser={handleUpdateUser}
            />
          )}
          {currentPage === 'builder' && (
            <DragDropBuilder
              user={user}
              token={token}
              onXpGain={handleXpGain}
            />
          )}
          {currentPage === 'bookings' && (
            <CalendarBooking
              user={user}
              token={token}
            />
          )}
          {currentPage === 'mealplanner' && (
            <AIMealPlanner
              user={user}
              token={token}
              onXpGain={handleXpGain}
            />
          )}
          {currentPage === 'leaderboard' && (
            <Leaderboard
              user={user}
              token={token}
              onUpdateUser={handleUpdateUser}
            />
          )}
          {currentPage === 'chat' && (
            <LiveChat
              user={user}
              token={token}
            />
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  loadingScreen: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-obsidian)',
    color: 'var(--text-primary)',
    gap: '16px'
  },
  spinner: {
    fontSize: '48px',
    animation: 'pulseGlow 2s infinite ease-in-out',
    borderRadius: '50%'
  },
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-obsidian)'
  },
  mainContent: {
    flexGrow: 1,
    marginLeft: '260px', // Matches Sidebar width
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  bodyWrapper: {
    flexGrow: 1,
    marginTop: '75px', // Matches Navbar height
    padding: '32px',
    overflowY: 'auto'
  }
};
