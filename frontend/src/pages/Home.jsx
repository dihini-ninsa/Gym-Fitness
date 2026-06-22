import React from 'react';
import homeBg from '../assets/home-bg.png';

export const Home = ({ onNavigate }) => {
  return (
    <div style={styles.container}>
      {/* Navbar Header */}
      <nav style={styles.nav}>
        <div style={styles.brand}>
          <span style={styles.logo}>🛡️</span>
          <h2 style={styles.brandName}>AegisFit</h2>
        </div>
        <div style={styles.navLinks}>
          <button onClick={() => onNavigate('login')} className="btn-secondary" style={styles.navBtn}>
            Sign In
          </button>
          <button onClick={() => onNavigate('register')} className="btn-primary" style={styles.navBtn}>
            Join Network
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero} className="animate-fade-in">
        <div style={styles.heroContent}>
          <span style={styles.badge} className="badge-gold">Next-Gen MERN Fitness Ecosystem</span>
          <h1 style={styles.heroTitle}>
            Training Evolved. <br />
            <span className="gold-text-gradient">Elite Connections.</span>
          </h1>
          <p style={styles.heroText}>
            AegisFit unites elite athletes, training coaches, and advanced gym facilities in a unified Navy-themed platform. Build routines, manage slot occupancies, and synchronize nutrition targets instantly.
          </p>
          <div style={styles.heroActionRow}>
            <button onClick={() => onNavigate('register')} className="btn-gold" style={styles.actionBtn}>
              Create Free Account
            </button>
            <button onClick={() => onNavigate('login')} className="btn-secondary" style={styles.actionBtn}>
              Access Console
            </button>
          </div>
        </div>


      </section>

      {/* Feature Grid */}
      <section style={styles.features}>
        <h2 style={styles.sectionHeading}>Engineered For Every Fitness Role</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard} className="glass-panel">
            <span style={styles.featureIcon}>🏋️</span>
            <h3 style={styles.featureName}>For Members</h3>
            <p style={styles.featureDesc}>
              Construct workouts on the Drag-and-Drop Routine Canvas, generate shopping manifests via the AI Meal Planner, and check in via visual turnstile ticket passes.
            </p>
          </div>
          <div style={styles.featureCard} className="glass-panel">
            <span style={styles.featureIcon}>🎓</span>
            <h3 style={styles.featureName}>For Personal Coaches</h3>
            <p style={styles.featureDesc}>
              Build your professional client portfolio, review members' nutrition logs, and set up live 1-on-1 video training training calls.
            </p>
          </div>
          <div style={styles.featureCard} className="glass-panel">
            <span style={styles.featureIcon}>🏢</span>
            <h3 style={styles.featureName}>For Gym Operators</h3>
            <p style={styles.featureDesc}>
              Track building occupancy, accept class booking reservations, and replace print flyers with targeted in-app promotions.
            </p>
          </div>
          <div style={styles.featureCard} className="glass-panel">
            <span style={styles.featureIcon}>🛡️</span>
            <h3 style={styles.featureName}>For Network Admins</h3>
            <p style={styles.featureDesc}>
              Approve new gyms, verify professional credentials, moderate reviews, and ensure secure platform operations from a central dashboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: `linear-gradient(180deg, rgba(10,14,26,0.45) 0%, rgba(10,14,26,0.65) 60%, rgba(10,14,26,0.85) 100%), url(${homeBg})`, backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 24px',
    color: 'var(--text-primary)'
  },
  nav: {
    width: '100%',
    maxWidth: '1200px',
    height: '80px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-frosted)'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logo: {
    fontSize: '24px'
  },
  brandName: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  navLinks: {
    display: 'flex',
    gap: '16px'
  },
  navBtn: {
    padding: '8px 16px',
    fontSize: '14px'
  },
  hero: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '80px 0',
    gap: '40px',
    flexWrap: 'wrap'
  },
  heroContent: {
    flex: '1 1 500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '24px'
  },
  badge: {
    padding: '6px 12px',
    fontSize: '13px'
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    lineHeight: '1.1',
    letterSpacing: '-1px'
  },
  heroText: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    maxWidth: '520px',
    lineHeight: '1.6'
  },
  heroActionRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  actionBtn: {
    padding: '14px 28px',
    fontSize: '15px'
  },
  heroMockup: {
    flex: '1 1 450px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mockupMainCard: {
    width: '380px',
    height: '240px',
    padding: 0,
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    animation: 'pulseGlow 6s infinite ease-in-out'
  },
  mockupHeader: {
    height: '40px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid var(--border-frosted)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    justifyContent: 'space-between'
  },
  mockupDots: {
    display: 'flex',
    gap: '6px'
  },
  mockupDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  mockupTitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'monospace'
  },
  mockupBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  mockupRow: {
    height: '8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  mockupBlocks: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px'
  },
  mockupBlock: {
    flex: 1,
    height: '70px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
    background: 'rgba(255, 255, 255, 0.01)',
    fontWeight: '700',
    fontSize: '16px'
  },
  features: {
    width: '100%',
    maxWidth: '1200px',
    padding: '60px 0 100px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    alignItems: 'center'
  },
  sectionHeading: {
    fontSize: '28px',
    fontWeight: '800',
    textAlign: 'center'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
    width: '100%'
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'flex-start'
  },
  featureIcon: {
    fontSize: '32px',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-frosted)'
  },
  featureName: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  featureDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  }
};

export default Home;
