import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useGamification } from '../contexts/GamificationContext';
import { BADGE_DETAILS } from '../services/gamificationService';

const GamificationWidget = () => {
  const { isDark } = useTheme();
  const { gamification, loading } = useGamification();

  if (loading) {
    return (
      <div className={`p-6 rounded-xl border-2 animate-pulse ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  const { level = 1, xp = 0, badges = [] } = gamification || {};
  
  // Calculate XP progress
  const currentLevelXp = (level - 1) * 100;
  const nextLevelXp = level * 100;
  const xpIntoLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progressPercent = Math.min(100, Math.max(0, (xpIntoLevel / xpNeeded) * 100));

  return (
    <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
        : 'bg-white border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.05)]'
    }`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Level & XP Info */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <span className="text-3xl">🏆</span> Level {level}
            </h2>
            <span className={`text-sm font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {xpIntoLevel} / {xpNeeded} XP
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className={`h-4 w-full rounded-full overflow-hidden ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {xpNeeded - xpIntoLevel} XP to Level {level + 1}
          </p>
        </div>

        {/* Badges Display */}
        <div className="flex-1 w-full md:border-l-2 md:pl-6 border-dashed border-gray-300 dark:border-gray-600">
          <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Your Badges ({badges.length})
          </h3>
          
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {badges.map(badgeId => {
                const badge = BADGE_DETAILS[badgeId];
                if (!badge) return null;
                return (
                  <div 
                    key={badgeId}
                    title={`${badge.name}: ${badge.description}`}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all hover:scale-110 cursor-help ${
                      isDark 
                        ? 'bg-gray-800 border-indigo-500/50 hover:border-indigo-400 hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                        : 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 hover:shadow-md'
                    }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                      <p className="font-bold">{badge.name}</p>
                      <p className="text-gray-300">{badge.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Complete logs and goals to earn badges!
            </p>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default GamificationWidget;
