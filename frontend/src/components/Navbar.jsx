import React from 'react';

export const Navbar = ({ user, currentPage }) => {
  if (!user) return null;

  // Format Page Title
  const getPageTitle = (page) => {
    switch (page) {
      case 'dashboard': return '📊 Central Dashboard';
      case 'builder': return '🏋️ Drag-and-Drop Routine Builder';
      case 'bookings': return '📅 Live Bookings & Reservations';
      case 'mealplanner': return '🍎 AI Meal Planner & Grocery Gen';
      case 'leaderboard': return '🏆 Community Leaderboard & Challenges';
      case 'chat': return '💬 Coaching Direct Messages';
      default: return 'AegisFit Console';
    }
  };

  // Calculate user level and XP progress
  const xp = user.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;

  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.title}>{getPageTitle(currentPage)}</h1>
        <p style={styles.subtitle}>Welcome back, {user.username}. Keep training.</p>
      </div>

      <div style={styles.profileControls}>
        {user.role === 'user' && (
          <div style={styles.xpTracker}>
            <div style={styles.xpMeta}>
              <span style={styles.xpText}>Level {level}</span>
              <span style={styles.xpTextSub}>{currentLevelXp}/100 XP</span>
            </div>
            <div style={styles.xpProgressContainer}>
              <div style={{ ...styles.xpProgressBar, width: `${currentLevelXp}%` }}></div>
            </div>
          </div>
        )}

        <div style={styles.roleContainer}>
          <span style={styles.roleLabel}>Role:</span>
          <span style={styles.roleValue}>{user.role.toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '75px',
    backgroundColor: 'rgba(10, 14, 26, 0.75)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border-frosted)',
    position: 'fixed',
    top: 0,
    right: 0,
    left: '260px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    zIndex: 90
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  profileControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  xpTracker: {
    width: '180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  xpMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: '600'
  },
  xpText: {
    color: 'var(--accent-gold)'
  },
  xpTextSub: {
    color: 'var(--text-muted)'
  },
  xpProgressContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  xpProgressBar: {
    height: '100%',
    backgroundColor: 'var(--accent-gold)',
    boxShadow: 'var(--glow-gold)',
    borderRadius: '3px',
    transition: 'width 0.4s ease'
  },
  roleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--bg-navy)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-frosted)'
  },
  roleLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  roleValue: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--accent-cyan)'
  }
};

export default Navbar;
