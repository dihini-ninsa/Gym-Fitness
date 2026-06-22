import React, { useState, useEffect } from 'react';

export const Dashboard = ({ user, token, onXpGain, onUpdateUser }) => {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [dbMode, setDbMode] = useState('MongoDB Connection');
  const [gymOccupancy, setGymOccupancy] = useState('Low Activity');
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    fetchActiveChallenges();
    fetchDbStatus();
    if (user.role === 'admin' || user.role === 'coach') {
      fetchUsers();
    }
  }, []);

  const fetchActiveChallenges = async () => {
    try {
      const response = await fetch('/api/challenges', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Filter challenges where the user has joined and has not completed
        const joined = data.filter(c => 
          c.participants.some(p => p.userId === user._id.toString() && !p.completed)
        );
        setActiveChallenges(joined);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const response = await fetch('/');
      const data = await response.json();
      if (response.ok && data.mode) {
        setDbMode(data.mode);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsersList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogWorkout = async (challengeId) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ increment: 1 })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message + (data.completed ? ` Unlocked: ${data.badgeEarned}` : ''));
        
        // Refresh challenges
        fetchActiveChallenges();
        
        // Update user context state (for navbar XP/badges rendering)
        if (onUpdateUser) {
          const profileRes = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const profile = await profileRes.json();
          if (profileRes.ok) {
            onUpdateUser(profile);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Render role-specific widgets
  const renderUserWidgets = () => {
    return (
      <div style={styles.widgetGrid}>
        {/* Metric Card: Daily target tracker */}
        <div style={styles.metricCard} className="glass-panel">
          <span style={styles.metricIcon}>🔥</span>
          <h4 style={styles.metricTitle}>Active Caloric Target</h4>
          <h2 style={styles.metricVal}>2,420 <span style={styles.metricUnit}>kcal</span></h2>
          <p style={styles.metricSub}>Recommended daily caloric ceiling</p>
        </div>

        {/* Metric Card: Daily water target tracker */}
        <div style={{ ...styles.metricCard, borderColor: 'var(--border-active)' }} className="glass-panel">
          <span style={styles.metricIcon}>💧</span>
          <h4 style={styles.metricTitle}>Target Fluid Intake</h4>
          <h2 style={{ ...styles.metricVal, color: 'var(--accent-cyan)' }}>2.1 <span style={styles.metricUnit}>Liters</span></h2>
          <p style={styles.metricSub}>Standard active requirement calculator</p>
        </div>

        {/* Unlocked badges card */}
        <div style={styles.wideCard} className="glass-panel">
          <h3 style={styles.cardHeader}>🏆 Unlocked Rank Achievements</h3>
          <p style={styles.cardDesc}>Earn fitness trophies by finishing registered global challenges.</p>
          <div style={styles.badgeRow}>
            {user.badges && user.badges.length > 0 ? (
              user.badges.map((badge, i) => (
                <span key={i} className="badge-gold" style={styles.trophyBadge}>
                  {badge}
                </span>
              ))
            ) : (
              <span style={styles.noTrophies}>No achievements unlocked yet. Go train!</span>
            )}
          </div>
        </div>

        {/* Action Card: Complete current challenges */}
        <div style={styles.wideCard} className="glass-panel">
          <h3 style={styles.cardHeader}>⚡ Active Challenge Logs</h3>
          <p style={styles.cardDesc}>Log metrics to satisfy challenge criteria and unlock rewards:</p>
          <div style={styles.challengeProgressList}>
            {activeChallenges.length === 0 ? (
              <div style={styles.noChallengesPlaceholder}>
                <p>No active challenges joined.</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Head to the Leaderboards page to join community events.</p>
              </div>
            ) : (
              activeChallenges.map(c => {
                const userProgressObj = c.participants.find(p => p.userId === user._id.toString());
                const progress = userProgressObj ? userProgressObj.progress : 0;
                const percentage = Math.round((progress / c.targetGoal) * 100);

                return (
                  <div key={c._id} style={styles.challengeItem} className="glass-card">
                    <div style={styles.challengeMeta}>
                      <h4 style={styles.challengeName}>{c.name}</h4>
                      <button onClick={() => handleLogWorkout(c._id)} className="btn-primary" style={styles.logBtn}>
                        🏋️ Log workout
                      </button>
                    </div>
                    <div style={styles.progressRow}>
                      <div style={styles.barOuter}>
                        <div style={{ ...styles.barInner, width: `${percentage}%` }}></div>
                      </div>
                      <span style={styles.progressNum}>{progress}/{c.targetGoal}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGymWidgets = () => {
    return (
      <div style={styles.widgetGrid}>
        <div style={styles.wideCard} className="glass-panel">
          <h3 style={styles.cardHeader}>🏢 Occupancy Level Controller</h3>
          <p style={styles.cardDesc}>Set current facility occupancy status for user listings:</p>
          <div style={styles.occupancyRow}>
            {['Low Activity', 'Moderate Activity', 'High Capacity'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setGymOccupancy(lvl)}
                className={gymOccupancy === lvl ? "btn-primary" : "btn-secondary"}
                style={styles.occupancyBtn}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.wideCard} className="glass-panel">
          <h3 style={styles.cardHeader}>🎫 Facility Check-In Status</h3>
          <p style={styles.cardDesc}>Active turnstile tracking code: <span style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>AEGIS-QR-ON</span></p>
          <div style={styles.dummyWidget}>
            <div style={styles.radarWave}>🟢</div>
            <p>Automatic RFID/QR Check-in scanner scanner active on Port 5000</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCoachWidgets = () => {
    // Filter contacts that are users
    const clients = usersList.filter(u => u.role === 'user');

    return (
      <div style={styles.widgetGrid}>
        <div style={styles.wideCard} className="glass-panel">
          <h3 style={styles.cardHeader}>🎓 Registered Client Roster</h3>
          <p style={styles.cardDesc}>Monitor and review profile metrics for assigned network members:</p>
          <div style={styles.clientGrid}>
            {clients.length === 0 ? (
              <p style={styles.emptyText}>No registered clients found on the network.</p>
            ) : (
              clients.map(c => (
                <div key={c._id} style={styles.clientCard} className="glass-card">
                  <div style={styles.clientAvatar}>{c.username.charAt(0).toUpperCase()}</div>
                  <h4 style={styles.clientName}>{c.username}</h4>
                  <span className="badge-gold">🏆 {c.xp} XP</span>
                  <span style={styles.clientMail}>{c.email}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAdminWidgets = () => {
    return (
      <div style={styles.widgetGrid}>
        {/* System Diagnostics */}
        <div style={styles.wideCard} className="glass-panel">
          <h3 style={styles.cardHeader}>🛡️ AegisFit System Logs</h3>
          <p style={styles.cardDesc}>Real-time MERN node configuration diagnostic metrics:</p>
          <div style={styles.diagnosticsGrid}>
            <div style={styles.diagnosticItem} className="glass-card">
              <span>Database Engine Status</span>
              <span className="badge-cyan">{dbMode}</span>
            </div>
            <div style={styles.diagnosticItem} className="glass-card">
              <span>Server Protocol</span>
              <span className="badge-cyan">Express API / Port 5000</span>
            </div>
            <div style={styles.diagnosticItem} className="glass-card">
              <span>Web Interface</span>
              <span className="badge-cyan">Vite SPA / Port 3000</span>
            </div>
          </div>
        </div>

        {/* User List Moderation */}
        <div style={styles.wideCard} className="glass-panel">
          <h3 style={styles.cardHeader}>👥 Platform Account Registry</h3>
          <p style={styles.cardDesc}>Global registry profile verification console:</p>
          <div style={styles.registryList}>
            {usersList.map(u => (
              <div key={u._id} style={styles.registryItem} className="glass-card">
                <div>
                  <h4 style={styles.registryName}>{u.username}</h4>
                  <span style={styles.registryEmail}>{u.email}</span>
                </div>
                <span className="badge-gold">{u.role.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.welcomeBanner} className="glass-panel">
        <h2 style={styles.bannerTitle}>Console Panel: Dashboard</h2>
        <p style={styles.bannerDesc}>
          System Database status: <strong style={{ color: 'var(--accent-cyan)' }}>{dbMode}</strong>
        </p>
      </div>

      {user.role === 'user' && renderUserWidgets()}
      {user.role === 'gym' && renderGymWidgets()}
      {user.role === 'coach' && renderCoachWidgets()}
      {user.role === 'admin' && renderAdminWidgets()}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  welcomeBanner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  bannerTitle: {
    fontSize: '22px',
    fontWeight: '800'
  },
  bannerDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  widgetGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  metricCard: {
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderLeft: '4px solid var(--accent-cyan)'
  },
  metricIcon: {
    fontSize: '24px'
  },
  metricTitle: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  metricVal: {
    fontSize: '28px',
    fontWeight: '800'
  },
  metricUnit: {
    fontSize: '14px',
    color: 'var(--text-secondary)'
  },
  metricSub: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  wideCard: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardHeader: {
    fontSize: '16px',
    fontWeight: '700'
  },
  cardDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '6px'
  },
  trophyBadge: {
    fontSize: '13px',
    padding: '6px 12px'
  },
  noTrophies: {
    fontSize: '13px',
    color: 'var(--text-muted)'
  },
  challengeProgressList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '6px'
  },
  noChallengesPlaceholder: {
    textAlign: 'center',
    padding: '20px',
    color: 'var(--text-muted)',
    fontSize: '13px'
  },
  challengeItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  challengeMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  challengeName: {
    fontSize: '14px',
    fontWeight: '700'
  },
  logBtn: {
    padding: '6px 12px',
    fontSize: '12px'
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  barOuter: {
    flexGrow: 1,
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  barInner: {
    height: '100%',
    backgroundColor: 'var(--accent-cyan)',
    boxShadow: 'var(--glow-cyan)',
    borderRadius: '4px',
    transition: 'width 0.4s ease'
  },
  progressNum: {
    fontSize: '12px',
    fontWeight: '700',
    minWidth: '35px',
    textAlign: 'right'
  },
  occupancyRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px'
  },
  occupancyBtn: {
    flex: 1,
    padding: '12px',
    fontSize: '14px'
  },
  dummyWidget: {
    background: 'rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--border-frosted)',
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  radarWave: {
    fontSize: '24px',
    animation: 'pulseGlow 2s infinite ease-in-out',
    borderRadius: '50%'
  },
  clientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
    marginTop: '8px'
  },
  clientCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px'
  },
  clientAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-navy)',
    border: '1px solid var(--border-frosted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-primary)',
    fontWeight: '700',
    fontSize: '20px'
  },
  clientName: {
    fontSize: '14px',
    fontWeight: '700'
  },
  clientMail: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    gridColumn: '1/-1',
    textAlign: 'center',
    padding: '20px'
  },
  diagnosticsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px'
  },
  diagnosticItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px'
  },
  registryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  registryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  registryName: {
    fontSize: '14px',
    fontWeight: '700'
  },
  registryEmail: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  }
};

export default Dashboard;
