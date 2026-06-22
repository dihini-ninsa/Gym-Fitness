import React, { useState, useEffect, useRef } from 'react';

export const LiveChat = ({ user, token }) => {
  const [contacts, setContacts] = useState([]);
  const [activeContactId, setActiveContactId] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const messageEndRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    let intervalId;
    if (activeContactId) {
      fetchMessages();
      // Auto-poll messages every 4 seconds to simulate real-time chat
      intervalId = setInterval(fetchMessages, 4000);
    }
    return () => clearInterval(intervalId);
  }, [activeContactId]);

  useEffect(() => {
    // Scroll to bottom when messages list updates
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Users chat with coaches; coaches chat with users
        const targetRole = user.role === 'user' ? 'coach' : 'user';
        const filtered = data.filter(c => c.role === targetRole);
        setContacts(filtered);
        if (filtered.length > 0) {
          setActiveContactId(filtered[0]._id);
        }
      }
    } catch (e) {
      console.error('Error fetching contacts:', e);
    }
  };

  const fetchMessages = async () => {
    if (!activeContactId) return;
    try {
      const response = await fetch(`/api/messages/${activeContactId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      }
    } catch (e) {
      console.error('Error fetching message history:', e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeContactId) return;

    try {
      setSending(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: activeContactId,
          content: newMessageText
        })
      });

      const data = await response.json();
      if (response.ok) {
        setNewMessageText('');
        // Optimistically add message to feed immediately
        setMessages(prev => [...prev, data]);
      }
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setSending(false);
    }
  };

  const activeContact = contacts.find(c => c._id === activeContactId);

  return (
    <div style={styles.container} className="animate-fade-in glass-panel">
      {/* Contact Column */}
      <div style={styles.contactColumn}>
        <h3 style={styles.columnTitle}>📩 Conversations</h3>
        <p style={styles.columnDesc}>
          {user.role === 'user' ? 'Talk to registered coaches:' : 'Interact with training clients:'}
        </p>

        <div style={styles.contactList}>
          {contacts.length === 0 ? (
            <p style={styles.emptyText}>No available contacts found.</p>
          ) : (
            contacts.map(c => {
              const isActive = c._id === activeContactId;
              return (
                <button
                  key={c._id}
                  onClick={() => setActiveContactId(c._id)}
                  style={{
                    ...styles.contactCard,
                    ...(isActive ? styles.contactCardActive : {})
                  }}
                >
                  <div style={styles.avatar}>{c.username.charAt(0).toUpperCase()}</div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={styles.contactName}>{c.username}</p>
                    <span style={styles.contactRole}>
                      {c.role === 'coach' ? '🎓 Personal Trainer' : '🏋️ Training Member'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Conversation Column */}
      <div style={styles.chatColumn}>
        {activeContact ? (
          <div style={styles.chatWrapper}>
            {/* Header info */}
            <div style={styles.chatHeader}>
              <div style={styles.activeAvatar}>{activeContact.username.charAt(0).toUpperCase()}</div>
              <div>
                <h4 style={styles.activeTitle}>{activeContact.username}</h4>
                <span style={styles.activeStatus}>🟢 Online (Auto-sync active)</span>
              </div>
            </div>

            {/* Message Feed */}
            <div style={styles.messageFeed}>
              {messages.length === 0 ? (
                <div style={styles.emptyFeedPlaceholder}>
                  <p>💬 Conversation initialized.</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Send a message to introduce yourself and establish goals.</p>
                </div>
              ) : (
                messages.map(m => {
                  const isOwnMessage = m.senderId === user._id.toString();
                  return (
                    <div
                      key={m._id}
                      style={{
                        ...styles.msgContainer,
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          ...styles.msgBubble,
                          ...(isOwnMessage ? styles.msgBubbleOwn : styles.msgBubblePartner)
                        }}
                      >
                        <p style={styles.msgContent}>{m.content}</p>
                        <span style={styles.msgTime}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Bottom input bar */}
            <form onSubmit={handleSendMessage} style={styles.inputForm}>
              <input
                type="text"
                placeholder={`Message ${activeContact.username}...`}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                style={styles.chatInput}
                disabled={sending}
              />
              <button type="submit" disabled={sending} className="btn-primary" style={styles.sendBtn}>
                🚀 Send
              </button>
            </form>
          </div>
        ) : (
          <div style={styles.placeholderColumn}>
            <span style={{ fontSize: '48px' }}>💬</span>
            <h4>No Active Chats</h4>
            <p style={{ color: 'var(--text-muted)' }}>Select a personal training coach or client from the sidebar roster roster to establish a message thread.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '520px',
    padding: 0,
    overflow: 'hidden'
  },
  contactColumn: {
    width: '280px',
    borderRight: '1px solid var(--border-frosted)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    backgroundColor: 'rgba(10, 14, 26, 0.2)'
  },
  columnTitle: {
    fontSize: '18px',
    fontWeight: '700'
  },
  columnDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '16px'
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
    flexGrow: 1
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    textAlign: 'center',
    padding: '16px 0'
  },
  contactCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    border: '1px solid transparent',
    background: 'transparent',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    width: '100%',
    transition: 'var(--transition-smooth)'
  },
  contactCardActive: {
    background: 'rgba(0, 180, 216, 0.06)',
    borderColor: 'var(--border-active)'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-card-hover)',
    border: '1px solid var(--border-frosted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-primary)',
    fontWeight: '600'
  },
  contactName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  contactRole: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  chatColumn: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  chatWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-frosted)',
    backgroundColor: 'rgba(10, 14, 26, 0.1)'
  },
  activeAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-cyan)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    boxShadow: 'var(--glow-cyan)'
  },
  activeTitle: {
    fontSize: '15px',
    fontWeight: '700'
  },
  activeStatus: {
    fontSize: '11px',
    color: '#22C55E',
    fontWeight: '600'
  },
  messageFeed: {
    flexGrow: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  },
  emptyFeedPlaceholder: {
    margin: 'auto',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px'
  },
  msgContainer: {
    display: 'flex',
    width: '100%'
  },
  msgBubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  msgBubbleOwn: {
    backgroundColor: 'var(--accent-cyan)',
    color: '#FFFFFF',
    borderBottomRightRadius: '2px',
    boxShadow: 'var(--glow-cyan)'
  },
  msgBubblePartner: {
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    borderBottomLeftRadius: '2px',
    border: '1px solid var(--border-frosted)'
  },
  msgContent: {
    fontSize: '14px',
    wordBreak: 'break-word',
    lineHeight: '1.4'
  },
  msgTime: {
    fontSize: '10px',
    alignSelf: 'flex-end',
    opacity: 0.7,
    fontFamily: 'monospace'
  },
  inputForm: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid var(--border-frosted)',
    backgroundColor: 'rgba(10, 14, 26, 0.2)'
  },
  chatInput: {
    flexGrow: 1,
    borderRadius: 'var(--radius-md)'
  },
  sendBtn: {
    padding: '0 24px'
  },
  placeholderColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    height: '100%',
    textAlign: 'center',
    padding: '40px'
  }
};

export default LiveChat;
