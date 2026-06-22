import React, { useState, useEffect } from 'react';

export const Leaderboard = ({ user, token, onUpdateUser }) => {
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);

  // Admin form state
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cXp, setCXp] = useState(100);
  const [cGoal, setCGoal] = useState(10);
  const [cUnit, setCUnit] = useState('workouts');
  const [cStart, setCStart] = useState('');
  const [cEnd, setCEnd] = useState('');

  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    fetchLeaderboard();
    fetchChallenges();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Sort by XP descending, taking only user roles
        const sorted = data
          .filter(u => u.role === 'user')
          .sort((a, b) => (b.xp || 0) - (a.xp || 0));
        setUsers(sorted);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setChallenges(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchChallenges();

        // Refresh User profile in parent state to synchronise joined challenges
        const profileRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profile = await profileRes.json();
        if (profileRes.ok && onUpdateUser) {
          onUpdateUser(profile);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!cName || !cDesc || !cStart || !cEnd) {
      setFormMsg('❌ Please fill out all required challenge details');
      return;
    }

    try {
      setFormMsg('Creating...');
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: cName,
          description: cDesc,
          targetXp: Number(cXp),
          targetGoal: Number(cGoal),
          unit: cUnit,
          startDate: cStart,
          endDate: cEnd
        })
      });

      const data = await response.json();
      if (response.ok) {
        setFormMsg('✅ Challenge created successfully!');
        setCName('');
        setCDesc('');
        setChallenges(prev => [...prev, data]);
      } else {
        setFormMsg(`❌ Error: ${data.message}`);
      }
    } catch (e) {
      setFormMsg('❌ Network error creating challenge');
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Top 3 Podium visualization */}
      <div style={styles.podiumContainer} className="glass-panel">
        <h3 style={styles.sectionTitle}>🏆 Global Leaderboard Podium</h3>
        <p style={styles.sectionDesc}>Earn XP by logging challenge benchmarks to scale the global ranks.</p>
        <div style={styles.podium}>
          {users.length > 1 && (
            <div style={styles.podiumPlaceSecond}>
              <div style={styles.avatarSecond}>🥈</div>
              <h4 style={styles.podiumName}>{users[1].username}</h4>
              <span className="badge-cyan">{users[1].xp} XP</span>
              <div style={styles.podiumPedestalSecond}>2</div>
            </div>
          )}
          {users.length > 0 && (
            <div style={styles.podiumPlaceFirst}>
              <div style={styles.avatarFirst}>🥇</div>
              <h4 style={styles.podiumName}>{users[0].username}</h4>
              <span className="badge-gold">{users[0].xp} XP</span>
              <div style={styles.podiumPedestalFirst}>1</div>
            </div>
          )}
          {users.length > 2 && (
            <div style={styles.podiumPlaceThird}>
              <div style={styles.avatarThird}>🥉</div>
              <h4 style={styles.podiumName}>{users[2].username}</h4>
              <span className="badge-cyan">{users[2].xp} XP</span>
              <div style={styles.podiumPedestalThird}>3</div>
            </div>
          )}
        </div>
      </div>

      <div style={styles.workspace}>
        {/* Left column: Leaderboard complete list */}
        <div style={styles.columnLeft} className="glass-panel">
          <h3 style={styles.columnTitle}>📊 Global Roster Rankings</h3>
          <div style={styles.userList}>
            {users.map((u, index) => (
              <div key={u._id} style={styles.userRow} className="glass-card">
                <span style={styles.rankNum}>#{index + 1}</span>
                <span style={styles.userName}>{u.username}</span>
                <span className="badge-gold" style={{ fontSize: '11px' }}>{u.xp} XP</span>
              </div>
            ))}
            {users.length === 0 && (
              <p style={styles.emptyText}>No rank entries available yet.</p>
            )}
          </div>
        </div>

        {/* Right column: Active challenges */}
        <div style={styles.columnRight} className="glass-panel">
          <h3 style={styles.columnTitle}>⚔️ Community Global Challenges</h3>
          <p style={styles.sectionDesc}>Join events to secure rare badges and level up your XP stats.</p>

          <div style={styles.challengeList}>
            {challenges.map(c => {
              const isParticipant = c.participants.some(p => p.userId === user._id.toString());
              return (
                <div key={c._id} style={styles.challengeCard} className="glass-card">
                  <div style={styles.cardHeader}>
                    <div>
                      <h4 style={styles.challengeTitle}>{c.name}</h4>
                      <p style={styles.challengeDescText}>{c.description}</p>
                    </div>
                    <span className="badge-gold">+{c.targetXp} XP</span>
                  </div>

                  <div style={styles.cardDetails}>
                    <span>Target: {c.targetGoal} {c.unit}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ends: {c.endDate}</span>
                  </div>

                  <div style={styles.cardActions}>
                    {isParticipant ? (
                      <span className="badge-cyan">🛡️ Active Partner</span>
                    ) : (
                      user.role === 'user' && (
                        <button onClick={() => handleJoinChallenge(c._id)} className="btn-primary" style={styles.joinBtn}>
                          🤝 Join Challenge
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
            {challenges.length === 0 && (
              <p style={styles.emptyText}>No global challenges registered yet.</p>
            )}
          </div>

          {/* Admin challenge creation panel */}
          {user.role === 'admin' && (
            <div style={styles.adminFormContainer} className="glass-card">
              <h4 style={styles.adminFormTitle}>🛡️ Register Global Challenge</h4>
              <form onSubmit={handleCreateChallenge} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Challenge Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Century Squat Marathon"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Detailed Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Complete 10 heavy squat routines in July."
                    value={cDesc}
                    onChange={(e) => setCDesc(e.target.value)}
                  />
                </div>
                <div style={styles.formRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>XP Reward</label>
                    <input
                      type="number"
                      value={cXp}
                      onChange={(e) => setCXp(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Goal Units</label>
                    <input
                      type="number"
                      value={cGoal}
                      onChange={(e) => setCGoal(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Unit Symbol</label>
                    <input
                      type="text"
                      placeholder="workouts"
                      value={cUnit}
                      onChange={(e) => setCUnit(e.target.value)}
                    />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Start Date</label>
                    <input
                      type="date"
                      value={cStart}
                      onChange={(e) => setCStart(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>End Date</label>
                    <input
                      type="date"
                      value={cEnd}
                      onChange={(e) => setCEnd(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-gold" style={styles.adminSubmitBtn}>
                  ⚡ Initialize Global Challenge
                </button>
                {formMsg && <p style={styles.formMsg}>{formMsg}</p>}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingBottom: '40px'
  },
  podiumContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700'
  },
  sectionDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '16px'
  },
  podium: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '20px',
    width: '100%',
    maxWidth: '500px',
    marginTop: '20px',
    height: '220px'
  },
  podiumPlaceFirst: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '120px'
  },
  podiumPlaceSecond: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '110px'
  },
  podiumPlaceThird: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '110px'
  },
  avatarFirst: {
    fontSize: '32px',
    marginBottom: '4px'
  },
  avatarSecond: {
    fontSize: '28px',
    marginBottom: '4px'
  },
  avatarThird: {
    fontSize: '28px',
    marginBottom: '4px'
  },
  podiumName: {
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '4px',
    color: 'var(--text-primary)',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%'
  },
  podiumPedestalFirst: {
    width: '100%',
    height: '110px',
    background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-obsidian) 100%)',
    border: '1px solid var(--accent-gold)',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--accent-gold)'
  },
  podiumPedestalSecond: {
    width: '100%',
    height: '80px',
    background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-obsidian) 100%)',
    border: '1px solid var(--border-frosted)',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-secondary)'
  },
  podiumPedestalThird: {
    width: '100%',
    height: '60px',
    background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-obsidian) 100%)',
    border: '1px solid var(--border-frosted)',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-muted)'
  },
  workspace: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  columnLeft: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  columnRight: {
    flex: '1.5 1 450px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  columnTitle: {
    fontSize: '18px',
    fontWeight: '700'
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px'
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px'
  },
  rankNum: {
    fontFamily: 'monospace',
    fontWeight: '700',
    color: 'var(--accent-cyan)',
    fontSize: '14px'
  },
  userName: {
    fontWeight: '600',
    fontSize: '14px',
    flexGrow: 1,
    marginLeft: '12px'
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    textAlign: 'center',
    padding: '20px'
  },
  challengeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '8px'
  },
  challengeCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
  },
  challengeTitle: {
    fontSize: '15px',
    fontWeight: '700'
  },
  challengeDescText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginTop: '2px'
  },
  cardDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    background: 'rgba(0,0,0,0.1)',
    padding: '8px 12px',
    borderRadius: '6px'
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  joinBtn: {
    padding: '6px 12px',
    fontSize: '12px'
  },
  adminFormContainer: {
    marginTop: '24px',
    border: '1px solid var(--accent-gold)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  adminFormTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--accent-gold)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  formRow: {
    display: 'flex',
    gap: '12px'
  },
  adminSubmitBtn: {
    marginTop: '8px',
    justifyContent: 'center',
    padding: '10px'
  },
  formMsg: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--accent-cyan)'
  }
};

export default Leaderboard;
