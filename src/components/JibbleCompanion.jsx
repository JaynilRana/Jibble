import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { createCompanionChatSession } from '../services/geminiService';
import { getLogByDate, createLog, updateLog } from '../api';
import { getCurrentDateKey } from '../utils/dateUtils';

const JibbleCompanion = () => {
  const { isDark } = useTheme();
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Jibble Companion. How can I help you today? You can tell me about your day and I'll log it for you!", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      try {
        chatSessionRef.current = createCompanionChatSession();
      } catch (err) {
        console.error(err);
      }
    }
  }, [isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || !chatSessionRef.current) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage(userMessage);
      const responseText = result.response.text();
      let aiResponse;
      
      try {
        aiResponse = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("Failed to parse AI JSON:", responseText);
        aiResponse = { message: "I'm having trouble understanding that. Could you try again?" };
      }

      setMessages(prev => [...prev, { text: aiResponse.message, sender: 'ai' }]);

      // Handle automatic log updates
      if (aiResponse.updateLog && isLoggedIn) {
        await processLogUpdate(aiResponse.updateLog);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'ai', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const processLogUpdate = async (updates) => {
    try {
      const dateKey = getCurrentDateKey();
      let currentLogResponse = await getLogByDate(dateKey);
      let currentLog = currentLogResponse.data;

      const isNewLog = !currentLog;
      if (isNewLog) {
        currentLog = {
          date: dateKey,
          mood_score: 5,
          energy_level: 5,
          tasks: [],
          diet: { water: 0, meals: { breakfast: '', lunch: '', snack: '', dinner: '' }, nutrients: { calories: 0, protein: 0, carbs: 0, fats: 0 } },
          steps: 0,
          ratings: { discipline: 5, sociability: 5, productivity: 5 }
        };
      }

      let modified = false;

      if (updates.mood !== undefined) {
        currentLog.mood_score = updates.mood;
        modified = true;
      }
      if (updates.energy !== undefined) {
        currentLog.energy_level = updates.energy;
        modified = true;
      }
      if (updates.water_glasses !== undefined) {
        currentLog.diet = currentLog.diet || {};
        currentLog.diet.water = (currentLog.diet.water || 0) + (updates.water_glasses * 0.2); // approx 200ml per glass
        modified = true;
      }
      if (updates.new_tasks && Array.isArray(updates.new_tasks)) {
        currentLog.tasks = currentLog.tasks || [];
        updates.new_tasks.forEach(task => {
          currentLog.tasks.push({ id: Date.now().toString() + Math.random(), text: task, completed: true });
        });
        modified = true;
      }

      if (modified) {
        if (isNewLog) {
          await createLog(currentLog);
        } else {
          await updateLog(dateKey, currentLog);
        }
        
        // Dispatch a global event so the DailyLogForm updates if it's open
        window.dispatchEvent(new Event('logUpdated'));
        setMessages(prev => [...prev, { text: "✅ I've automatically updated your daily log!", sender: 'system' }]);
      }

    } catch (error) {
      console.error("Failed to update log:", error);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className={`mb-4 w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h3 className="font-bold text-lg">Jibble Companion</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : msg.sender === 'system'
                    ? 'bg-green-100 text-green-800 text-xs italic dark:bg-green-900 dark:text-green-200'
                    : isDark 
                      ? 'bg-gray-700 text-gray-200 rounded-bl-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`rounded-2xl px-4 py-2 text-sm rounded-bl-none ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className="animate-pulse text-gray-500">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className={`p-3 border-t flex gap-2 items-center ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            {recognition && (
              <button 
                type="button" 
                onClick={toggleListen}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                title="Voice Input"
              >
                🎤
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Tell me about your day..."}
              className={`flex-1 px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'}`}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="p-2 w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-transform hover:scale-110 active:scale-95 z-50 ${isOpen ? 'bg-gray-600 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'}`}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default JibbleCompanion;
