import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getGamificationStats, updateGamificationStats, getLogs } from '../api';
import { calculateLogXP, calculateLevel, checkBadges } from '../services/gamificationService';
import { calculateCurrentStreak } from '../utils/streakUtils';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [gamification, setGamification] = useState({
    xp: 0,
    level: 1,
    badges: [],
  });
  const [newBadges, setNewBadges] = useState([]);
  const [levelUp, setLevelUp] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (user) {
        try {
          const res = await getGamificationStats();
          setGamification(res.data || { xp: 0, level: 1, badges: [] });
        } catch (error) {
          console.error("Failed to load gamification stats:", error);
        }
      } else {
        setGamification({ xp: 0, level: 1, badges: [] });
      }
      setLoading(false);
    };
    loadStats();
  }, [user]);

  const processNewLog = async (log) => {
    if (!user) return;
    try {
      // 1. Fetch current logs for badge evaluation
      const logsRes = await getLogs();
      const logs = logsRes?.data || [];
      const currentStreak = calculateCurrentStreak(logs);

      // 2. Calculate XP
      const xpEarned = calculateLogXP(log);
      const newTotalXp = (gamification.xp || 0) + xpEarned;
      const newLevel = calculateLevel(newTotalXp);

      // 3. Calculate Badges
      const earnedBadges = checkBadges(logs, gamification.badges || [], currentStreak);

      const updates = {
        xp: newTotalXp,
        level: newLevel,
        badges: [...(gamification.badges || []), ...earnedBadges]
      };

      // 4. Update state and UI flags
      if (newLevel > (gamification.level || 1)) {
        setLevelUp(true);
      }
      if (earnedBadges.length > 0) {
        setNewBadges(earnedBadges);
      }

      setGamification(updates);
      await updateGamificationStats(updates);
    } catch (error) {
      console.error("Failed to process gamification for new log:", error);
    }
  };

  const clearNotifications = () => {
    setLevelUp(false);
    setNewBadges([]);
  };

  return (
    <GamificationContext.Provider value={{
      gamification,
      loading,
      processNewLog,
      newBadges,
      levelUp,
      clearNotifications
    }}>
      {children}
    </GamificationContext.Provider>
  );
};
