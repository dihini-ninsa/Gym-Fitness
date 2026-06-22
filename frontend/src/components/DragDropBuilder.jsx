import React, { useState, useEffect } from 'react';

const PRESET_EXERCISES = [
  { id: 'ex-bench', name: 'Barbell Bench Press', category: 'Chest/Push' },
  { id: 'ex-squat', name: 'Barbell Back Squat', category: 'Legs/Squat' },
  { id: 'ex-deadlift', name: 'Barbell Deadlift', category: 'Back/Pull' },
  { id: 'ex-overhead', name: 'Overhead Press', category: 'Shoulders/Push' },
  { id: 'ex-pullup', name: 'Weighted Pull-Ups', category: 'Back/Pull' },
  { id: 'ex-bicep', name: 'Dumbbell Bicep Curl', category: 'Arms/Pull' },
  { id: 'ex-plank', name: 'Core Plank Hold', category: 'Core/Stability' },
  { id: 'ex-running', name: 'Treadmill Interval Run', category: 'Cardio' }
];

export const DragDropBuilder = ({ user, token, onXpGain }) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [routineExercises, setRoutineExercises] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [savedRoutines, setSavedRoutines] = useState([]);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const response = await fetch(`/api/routines?creatorId=${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSavedRoutines(data);
      }
    } catch (err) {
      console.error('Error fetching routines:', err);
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, exercise) => {
    e.dataTransfer.setData('application/json', JSON.stringify(exercise));
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const exercise = JSON.parse(dataStr);

      // Add exercise to canvas with default values
      const newEntry = {
        id: `dropped-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: exercise.name,
        sets: 3,
        reps: 10,
        weight: 0,
        rest: 60
      };
      setRoutineExercises([...routineExercises, newEntry]);
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const updateExerciseField = (id, field, value) => {
    setRoutineExercises(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: Number(value) || value } : item))
    );
  };

  const removeExercise = (id) => {
    setRoutineExercises(prev => prev.filter(item => item.id !== id));
  };

  const saveRoutine = async () => {
    if (!title) {
      setSaveStatus('❌ Please enter a routine title');
      return;
    }
    if (routineExercises.length === 0) {
      setSaveStatus('❌ Please drag at least one exercise into the canvas');
      return;
    }

    try {
      setSaveStatus('Saving...');
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          difficulty,
          exercises: routineExercises
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSaveStatus('✅ Routine Saved Successfully! +25 XP awarded.');
        setTitle('');
        setRoutineExercises([]);
        fetchRoutines();

        // Award user XP via callback
        if (onXpGain) {
          onXpGain(25);
        }
      } else {
        setSaveStatus(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      setSaveStatus('❌ Network error saving routine');
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.formHeader} className="glass-panel">
        <div style={styles.formRow}>
          <div style={{ flex: 2 }}>
            <label style={styles.label}>Routine Title</label>
            <input
              type="text"
              placeholder="e.g. Hypertrophy Pull Day"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Difficulty Level</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button onClick={saveRoutine} className="btn-primary">
              💾 Save Workout Routine
            </button>
          </div>
        </div>
        {saveStatus && <p style={styles.statusText}>{saveStatus}</p>}
      </div>

      <div style={styles.workspace}>
        {/* Left Side: Exercise library */}
        <div style={styles.libraryColumn}>
          <h3 style={styles.columnTitle}>📚 Exercise Library</h3>
          <p style={styles.columnDesc}>Drag exercises from here onto your canvas:</p>
          <div style={styles.libraryGrid}>
            {PRESET_EXERCISES.map(ex => (
              <div
                key={ex.id}
                draggable
                onDragStart={(e) => handleDragStart(e, ex)}
                style={styles.draggableCard}
              >
                <div style={styles.dragIcon}>☰</div>
                <div>
                  <h4 style={styles.exName}>{ex.name}</h4>
                  <span style={styles.exCat}>{ex.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Droppable Canvas */}
        <div style={styles.canvasColumn}>
          <h3 style={styles.columnTitle}>🎨 Workout Canvas</h3>
          <p style={styles.columnDesc}>Drop and configure your workout structure here:</p>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              ...styles.canvasZone,
              ...(routineExercises.length === 0 ? styles.canvasZoneEmpty : {})
            }}
          >
            {routineExercises.length === 0 ? (
              <div style={styles.emptyPlaceholder}>
                <span style={{ fontSize: '48px' }}>📂</span>
                <p>Drag and drop exercises here to build your template</p>
              </div>
            ) : (
              <div style={styles.canvasList}>
                {routineExercises.map((item, index) => (
                  <div key={item.id} style={styles.canvasCard} className="glass-card">
                    <div style={styles.cardHeader}>
                      <span style={styles.cardIndex}>#{index + 1}</span>
                      <h4 style={styles.cardTitle}>{item.name}</h4>
                      <button onClick={() => removeExercise(item.id)} style={styles.deleteBtn}>
                        🗑️ Remove
                      </button>
                    </div>

                    <div style={styles.cardInputs}>
                      <div style={styles.inputCell}>
                        <span style={styles.inputLabel}>Sets</span>
                        <input
                          type="number"
                          value={item.sets}
                          onChange={(e) => updateExerciseField(item.id, 'sets', e.target.value)}
                          style={styles.numericInput}
                          min="1"
                        />
                      </div>
                      <div style={styles.inputCell}>
                        <span style={styles.inputLabel}>Reps</span>
                        <input
                          type="number"
                          value={item.reps}
                          onChange={(e) => updateExerciseField(item.id, 'reps', e.target.value)}
                          style={styles.numericInput}
                          min="1"
                        />
                      </div>
                      <div style={styles.inputCell}>
                        <span style={styles.inputLabel}>Weight (kg)</span>
                        <input
                          type="number"
                          value={item.weight}
                          onChange={(e) => updateExerciseField(item.id, 'weight', e.target.value)}
                          style={styles.numericInput}
                          min="0"
                        />
                      </div>
                      <div style={styles.inputCell}>
                        <span style={styles.inputLabel}>Rest (s)</span>
                        <input
                          type="number"
                          value={item.rest}
                          onChange={(e) => updateExerciseField(item.id, 'rest', e.target.value)}
                          style={styles.numericInput}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Routines Display List */}
      <div style={styles.savedSection} className="glass-panel">
        <h3 style={styles.columnTitle}>💾 My Saved Workout Templates</h3>
        <p style={styles.columnDesc}>Your active custom training schedules:</p>

        <div style={styles.savedGrid}>
          {savedRoutines.length === 0 ? (
            <p style={styles.emptyText}>No saved routines found. Build and save a template above to log it here.</p>
          ) : (
            savedRoutines.map(r => (
              <div key={r._id} style={styles.savedCard} className="glass-card">
                <div style={styles.savedHeader}>
                  <h4 style={styles.savedTitle}>{r.title}</h4>
                  <span className="badge-cyan">{r.difficulty}</span>
                </div>
                <div style={styles.exerciseList}>
                  {r.exercises.map((ex, idx) => (
                    <div key={ex._id || idx} style={styles.exerciseItem}>
                      <span>🏋️ {ex.name}</span>
                      <span style={styles.exerciseDetails}>
                        {ex.sets} sets × {ex.reps} reps {ex.weight > 0 ? `@ ${ex.weight} kg` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
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
  formHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    fontWeight: '600'
  },
  statusText: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--accent-cyan)',
    marginTop: '4px'
  },
  workspace: {
    display: 'flex',
    gap: '24px',
    minHeight: '500px'
  },
  libraryColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  canvasColumn: {
    flex: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  columnTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  columnDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '8px'
  },
  libraryGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    maxHeight: '520px',
    paddingRight: '6px'
  },
  draggableCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'var(--bg-navy)',
    border: '1px solid var(--border-frosted)',
    padding: '14px',
    borderRadius: 'var(--radius-md)',
    cursor: 'grab',
    userSelect: 'none',
    transition: 'var(--transition-smooth)'
  },
  dragIcon: {
    color: 'var(--text-muted)',
    fontSize: '16px'
  },
  exName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  exCat: {
    fontSize: '11px',
    color: 'var(--accent-cyan)',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  canvasZone: {
    flexGrow: 1,
    background: 'rgba(18, 26, 46, 0.4)',
    border: '2px dashed var(--border-frosted)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    minHeight: '480px',
    display: 'flex',
    flexDirection: 'column'
  },
  canvasZoneEmpty: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyPlaceholder: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center'
  },
  canvasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%'
  },
  canvasCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  cardIndex: {
    background: 'rgba(0, 180, 216, 0.1)',
    color: 'var(--accent-cyan)',
    border: '1px solid var(--border-active)',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700'
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    flexGrow: 1
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#EF4444',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },
  cardInputs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  inputCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  inputLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  numericInput: {
    padding: '8px 12px',
    fontSize: '14px',
    textAlign: 'center'
  },
  savedSection: {
    marginTop: '32px'
  },
  savedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },
  savedCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  savedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-frosted)',
    paddingBottom: '8px'
  },
  savedTitle: {
    fontSize: '15px',
    fontWeight: '700'
  },
  exerciseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  exerciseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  exerciseDetails: {
    color: 'var(--accent-cyan)',
    fontWeight: '600'
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '16px'
  }
};

export default DragDropBuilder;
