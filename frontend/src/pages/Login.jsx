import React, { useState } from 'react';
import loginBg from '../assets/login-bg.png';

export const Login = ({ onNavigate, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('❌ Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store in localStorage for persistence
        localStorage.setItem('aegisfit_token', data.token);
        localStorage.setItem('aegisfit_user', JSON.stringify(data));
        onAuthSuccess(data, data.token);
      } else {
        setError(`❌ ${data.message}`);
      }
    } catch (err) {
      setError('❌ Network error during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.formCard}>
        <div style={styles.header}>
          <button onClick={() => onNavigate('home')} style={styles.backBtn}>← Back</button>
          <span style={styles.logo}>🛡️</span>
          <h2 style={styles.title}>AegisFit Console</h2>
          <p style={styles.subtitle}>Enter credentials to access the secure network console.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. member@aegisfit.net"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Console Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={styles.submitBtn}>
            {loading ? 'Decrypting Access...' : 'Login'}
          </button>

          {error && <p style={styles.errorText}>{error}</p>}
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>First time here?</span>
          <button onClick={() => onNavigate('register')} style={styles.linkBtn}>
            Register Here
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
    backgroundImage: `linear-gradient(90deg, rgba(10,14,26,0.15) 0%, rgba(10,14,26,0.35) 45%, rgba(10,14,26,0.92) 75%, rgba(10,14,26,0.98) 100%), url(${loginBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '24px 8vw'
  },
  formCard: {
    width: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '40px',
    borderRadius: '20px',
    background: 'rgba(13, 18, 33, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)'
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
    fontSize: '36px',
    marginBottom: '8px',
    filter: 'drop-shadow(0 0 12px rgba(0, 180, 216, 0.5))'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ffffff 0%, #B8C4D9 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
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
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  submitBtn: {
    marginTop: '8px',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0, 180, 216, 0.35)',
    fontWeight: '700',
    letterSpacing: '0.3px'
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

export default Login;