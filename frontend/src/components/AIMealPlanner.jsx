import React, { useState, useEffect } from 'react';

export const AIMealPlanner = ({ user, token, onXpGain }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState('maintenance');
  const [diet, setDiet] = useState('any');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mealPlan, setMealPlan] = useState(null);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'

  // Saved plans history
  const [savedPlans, setSavedPlans] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Track checkmarks for grocery list locally
  const [checkedGroceries, setCheckedGroceries] = useState({});

  // Load the user's previously saved meal plans on mount
  useEffect(() => {
    const loadSavedPlans = async () => {
      try {
        const response = await fetch('/api/mealplans', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setSavedPlans(data);
        }
      } catch (e) {
        // Silent fail - history is a nice-to-have, not critical path
      } finally {
        setHistoryLoading(false);
      }
    };

    if (token) loadSavedPlans();
  }, [token]);

  const savePlan = async (planToSave) => {
    try {
      setSaveStatus('saving');
      const response = await fetch('/api/mealplans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ weight, height, activity, goal, diet, plan: planToSave })
      });

      const saved = await response.json();
      if (response.ok) {
        setSaveStatus('saved');
        setSavedPlans(prev => [saved, ...prev]);
      } else {
        setSaveStatus('error');
      }
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!weight || !height) {
      setError('❌ Weight and Height are required to calculate nutrition metrics');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMealPlan(null);

      const response = await fetch('/api/ai/meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ weight, height, activity, goal, diet })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMealPlan(data.plan);
        setCheckedGroceries({});

        // Award XP
        if (onXpGain) {
          onXpGain(15);
        }

        // Persist the generated plan so it survives navigation/reload
        savePlan(data.plan);
      } else {
        setError(`❌ Calculation failed: ${data.message}`);
      }
    } catch (e) {
      setError('❌ Network error generating nutrition plan');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPlan = (plan) => {
    setMealPlan({
      calories: plan.calories,
      protein: plan.protein,
      carbs: plan.carbs,
      fat: plan.fat,
      days: plan.days,
      groceryList: plan.groceryList
    });
    setCheckedGroceries({});
    setSaveStatus('');
  };

  const toggleGrocery = (index) => {
    setCheckedGroceries(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Parameter input panel */}
      <div style={styles.inputPanel} className="glass-panel">
        <h3 style={styles.title}>🧠 AI Nutrition Configurator</h3>
        <p style={styles.desc}>Enter your physical stats and fitness goals. Our neural engine will calculate your optimal caloric ceiling and custom meal breakdown.</p>

        <form onSubmit={handleGenerate} style={styles.form}>
          <div style={styles.formRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Weight (kg)</label>
              <input
                type="number"
                placeholder="e.g. 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="30"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Height (cm)</label>
              <input
                type="number"
                placeholder="e.g. 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="100"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Physical Activity Level</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="low">🛋️ Low (Sedentary / Desk Job)</option>
              <option value="moderate">🏃 Moderate (Active 3-5 days/week)</option>
              <option value="high">🔥 High (Athlete / Heavy Training)</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fitness Target Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="weight-loss">📉 Fat Loss & Caloric Deficit</option>
              <option value="maintenance">⚖️ Strength & Weight Maintenance</option>
              <option value="muscle-gain">📈 Hypertrophy & Muscle Bulk</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Dietary Preference</label>
            <select value={diet} onChange={(e) => setDiet(e.target.value)}>
              <option value="any">🥩 Any (Omnivore)</option>
              <option value="vegan">🌱 Vegan (Plant-Based)</option>
              <option value="keto">🥑 Ketogenic (Low-Carb High-Fat)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={styles.submitBtn}>
            {loading ? 'Synthesizing Plan...' : '🪄 Generate AI Nutrition Plan'}
          </button>

          {error && <p style={styles.errorText}>{error}</p>}
        </form>

        {/* Saved Plan History */}
        {savedPlans.length > 0 && (
          <div style={styles.historySection}>
            <div style={styles.sectionDivider}></div>
            <h4 style={styles.sectionTitle}>📚 Your Saved Plans</h4>
            <div style={styles.historyList}>
              {savedPlans.map((p) => (
                <button
                  key={p._id}
                  onClick={() => loadSavedPlan(p)}
                  style={styles.historyItem}
                  className="glass-card"
                >
                  <span style={styles.historyItemCal}>🔥 {p.calories} kcal</span>
                  <span style={styles.historyItemMeta}>
                    {p.diet === 'any' ? 'Omnivore' : p.diet === 'vegan' ? 'Vegan' : 'Keto'} · {p.goal === 'weight-loss' ? 'Fat Loss' : p.goal === 'muscle-gain' ? 'Muscle Gain' : 'Maintenance'}
                  </span>
                  <span style={styles.historyItemDate}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results output panel */}
      <div style={styles.resultPanel}>
        {mealPlan ? (
          <div className="glass-panel" style={styles.resultsContainer}>
            <div style={styles.resultsHeader}>
              <h3 style={styles.resultsTitle}>🥗 Your Personalized Target Strategy</h3>
              <div style={styles.headerRight}>
                {saveStatus === 'saving' && <span style={styles.saveStatusText}>💾 Saving...</span>}
                {saveStatus === 'saved' && <span style={{ ...styles.saveStatusText, color: '#22C55E' }}>✅ Saved</span>}
                {saveStatus === 'error' && <span style={{ ...styles.saveStatusText, color: '#EF4444' }}>⚠️ Save failed</span>}
                <span className="badge-gold">🔥 {mealPlan.calories} kcal / day</span>
              </div>
            </div>

            {/* Macro breakdown */}
            <div style={styles.macrosRow}>
              <div style={styles.macroCard} className="glass-card">
                <span style={styles.macroVal}>{mealPlan.protein}g</span>
                <span style={styles.macroLabel}>Protein</span>
              </div>
              <div style={{ ...styles.macroCard, borderColor: '#48CAE4' }} className="glass-card">
                <span style={{ ...styles.macroVal, color: '#48CAE4' }}>{mealPlan.carbs}g</span>
                <span style={styles.macroLabel}>Carbohydrates</span>
              </div>
              <div style={{ ...styles.macroCard, borderColor: '#D4AF37' }} className="glass-card">
                <span style={{ ...styles.macroVal, color: '#D4AF37' }}>{mealPlan.fat}g</span>
                <span style={styles.macroLabel}>Dietary Fat</span>
              </div>
            </div>

            {/* Daily Meals list */}
            <div style={styles.sectionDivider}></div>
            <h4 style={styles.sectionTitle}>🍽️ Daily Dish Recommendations</h4>
            <div style={styles.mealsGrid}>
              <div style={styles.mealCard} className="glass-card">
                <span style={styles.mealType}>🍳 Breakfast</span>
                <p style={styles.mealText}>{mealPlan.days.breakfast}</p>
              </div>
              <div style={styles.mealCard} className="glass-card">
                <span style={styles.mealType}>🥙 Lunch</span>
                <p style={styles.mealText}>{mealPlan.days.lunch}</p>
              </div>
              <div style={styles.mealCard} className="glass-card">
                <span style={styles.mealType}>🥜 Snack</span>
                <p style={styles.mealText}>{mealPlan.days.snack}</p>
              </div>
              <div style={styles.mealCard} className="glass-card">
                <span style={styles.mealType}>🥩 Dinner</span>
                <p style={styles.mealText}>{mealPlan.days.dinner}</p>
              </div>
            </div>

            {/* Checklist-formatted Grocery List */}
            <div style={styles.sectionDivider}></div>
            <h4 style={styles.sectionTitle}>🛒 Smart Shopping List</h4>
            <p style={styles.desc}>Cross off items once purchased:</p>
            <div style={styles.groceryListContainer}>
              {mealPlan.groceryList.map((item, index) => {
                const isChecked = checkedGroceries[index];
                return (
                  <label
                    key={index}
                    onClick={() => toggleGrocery(index)}
                    style={{
                      ...styles.groceryItem,
                      ...(isChecked ? styles.groceryItemChecked : {})
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!isChecked}
                      readOnly
                      style={styles.checkbox}
                    />
                    <span style={styles.groceryText}>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={styles.placeholderCard} className="glass-panel">
            <span style={{ fontSize: '48px' }}>🥗</span>
            <h4>Plan Synthesizer Pending</h4>
            <p style={{ color: 'var(--text-muted)' }}>Configure your macros on the left, then click Generate to construct a custom diet strategy.</p>
          </div>
        )}
      </div>
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
  inputPanel: {
    flex: '1 1 380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  resultPanel: {
    flex: '1.5 1 480px',
    display: 'flex',
    flexDirection: 'column'
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
  submitBtn: {
    marginTop: '8px',
    justifyContent: 'center'
  },
  errorText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#EF4444'
  },
  placeholderCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    textAlign: 'center',
    minHeight: '450px'
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-frosted)',
    paddingBottom: '12px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  saveStatusText: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  historySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '4px'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '220px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  historyItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    padding: '10px 12px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    background: 'rgba(255, 255, 255, 0.01)'
  },
  historyItemCal: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--accent-cyan)'
  },
  historyItemMeta: {
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  historyItemDate: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  resultsTitle: {
    fontSize: '16px',
    fontWeight: '700'
  },
  macrosRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  macroCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    borderColor: 'var(--accent-cyan)',
    textAlign: 'center'
  },
  macroVal: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--accent-cyan)'
  },
  macroLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  sectionDivider: {
    height: '1px',
    backgroundColor: 'var(--border-frosted)'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  mealsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  mealCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minHeight: '100px'
  },
  mealType: {
    fontSize: '11px',
    color: 'var(--accent-cyan)',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  mealText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  groceryListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '220px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  groceryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-frosted)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'var(--transition-smooth)'
  },
  groceryItemChecked: {
    background: 'rgba(34, 197, 94, 0.04)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
    opacity: 0.6
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#22C55E'
  },
  groceryText: {
    fontSize: '13px',
    color: 'var(--text-primary)'
  }
};

export default AIMealPlanner;
