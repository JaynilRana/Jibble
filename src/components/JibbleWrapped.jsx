import React, { useState, useEffect, useMemo } from 'react';
import { getLogs } from '../api';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from './LoadingSpinner';

const JibbleWrapped = () => {
  const { isDark } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Default to current month (YYYY-MM format)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${mm}`;
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const resp = await getLogs();
        if (resp.success) {
          setLogs(resp.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const monthLogs = useMemo(() => {
    return logs.filter(log => log.date.startsWith(selectedMonth));
  }, [logs, selectedMonth]);

  const stats = useMemo(() => {
    if (!monthLogs.length) return null;

    const totalLogs = monthLogs.length;
    let moodSum = 0;
    let energySum = 0;
    let waterSum = 0;
    let tasksCompleted = 0;
    let totalTasks = 0;

    monthLogs.forEach(log => {
      moodSum += Number(log.mood_score || 0);
      energySum += Number(log.energy_level || 0);
      
      const diet = log.diet || {};
      waterSum += Number(diet.water || 0);
      
      const tasks = Array.isArray(log.tasks) ? log.tasks : [];
      totalTasks += tasks.length;
      tasksCompleted += tasks.filter(t => t.completed).length;
    });

    const avgMood = (moodSum / totalLogs).toFixed(1);
    const avgEnergy = (energySum / totalLogs).toFixed(1);
    const avgWater = (waterSum / totalLogs).toFixed(1);

    // Determine the "vibe" based on mood
    let vibe = "Balanced";
    if (avgMood > 8) vibe = "Euphoric 🌟";
    else if (avgMood > 6) vibe = "Positive ✨";
    else if (avgMood < 4) vibe = "Challenging 🌧️";

    return { totalLogs, avgMood, avgEnergy, avgWater, tasksCompleted, totalTasks, vibe };
  }, [monthLogs]);

  const handleNext = () => setCurrentSlide(prev => prev + 1);
  const handlePrev = () => setCurrentSlide(prev => Math.max(0, prev - 1));

  const handleShare = async () => {
    if (!stats) return;
    const dataToShare = {
      monthName,
      totalLogs: stats.totalLogs,
      vibe: stats.vibe,
      tasksCompleted: stats.tasksCompleted,
      avgMood: stats.avgMood
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(dataToShare)));
    const shareUrl = `${window.location.origin}/shared?d=${encoded}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Jibble Month in Review',
          text: `Check out my ${monthName} in review on Jibble!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.log('Error sharing', err);
      }
    }
    
    // Fallback
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard! You can paste it on social media.');
    }).catch(() => {
      alert(`Here is your share link: ${shareUrl}`);
    });
  };

  // Extract unique months from all logs for the dropdown
  const availableMonths = useMemo(() => {
    const months = new Set();
    logs.forEach(log => {
      months.add(log.date.substring(0, 7));
    });
    // Add current month even if no logs
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    months.add(`${today.getFullYear()}-${mm}`);
    
    return Array.from(months).sort().reverse(); // Newest first
  }, [logs]);

  const monthName = new Date(`${selectedMonth}-02`).toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  const slideBaseClasses = `absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out text-center`;

  // --- Slides Content ---
  const slides = [];

  // Slide 0: Intro & Selection
  slides.push(
    <div key="slide-0" className={`${slideBaseClasses} ${currentSlide === 0 ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 -translate-y-8 z-0 pointer-events-none'}`}>
      <div className="text-6xl mb-6 animate-bounce">📅</div>
      <h1 className="text-4xl md:text-6xl journal-heading mb-4 font-bold tracking-tight">Your Month in Review</h1>
      <p className="text-xl mb-8 opacity-90">Relive your journey and see how far you've come.</p>
      
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2 opacity-80">Select Month</label>
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className={`p-3 rounded-xl border-2 text-lg font-source-sans shadow-sm transition-all focus:ring-4 focus:outline-none ${
            isDark 
              ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-900/50' 
              : 'bg-white border-gray-200 text-gray-800 focus:ring-blue-100'
          }`}
        >
          {availableMonths.map(m => (
            <option key={m} value={m}>
              {new Date(`${m}-02`).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      <button 
        onClick={handleNext}
        disabled={!monthLogs.length}
        className={`px-8 py-4 rounded-full text-xl font-bold shadow-xl transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
          isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
        }`}
      >
        {monthLogs.length ? "Let's Go 🚀" : "No logs for this month"}
      </button>
    </div>
  );

  if (stats) {
    // Slide 1: Consistency
    slides.push(
      <div key="slide-1" className={`${slideBaseClasses} ${currentSlide === 1 ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-8 z-0 pointer-events-none'}`}>
        <h2 className="text-3xl journal-heading mb-8 opacity-80">{monthName}</h2>
        <div className="text-7xl mb-6">📝</div>
        <p className="text-2xl font-source-sans mb-2">You showed up for yourself.</p>
        <h3 className="text-6xl md:text-8xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          {stats.totalLogs} Days
        </h3>
        <p className="text-xl opacity-90">logged this month.</p>
        
        <button onClick={handleNext} className="mt-12 p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors border border-white/30 shadow-lg">
          ⬇️ Next
        </button>
      </div>
    );

    // Slide 2: Vibe / Mood
    slides.push(
      <div key="slide-2" className={`${slideBaseClasses} ${currentSlide === 2 ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-8 z-0 pointer-events-none'}`}>
        <h2 className="text-3xl journal-heading mb-8 opacity-80">Your Vibe</h2>
        <div className="text-7xl mb-6">🎭</div>
        <p className="text-2xl font-source-sans mb-4">Overall, this month felt...</p>
        <h3 className="text-5xl md:text-7xl font-bold mb-6 text-yellow-400 drop-shadow-lg">
          {stats.vibe}
        </h3>
        <div className="flex gap-8 mt-4">
          <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
            <div className="text-sm uppercase tracking-wider opacity-80 mb-1">Avg Mood</div>
            <div className="text-3xl font-bold">{stats.avgMood}/10</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
            <div className="text-sm uppercase tracking-wider opacity-80 mb-1">Avg Energy</div>
            <div className="text-3xl font-bold">{stats.avgEnergy}/10</div>
          </div>
        </div>
        
        <button onClick={handleNext} className="mt-12 p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors border border-white/30 shadow-lg">
          ⬇️ Next
        </button>
      </div>
    );

    // Slide 3: Habits & Productivity
    slides.push(
      <div key="slide-3" className={`${slideBaseClasses} ${currentSlide === 3 ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-8 z-0 pointer-events-none'}`}>
        <h2 className="text-3xl journal-heading mb-8 opacity-80">Getting Things Done</h2>
        <div className="text-7xl mb-6">✅</div>
        <p className="text-2xl font-source-sans mb-4">You crushed it.</p>
        <h3 className="text-5xl md:text-7xl font-bold mb-2 text-green-400">
          {stats.tasksCompleted} Tasks
        </h3>
        <p className="text-xl opacity-90 mb-8">completed out of {stats.totalTasks}.</p>

        {stats.avgWater > 0 && (
          <div className="mt-4 p-6 bg-blue-500/20 rounded-2xl backdrop-blur-md border border-blue-400/30 flex items-center gap-4">
            <span className="text-4xl">💧</span>
            <div className="text-left">
              <div className="text-sm opacity-80">Hydration</div>
              <div className="text-2xl font-bold">{stats.avgWater} glasses/day</div>
            </div>
          </div>
        )}
        
        <button onClick={handleNext} className="mt-12 p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors border border-white/30 shadow-lg">
          ⬇️ Next
        </button>
      </div>
    );

    // Slide 4: Summary Card
    slides.push(
      <div key="slide-4" className={`${slideBaseClasses} ${currentSlide === 4 ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-8 z-0 pointer-events-none'}`}>
        <h2 className="text-3xl journal-heading mb-8 opacity-80">That's a wrap!</h2>
        
        <div className={`w-full max-w-sm rounded-3xl p-8 shadow-2xl relative overflow-hidden ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-100 border border-gray-200'
        }`}>
          {/* Decorative background blobs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-500/30">
              <h3 className="text-2xl font-bold journal-heading">Jibble Wrapped</h3>
              <span className="text-sm opacity-70">{monthName}</span>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center">
                <span className="opacity-80">Days Logged</span>
                <span className="font-bold text-xl">{stats.totalLogs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">Your Vibe</span>
                <span className="font-bold text-xl text-yellow-500">{stats.vibe}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">Tasks Completed</span>
                <span className="font-bold text-xl text-green-500">{stats.tasksCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">Avg Mood</span>
                <span className="font-bold text-xl">{stats.avgMood}/10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={() => setCurrentSlide(0)} className="px-6 py-3 rounded-xl font-medium bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors border border-white/20">
            Start Over
          </button>
          <button onClick={handleShare} className="px-6 py-3 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-colors flex items-center gap-2">
            <span>📸</span> Share Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 text-slate-800'
    }`}>
      {/* Decorative background gradient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {slides}

      {/* Progress Dots */}
      {currentSlide > 0 && stats && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
          {[1, 2, 3, 4].map((num) => (
            <div 
              key={num} 
              className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === num ? 'bg-blue-500 scale-125' : 'bg-gray-400/50 hover:bg-gray-400'
              }`}
              onClick={() => setCurrentSlide(num)}
            />
          ))}
        </div>
      )}
      
      {/* Back button */}
      {currentSlide > 0 && (
        <button 
          onClick={handlePrev} 
          className="absolute top-8 left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors border border-white/20 z-20"
        >
          ⬅️ Back
        </button>
      )}
    </div>
  );
};

export default JibbleWrapped;
