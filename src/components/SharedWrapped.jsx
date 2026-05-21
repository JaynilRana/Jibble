import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const SharedWrapped = () => {
  const { isDark } = useTheme();
  const location = useLocation();

  const data = useMemo(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const d = searchParams.get('d');
      if (!d) return null;
      return JSON.parse(decodeURIComponent(atob(d)));
    } catch (error) {
      console.error("Invalid share link", error);
      return null;
    }
  }, [location.search]);
 
  if (!data) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <h1 className="text-3xl font-bold mb-4">Oops!</h1>
        <p className="text-xl opacity-80 mb-8">This share link seems to be invalid or broken.</p>
        <Link to="/" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          Go to Jibble
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 text-slate-800'
    }`}>
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse animation-delay-2000"></div>

      <div className="z-10 text-center mb-8">
        <div className="text-5xl mb-4">🎁</div>
        <h1 className="text-3xl md:text-4xl font-bold journal-heading mb-2">My Month in Review</h1>
        <p className="opacity-80">Shared via Jibble</p>
      </div>

      <div className={`w-full max-w-sm rounded-3xl p-8 shadow-2xl relative overflow-hidden z-10 ${
        isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-100 border border-gray-200'
      }`}>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-500/30">
            <h3 className="text-2xl font-bold journal-heading">Jibble Wrapped</h3>
            <span className="text-sm opacity-70">{data.monthName}</span>
          </div>
          
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center">
              <span className="opacity-80">Days Logged</span>
              <span className="font-bold text-xl">{data.totalLogs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">The Vibe</span>
              <span className="font-bold text-xl text-yellow-500">{data.vibe}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">Tasks Completed</span>
              <span className="font-bold text-xl text-green-500">{data.tasksCompleted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-80">Avg Mood</span>
              <span className="font-bold text-xl">{data.avgMood}/10</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 z-10">
        <Link to="/" className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors border border-white/30 rounded-full shadow-lg font-bold">
          Create your own Jibble
        </Link>
      </div>
    </div>
  );
};

export default SharedWrapped;
