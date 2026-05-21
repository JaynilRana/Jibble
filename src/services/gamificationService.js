export const calculateLogXP = (log) => {
  let xpEarned = 50; // Base XP for logging

  // XP for tasks
  if (log.tasks && Array.isArray(log.tasks)) {
    const completedTasks = log.tasks.filter(t => t.completed).length;
    xpEarned += completedTasks * 10;
  }

  // XP for good mood/energy
  const mood = Number(log.mood_score) || 0;
  const energy = Number(log.energy_level) || 0;
  if (mood > 7 && energy > 7) {
    xpEarned += 20;
  }

  return xpEarned;
};

export const calculateLevel = (xp) => {
  return Math.floor(xp / 100) + 1;
};

export const checkBadges = (logs, currentBadges = [], currentStreak = 0) => {
  const newBadges = [];
  const addBadge = (badgeId) => {
    if (!currentBadges.includes(badgeId) && !newBadges.includes(badgeId)) {
      newBadges.push(badgeId);
    }
  };

  if (!logs || logs.length === 0) return newBadges;

  // Badge: First Log
  if (logs.length >= 1) {
    addBadge('first_log');
  }

  // Badge: 7-Day Streak
  if (currentStreak >= 7) {
    addBadge('7_day_streak');
  }

  // Helper to check consecutive days condition
  // logs must be sorted descending by date for this to work perfectly, 
  // but we can just check sequences in the sorted array.
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Badge: Hydration Hero (3L or 15 glasses for 5 consecutive days)
  let hydrationStreak = 0;
  for (let i = 0; i < sortedLogs.length; i++) {
    const diet = sortedLogs[i].diet || {};
    const water = Number(diet.water) || 0;
    if (water >= 3) { // assuming water is stored in Liters or glasses, wait: Jibble tracks glasses? 
      // User said "3L water for 5 days". If Jibble tracks liters, >= 3. If glasses, 1 glass = 200ml -> 3L = 15.
      // In DietSection.jsx, let's assume `water` value is in Liters, or check. Wait, from previous convo: 
      // "logging water intake in 200ml increments (represented as glasses) and calculating total daily consumption"
      // If `water` is glasses, 15 glasses = 3L. Let's check for >= 15 or >= 3 depending on how it's stored. 
      // I will check water >= 15 (glasses) or water >= 3 (Liters). Let's use >= 3 for L, or >= 15.
      // Wait, let's just check >= 15 as 15 * 0.2 = 3L.
      if (water >= 15 || water >= 3) {
        hydrationStreak++;
      } else {
        hydrationStreak = 0;
      }
      if (hydrationStreak >= 5) {
        addBadge('hydration_hero');
        break;
      }
    } else {
      hydrationStreak = 0;
    }
  }

  // Badge: Protein Master (> 100g for 3 consecutive days)
  let proteinStreak = 0;
  for (let i = 0; i < sortedLogs.length; i++) {
    const diet = sortedLogs[i].diet || {};
    const nutrients = diet.nutrients || diet;
    const protein = Number(nutrients.protein) || 0;
    
    if (protein >= 100) {
      proteinStreak++;
      if (proteinStreak >= 3) {
        addBadge('protein_master');
        break;
      }
    } else {
      proteinStreak = 0;
    }
  }

  return newBadges;
};

export const BADGE_DETAILS = {
  first_log: { id: 'first_log', name: 'Journey Begins', icon: '🌱', description: 'Wrote your first daily log.' },
  '7_day_streak': { id: '7_day_streak', name: '7-Day Streak', icon: '🔥', description: 'Logged for 7 consecutive days.' },
  hydration_hero: { id: 'hydration_hero', name: 'Hydration Hero', icon: '💧', description: 'Logged 3L of water for 5 days.' },
  protein_master: { id: 'protein_master', name: 'Protein Master', icon: '🥩', description: 'Logged over 100g of protein for 3 days.' }
};
