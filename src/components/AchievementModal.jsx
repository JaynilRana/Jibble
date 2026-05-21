import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useGamification } from '../contexts/GamificationContext';
import { BADGE_DETAILS } from '../services/gamificationService';

const AchievementModal = () => {
  const { isDark } = useTheme();
  const { levelUp, newBadges, gamification, clearNotifications } = useGamification();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (levelUp || (newBadges && newBadges.length > 0)) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [levelUp, newBadges]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`relative w-full max-w-md p-8 rounded-2xl shadow-2xl transform animate-in zoom-in-95 duration-500 ${
          isDark 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
            : 'bg-white border border-gray-100'
        }`}
      >
        <button 
          onClick={clearNotifications}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          ✕
        </button>

        <div className="text-center">
          {levelUp && (
            <div className="mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="text-6xl mb-4">🌟</div>
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}>
                Level Up!
              </h2>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                You are now Level <span className="font-bold text-2xl">{gamification.level}</span>
              </p>
            </div>
          )}

          {newBadges && newBadges.length > 0 && (
            <div className={`animate-in slide-in-from-bottom-4 duration-500 ${levelUp ? 'delay-300' : 'delay-100'}`}>
              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                New {newBadges.length === 1 ? 'Badge' : 'Badges'} Unlocked!
              </h3>
              <div className="space-y-4">
                {newBadges.map(badgeId => {
                  const badge = BADGE_DETAILS[badgeId];
                  if (!badge) return null;
                  return (
                    <div 
                      key={badgeId} 
                      className={`flex items-center p-4 rounded-xl border-2 ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <div className="text-4xl mr-4">{badge.icon}</div>
                      <div className="text-left">
                        <h4 className={`font-bold text-lg ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                          {badge.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={clearNotifications}
            className={`mt-8 px-8 py-3 rounded-full font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              isDark 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
