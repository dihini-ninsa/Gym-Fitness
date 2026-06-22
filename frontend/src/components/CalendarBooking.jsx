import React, { useState, useEffect } from 'react';

export const CalendarBooking = ({ user, token }) => {
  const [hosts, setHosts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedHostId, setSelectedHostId] = useState('');
  const [bookingType, setBookingType] = useState('slot');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [message, setMessage] = useState('');
  const [ticketModalData, setTicketModalData] = useState(null);

  useEffect(() => {
    fetchHosts();
    fetchBookings();
  }, []);

  const fetchHosts = async () => {
    try {
      const response = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Filter gyms and coaches as valid hosts
        const filtered = data.filter(h => h.role === 'gym' || h.role === 'coach');
        setHosts(filtered);
        if (filtered.length > 0) setSelectedHostId(filtered[0]._id);
      }
    } catch (e) {
      console.error('Error fetching hosts:', e);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setBookings(data);
      }
    } catch (e) {
      console.error('Error loading bookings:', e);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHostId || !bookingDate || !bookingTime) {
      setMessage('❌ Please fill all fields to reserve a slot');
      return;
    }

    const host = hosts.find(h => h._id === selectedHostId);
    if (!host) return;

    try {
      setMessage('Booking...');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hostId: host._id,
          hostName: host.username,
          dateTime: `${bookingDate} at ${bookingTime}`,
          type: bookingType
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Booking successfully created!');
        setBookingDate('');
        setBookingTime('');
        fetchBookings();
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (e) {
      setMessage('❌ Network error processing booking');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchBookings();
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const deleteBooking = async (id) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchBookings();
      }
    } catch (e) {
      console.error('Error deleting booking:', e);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {user.role === 'user' && (
        <div style={styles.leftColumn} className="glass-panel">
          <h3 style={styles.title}>Book a Training Session / Slot</h3>
          <p style={styles.desc}>Select your gym or coach, pick a schedule, and lock in your reservation.</p>

          <form onSubmit={handleBookingSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Provider (Gym / Coach)</label>
              <select value={selectedHostId} onChange={(e) => setSelectedHostId(e.target.value)}>
                {hosts.length === 0 ? (
                  <option value="">No providers available</option>
                ) : (
                  hosts.map(h => (
                    <option key={h._id} value={h._id}>
                      {h.username} ({h.role === 'gym' ? 'Gym Facility' : 'Personal Coach'})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Booking Type</label>
              <select value={bookingType} onChange={(e) => setBookingType(e.target.value)}>
                <option value="slot">🏢 General Gym Access Slot</option>
                <option value="class">🏃 Group Fitness Class Session</option>
                <option value="coaching">🎓 1-on-1 Personal Coaching</option>
              </select>
            </div>

            <div style={styles.formRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Choose Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Select Time</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={styles.submitBtn}>
              📅 Request Reservation
            </button>

            {message && <p style={styles.message}>{message}</p>}
          </form>
        </div>
      )}

      {/* Right side: List of Bookings */}
      <div style={styles.rightColumn} className="glass-panel">
        <h3 style={styles.title}>
          {user.role === 'user' ? '📋 My Active Bookings' : '⚙️ Manage Booking Queue'}
        </h3>
        <p style={styles.desc}>
          {user.role === 'user'
            ? 'Track status and get your visual digital entry ticket.'
            : 'Review, confirm, or decline booking request updates from the community.'}
        </p>

        <div style={styles.bookingList}>
          {bookings.length === 0 ? (
            <p style={styles.emptyText}>No upcoming bookings found on your calendar.</p>
          ) : (
            bookings.map(b => (
              <div key={b._id} style={styles.bookingCard} className="glass-card">
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.cardHost}>{b.hostName}</h4>
                    <span style={styles.cardType}>
                      {b.type === 'slot' ? '🏢 Gym Access Slot' : b.type === 'class' ? '🏃 Group Class' : '🎓 Personal Coaching'}
                    </span>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: b.status === 'confirmed' ? 'rgba(34, 197, 94, 0.1)' : b.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      borderColor: b.status === 'confirmed' ? '#22C55E' : b.status === 'rejected' ? '#EF4444' : '#EAB308',
                      color: b.status === 'confirmed' ? '#22C55E' : b.status === 'rejected' ? '#EF4444' : '#EAB308',
                    }}
                  >
                    {b.status.toUpperCase()}
                  </span>
                </div>

                <div style={styles.cardDetails}>
                  <p>⏳ {b.dateTime}</p>
                  {b.qrCodeToken && <p style={styles.codeText}>Ticket Code: {b.qrCodeToken}</p>}
                </div>

                <div style={styles.cardActions}>
                  {user.role === 'user' && b.status === 'confirmed' && (
                    <button onClick={() => setTicketModalData(b)} className="btn-gold" style={styles.cardBtn}>
                      🎫 Show Pass
                    </button>
                  )}
                  {user.role === 'user' && b.status !== 'confirmed' && (
                    <button onClick={() => deleteBooking(b._id)} style={styles.cancelBtn}>
                      Cancel Request
                    </button>
                  )}
                  {(user.role === 'gym' || user.role === 'coach' || user.role === 'admin') && b.status === 'pending' && (
                    <div style={styles.adminActionRow}>
                      <button onClick={() => handleStatusUpdate(b._id, 'confirmed')} className="btn-primary" style={styles.actionBtn}>
                        Approve
                      </button>
                      <button onClick={() => handleStatusUpdate(b._id, 'rejected')} style={styles.rejectBtn}>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Modal */}
      {ticketModalData && (
        <div style={styles.modalOverlay} onClick={() => setTicketModalData(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>AegisFit Check-in Pass</h3>
              <button onClick={() => setTicketModalData(null)} style={styles.closeBtn}>×</button>
            </div>
            <div style={styles.modalContent}>
              <div style={styles.ticketVisual}>
                <h2 style={styles.ticketHost}>{ticketModalData.hostName}</h2>
                <p style={styles.ticketType}>{ticketModalData.type.toUpperCase()} ACCESS PASS</p>
                <div style={styles.barcodeVisual}>
                  <div style={styles.barcodeLines}>
                    {[...Array(18)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.barcodeLine,
                          width: `${Math.floor(Math.random() * 4) + 1}px`,
                          marginRight: `${Math.floor(Math.random() * 3) + 1}px`
                        }}
                      ></div>
                    ))}
                  </div>
                  <span style={styles.barcodeText}>{ticketModalData.qrCodeToken}</span>
                </div>
                <div style={styles.ticketFooter}>
                  <p>Valid on: {ticketModalData.dateTime}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scan at turnstile screen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  leftColumn: {
    flex: '1 1 380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  rightColumn: {
    flex: '1.5 1 480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  desc: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '12px'
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
  formRow: {
    display: 'flex',
    gap: '16px'
  },
  submitBtn: {
    marginTop: '8px',
    justifyContent: 'center'
  },
  message: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--accent-cyan)'
  },
  bookingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '12px',
    maxHeight: '500px',
    overflowY: 'auto',
    paddingRight: '6px'
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    textAlign: 'center',
    padding: '24px'
  },
  bookingCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardHost: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  cardType: {
    fontSize: '11px',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '12px',
    border: '1px solid'
  },
  cardDetails: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  codeText: {
    fontFamily: 'monospace',
    color: 'var(--text-muted)',
    fontSize: '12px'
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  cardBtn: {
    padding: '6px 12px',
    fontSize: '13px'
  },
  cancelBtn: {
    background: 'transparent',
    border: 'none',
    color: '#EF4444',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  adminActionRow: {
    display: 'flex',
    gap: '12px'
  },
  actionBtn: {
    padding: '8px 16px',
    fontSize: '13px'
  },
  rejectBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #EF4444',
    color: '#EF4444',
    borderRadius: 'var(--radius-md)',
    padding: '8px 16px',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'var(--transition-smooth)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  modalCard: {
    backgroundColor: 'var(--bg-navy)',
    border: '1px solid var(--border-frosted)',
    width: '380px',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-frosted)',
    paddingBottom: '12px'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '24px',
    cursor: 'pointer'
  },
  modalContent: {
    display: 'flex',
    justifyContent: 'center'
  },
  ticketVisual: {
    background: 'linear-gradient(145deg, #1C2541, #0B132B)',
    border: '2px solid var(--accent-gold)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxShadow: 'var(--glow-gold)'
  },
  ticketHost: {
    color: 'var(--text-primary)',
    fontWeight: '800',
    fontSize: '20px'
  },
  ticketType: {
    color: 'var(--accent-cyan)',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  barcodeVisual: {
    background: '#FFFFFF',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    width: '80%'
  },
  barcodeLines: {
    display: 'flex',
    height: '40px',
    alignItems: 'stretch'
  },
  barcodeLine: {
    backgroundColor: '#000000'
  },
  barcodeText: {
    color: '#000000',
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: '12px'
  },
  ticketFooter: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  }
};

export default CalendarBooking;
