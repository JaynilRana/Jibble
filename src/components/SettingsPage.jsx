import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

const SettingsPage = () => {
  const { isDark } = useTheme();
  const { settings, setQuoteMode, toggleNutritionDetails, addCustomMetric, removeCustomMetric } = useSettings();
  const [newMetricName, setNewMetricName] = useState('');

  const handleAddMetric = (e) => {
    e.preventDefault();
    if (!newMetricName.trim()) return;
    
    // Check if it already exists
    const exists = (settings.customMetrics || []).find(m => m.name.toLowerCase() === newMetricName.trim().toLowerCase());
    if (exists) {
      alert("This metric already exists!");
      return;
    }

    addCustomMetric({
      id: Date.now().toString(),
      name: newMetricName.trim()
    });
    setNewMetricName('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        
        {/* General Settings */}
        <section className={`p-6 rounded-lg shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            General Preferences
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Daily Quote Source</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose where your daily inspiration comes from.</p>
              </div>
              <select 
                value={settings.quoteMode} 
                onChange={(e) => setQuoteMode(e.target.value)}
                className={`px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="ai">AI Generated</option>
                <option value="curated">Curated List</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show Nutrition Details</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Display detailed macro breakdowns on the diet section.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.showNutritionDetails} 
                  onChange={toggleNutritionDetails}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Custom Metrics */}
        <section className={`p-6 rounded-lg shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Custom Metrics
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Define custom numerical metrics you want to track daily (e.g., "Hours of Sleep", "Caffeine Intake", "Pages Read"). These will appear on your Daily Log.
          </p>

          <form onSubmit={handleAddMetric} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newMetricName}
              onChange={(e) => setNewMetricName(e.target.value)}
              placeholder="E.g., Hours of Sleep"
              className={`flex-1 px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
            />
            <button 
              type="submit"
              disabled={!newMetricName.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Metric
            </button>
          </form>

          {settings.customMetrics && settings.customMetrics.length > 0 ? (
            <div className="space-y-3">
              {settings.customMetrics.map(metric => (
                <div key={metric.id} className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="font-medium">{metric.name}</span>
                  <button 
                    onClick={() => removeCustomMetric(metric.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="Remove Metric"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <p className="text-gray-500 dark:text-gray-400">No custom metrics defined yet.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;
