import React, { useState } from 'react';
import registerBg from '../assets/register-bg.png';

const ROLES = [
  { id: 'user', title: '🏋️ User', desc: 'Personal fitness and routine builder builder tracker.' },
  { id: 'coach', title: '🎓 Coach', desc: 'Build clients, share tip sheets, set bookings.' },
  { id: 'gym', title: '🏢 Gym Owner', desc: 'Promote slots, publish classes, manage entries.' },
  { id: 'admin', title: '🛡️ Admin', desc: 'Approve profiles, moderate lists, run network audits.' }
];

export const Register = ({ onNavigate, onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [nic, setNic] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [adminSecret, setAdminSecret] = useState('');
  const [coachSecret, setCoachSecret] = useState('');
  const [gymownerSecret, setGymownerSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !age || !phone || !nic) {
      setError('❌ Please fill all fields');
      return;
    }

    if (phone.length !== 10) {
      setError('❌ Phone number must be exactly 10 digits');
      return;
    }

    const oldNicPattern = /^\d{9}[Vv]$/;
    const newNicPattern = /^\d{12}$/;
    if (!oldNicPattern.test(nic) && !newNicPattern.test(nic)) {
      setError('❌ NIC must be 9 digits followed by V (e.g. 991234567V) or 12 digits (e.g. 199912345678)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          age,
          phone,
          nic,
          role: selectedRole,
          adminSecret,
          coachSecret,
          gymownerSecret
        })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('aegisfit_token', data.token);
        localStorage.setItem('aegisfit_user', JSON.stringify(data));
        onAuthSuccess(data, data.token);
      } else {
        setError(`❌ ${data.message}`);
      }
    } catch (err) {
      setError('❌ Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
  };

  const handleNicChange = (e) => {
    const raw = e.target.value;
    // Strip anything that isn't a digit or V/v
    let cleaned = raw.replace(/[^0-9Vv]/g, '');

    const hasV = /[Vv]$/.test(cleaned);

    if (hasV) {
      // Old format: 9 digits + V
      const digits = cleaned.replace(/[Vv]/g, '').slice(0, 9);
      cleaned = digits + 'V';
    } else {
      // New format: up to 12 digits, no V allowed mid-string
      cleaned = cleaned.replace(/[Vv]/g, '').slice(0, 12);
    }

    setNic(cleaned);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.formCard} className="glass-panel">
        <div style={styles.header}>
          <button onClick={() => onNavigate('home')} style={styles.backBtn}>← Back</button>
          <span style={styles.logo}>🛡️</span>
          <h2 style={styles.title}>Establish Access Profile</h2>
          <p style={styles.subtitle}>Register your credentials and choose your account role.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Console Alias (Username)</label>
            <input
              type="text"
              placeholder="e.g. CaptainAegis"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. user@aegisfit.net"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password key</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Age</label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="13"
                max="120"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 0771234567"
                value={phone}
                onChange={handlePhoneChange}
                inputMode="numeric"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>NIC Number</label>
            <input
              type="text"
              placeholder="e.g. 200012345678 or 991234567V"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
            />
          </div>

          {/* Role Card Selection Grid */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Network Profile Role</label>
            <div style={styles.roleGrid}>
              {ROLES.map(role => {
                const isActive = selectedRole === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    style={{
                      ...styles.roleCard,
                      ...(isActive ? styles.roleCardActive : {})
                    }}
                  >
                    <h4 style={styles.roleCardTitle}>{role.title}</h4>
                    <p style={styles.roleCardDesc}>{role.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Verification Input Field */}
          {selectedRole === 'admin' && (
            <div style={styles.formGroup} className="animate-fade-in">
              <label style={styles.label}>Admin Verification Secret Key</label>
              <input
                type="password"
                placeholder="Enter admin secret key"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                required
              />
            </div>
          )}

          {selectedRole === 'coach' && (
            <div style={styles.formGroup} className="animate-fade-in">
              <label style={styles.label}>Coach Verification Secret Key</label>
              <input
                type="password"
                placeholder="Enter coach secret key"
                value={coachSecret}
                onChange={(e) => setCoachSecret(e.target.value)}
                required
              />
            </div>
          )}

          {selectedRole === 'gym' && (
            <div style={styles.formGroup} className="animate-fade-in">
              <label style={styles.label}>Gym Owner Verification Secret Key</label>
              <input
                type="password"
                placeholder="Enter gym owner secret key"
                value={gymownerSecret}
                onChange={(e) => setGymownerSecret(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={styles.submitBtn}>
            {loading ? 'Establishing Node...' : 'Register'}
          </button>

          {error && <p style={styles.errorText}>{error}</p>}
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Already part of the network?</span>
          <button onClick={() => onNavigate('login')} style={styles.linkBtn}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundImage: `linear-gradient(270deg, rgba(10,14,26,0.25) 0%, rgba(10,14,26,0.55) 100%), url(${registerBg})`, backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '40px 8vw'
  },
  formCard: {
    width: '520px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    width: '100%'
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    fontWeight: '600',
    fontSize: '14px'
  },
  logo: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  title: {
    fontSize: '22px',
    fontWeight: '800'
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    lineHeight: '1.4'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formRow: {
    display: 'flex',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '6px'
  },
  roleCard: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-frosted)',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    transition: 'var(--transition-smooth)'
  },
  roleCardActive: {
    background: 'rgba(0, 180, 216, 0.05)',
    borderColor: 'var(--accent-cyan)',
    boxShadow: 'var(--glow-cyan)'
  },
  roleCardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  roleCardDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: '1.3'
  },
  submitBtn: {
    marginTop: '8px',
    justifyContent: 'center'
  },
  errorText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center'
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    borderTop: '1px solid var(--border-frosted)',
    paddingTop: '16px'
  },
  footerText: {
    fontSize: '13px',
    color: 'var(--text-muted)'
  },
  linkBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent-cyan)',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    fontWeight: '600',
    fontSize: '14px'
  }
};

export default Register;
