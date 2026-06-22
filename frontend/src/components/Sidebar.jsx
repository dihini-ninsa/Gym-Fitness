import React from 'react';

export const Sidebar = ({ user, currentPage, setCurrentPage, onLogout }) => {
  if (!user) return null;

  // Base navigation items by role
  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard', roles: ['user', 'gym', 'coach', 'admin'] },
    { id: 'builder', label: '🏋️ Routine Builder', roles: ['user', 'coach'] },
    { id: 'bookings', label: '📅 Bookings', roles: ['user', 'gym', 'coach', 'admin'] },
    { id: 'mealplanner', label: '🍎 AI Meal Planner', roles: ['user'] },
    { id: 'leaderboard', label: '🏆 Leaderboards', roles: ['user', 'gym', 'coach', 'admin'] },
    { id: 'chat', label: '💬 Direct Messages', roles: ['user', 'coach'] }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brandContainer}>
        <div style={styles.logoCircle}>🛡️</div>
        <div>
          <h2 style={styles.brandText}>AegisFit</h2>
          <span style={styles.brandSub}>Elite Network</span>
        </div>
      </div>

      {/* User Mini Profile */}
      <div style={styles.profileContainer}>
        <div style={styles.avatar}>{user.username.charAt(0).toUpperCase()}</div>
        <div style={styles.profileDetails}>
          <p style={styles.profileName}>{user.username}</p>
          <span className="badge-gold">
            {user.role === 'user' ? `🏆 Level ${Math.floor((user.xp || 0) / 100) + 1}` : user.role.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {visibleItems.map(item => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                ...styles.navBtn,
                ...(isActive ? styles.navBtnActive : {})
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div style={styles.footer}>
        <button onClick={onLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--bg-navy)',
    borderRight: '1px solid var(--border-frosted)',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    zIndex: 100
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px'
  },
  logoCircle: {
    fontSize: '24px',
    background: 'rgba(0, 180, 216, 0.1)',
    border: '1px solid var(--accent-cyan)',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: 'var(--glow-cyan)'
  },
  brandText: {
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  brandSub: {
    fontSize: '11px',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  profileContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-frosted)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '24px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-cyan)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
    boxShadow: 'var(--glow-cyan)'
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden'
  },
  profileName: {
    fontWeight: '600',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--text-primary)'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1
  },
  navBtn: {
    textAlign: 'left',
    background: 'transparent',
    border: '1px solid transparent',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'var(--transition-smooth)'
  },
  navBtnActive: {
    background: 'rgba(0, 180, 216, 0.08)',
    border: '1px solid var(--border-active)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    boxShadow: 'var(--glow-cyan)'
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-frosted)'
  },
  logoutBtn: {
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    padding: '12px 16px',
    color: '#EF4444',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: 'var(--radius-md)',
    transition: 'var(--transition-smooth)'
  }
};

export default Sidebar;
