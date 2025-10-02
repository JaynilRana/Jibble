import axios from 'axios';
import localDataService from './services/localDataService';
import { db, auth } from './services/firebase';
import { calculateCurrentStreak } from './utils/streakUtils';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit as fbLimit
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth';

export const API_BASE_URL = 'http://localhost:8000';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Check if backend is available
const isBackendAvailable = async () => {
  try {
    await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
};

// Firebase helpers (use current auth user)
const getCurrentUserKey = () => {
  const u = auth.currentUser;
  if (!u) throw new Error('Not authenticated');
  return u.uid;
};

const userLogsCollectionRef = (userKey) => collection(db, 'users', userKey, 'daily_logs');
const userReportsCollectionRef = (userKey) => collection(db, 'users', userKey, 'weekly_reports');

// Auth - Firebase email/password with email verification
export const emailSignUp = async (name, email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  
  // Send email verification with custom settings
  await sendEmailVerification(cred.user, {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true
  });
  
  // Store basic profile in Firestore
  try {
    await setDoc(doc(collection(db, 'users'), cred.user.uid), {
      email: cred.user.email,
      name: name || cred.user.displayName || email.split('@')[0],
      emailVerified: false,
      created_at: new Date().toISOString()
    }, { merge: true });
  } catch {}
  
  return { 
    user: cred.user,
    needsVerification: true,
    message: 'Account created! Please check your email (including spam folder) to verify your account.'
  };
};

export const emailSignIn = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  
  // Check if email is verified
  if (!cred.user.emailVerified) {
    // Send verification email if not verified
    await sendEmailVerification(cred.user, {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: true
    });
    return {
      user: cred.user,
      needsVerification: true,
      message: 'Please verify your email address. A verification email has been sent (check spam folder).'
    };
  }
  
  // Ensure user profile doc exists
  try {
    await setDoc(doc(collection(db, 'users'), cred.user.uid), {
      email: cred.user.email,
      name: cred.user.displayName || email.split('@')[0],
      emailVerified: true,
      last_login_at: new Date().toISOString()
    }, { merge: true });
  } catch {}
  
  return { user: cred.user };
};

// Auth - Profile and logout
export const getProfile = async () => {
  const u = auth.currentUser;
  if (!u) throw new Error('Not authenticated');
  return { data: { id: u.uid, email: u.email, name: u.displayName || u.email?.split('@')[0] } };
};

export const logout = async () => {
  await signOut(auth);
  return { data: { message: 'Logged out successfully' } };
};

// Auth - Email verification
export const verifyEmail = async (actionCode) => {
  try {
    await applyActionCode(auth, actionCode);
    return { success: true, message: 'Email verified successfully!' };
  } catch (error) {
    throw new Error('Invalid or expired verification code');
  }
};

export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  
  await sendEmailVerification(user, {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true
  });
  return { message: 'Verification email sent! Please check your inbox and spam folder.' };
};

// Auth - Password reset
export const forgotPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
  return { data: { message: 'Password reset email sent' } };
};

export const resetPassword = async (token, otp_code, new_password) => {
  const backendAvailable = await isBackendAvailable();
  if (backendAvailable) {
    return axios.post(`${API_BASE_URL}/auth/reset-password`, { token, otp_code, new_password });
  } else {
    return Promise.resolve({ data: { message: 'Password reset successfully (local mode)' } });
  }
};

// Logs
export const getLogs = async () => {
  const userKey = getCurrentUserKey();
  const qy = query(userLogsCollectionRef(userKey), orderBy('date', 'desc'));
  const snap = await getDocs(qy);
  const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { success: true, data: logs };
};

export const createLog = async (log) => {
  const userKey = getCurrentUserKey();
  const docRef = doc(userLogsCollectionRef(userKey), log.date);
  await setDoc(docRef, { ...log, created_at: new Date().toISOString() }, { merge: true });
  const saved = await getDoc(docRef);
  return { data: { id: saved.id, ...saved.data() } };
};

export const updateLog = async (date, updates) => {
  const userKey = getCurrentUserKey();
  const docRef = doc(userLogsCollectionRef(userKey), date);
  await updateDoc(docRef, { ...updates, updated_at: new Date().toISOString() });
  const saved = await getDoc(docRef);
  return { data: { id: saved.id, ...saved.data() } };
};

export const deleteLog = async (date) => {
  const userKey = getCurrentUserKey();
  const docRef = doc(userLogsCollectionRef(userKey), date);
  await deleteDoc(docRef);
  return { data: { message: 'Deleted' } };
};

export const getLogByDate = async (date) => {
  const userKey = getCurrentUserKey();
  const docRef = doc(userLogsCollectionRef(userKey), date);
  const snap = await getDoc(docRef);
  return { data: snap.exists() ? { id: snap.id, ...snap.data() } : null };
};

// Weekly Reports
export const getWeeklyReport = async (weekStartDate, forceRegenerate = false) => {
  const userKey = getCurrentUserKey();
  const docRef = doc(userReportsCollectionRef(userKey), weekStartDate);
  const existing = await getDoc(docRef);
  if (existing.exists() && !forceRegenerate) return { data: { id: existing.id, ...existing.data() } };

  // Generate from logs and persist
  const logsResp = await getLogs();
  const logs = logsResp?.data || [];
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const weekLogs = logs.filter((l) => {
    const d = new Date(l.date);
    return d >= start && d <= end;
  });
  // Generate report even with partial data (no need for all 7 days)

  const toNumber = (v) => (typeof v === 'number' ? v : Number(v || 0));
  const moodScores = weekLogs.map((l) => toNumber(l.mood_score)).filter((n) => !Number.isNaN(n));
  const energyLevels = weekLogs.map((l) => toNumber(l.energy_level)).filter((n) => !Number.isNaN(n));
  let discipline = [], sociability = [], productivity = [];
  let protein = [], calories = [], water = [];
  let steps = [];
  let totalTasks = 0, completedTasks = 0;
  weekLogs.forEach((l) => {
    const r = l.ratings || {};
    if (r.discipline != null) discipline.push(toNumber(r.discipline));
    if (r.sociability != null) sociability.push(toNumber(r.sociability));
    if (r.productivity != null) productivity.push(toNumber(r.productivity));
    const tasks = Array.isArray(l.tasks) ? l.tasks : [];
    totalTasks += tasks.length;
    completedTasks += tasks.filter((t) => t?.completed).length;
    
    // Process diet data
    const diet = l.diet || {};
    if (diet.protein != null) protein.push(toNumber(diet.protein));
    if (diet.calories != null) calories.push(toNumber(diet.calories));
    if (diet.water != null) water.push(toNumber(diet.water));
    
    // Process steps data
    if (l.steps != null) steps.push(toNumber(l.steps));
  });
  const average = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  // Generate personalized self-improvement insights
  const generatePersonalInsights = (weekLogs, metrics) => {
    const insights = {
      suggestions: [],
      positives: [],
      negatives: []
    };

    // Analyze task completion patterns
    const completionRate = metrics.completion_rate;
    if (completionRate < 60) {
      insights.suggestions.push("Focus on breaking down large tasks into smaller, manageable chunks to improve completion rates");
    } else if (completionRate > 80) {
      insights.positives.push("Excellent task completion rate! You're maintaining great productivity");
    }

    // Analyze mood and energy patterns
    const avgMood = metrics.average_mood;
    const avgEnergy = metrics.average_energy;
    if (avgMood < 6) {
      insights.suggestions.push("Consider adding mood-boosting activities like exercise, meditation, or social time");
    } else if (avgMood > 8) {
      insights.positives.push("Great mood consistency this week! Keep up the positive mindset");
    }

    if (avgEnergy < 6) {
      insights.suggestions.push("Focus on better sleep hygiene and nutrition to boost energy levels");
    } else if (avgEnergy > 8) {
      insights.positives.push("High energy levels maintained throughout the week");
    }

    // Analyze discipline vs productivity
    const discipline = metrics.average_discipline;
    const productivity = metrics.average_productivity;
    if (discipline < productivity - 1) {
      insights.suggestions.push("Work on building better daily routines to match your productivity potential");
    } else if (discipline > productivity + 1) {
      insights.suggestions.push("Channel your strong discipline into more productive activities");
    }

    // Analyze sociability patterns
    const sociability = metrics.average_sociability;
    if (sociability < 5) {
      insights.suggestions.push("Consider scheduling more social activities or reaching out to friends/family");
    } else if (sociability > 8) {
      insights.positives.push("Great social engagement this week! You're maintaining strong relationships");
    }

    // Analyze logging consistency
    const logCount = weekLogs.length;
    if (logCount < 4) {
      insights.suggestions.push("Try to log daily to get better insights into your patterns and progress");
    } else if (logCount >= 6) {
      insights.positives.push("Consistent daily logging shows great self-awareness and commitment");
    }

    // Analyze diet patterns
    const avgProtein = metrics.average_protein;
    const avgCalories = metrics.average_calories;
    const avgWater = metrics.average_water;
    
    if (avgProtein != null) {
      if (avgProtein < 50) {
        insights.suggestions.push("Consider increasing your protein intake - aim for at least 50g per day for better muscle recovery and energy");
      } else if (avgProtein >= 80) {
        insights.positives.push("Excellent protein intake! You're supporting your body's recovery and muscle maintenance");
      }
    }
    
    if (avgCalories != null) {
      if (avgCalories < 1200) {
        insights.suggestions.push("Your calorie intake seems quite low - ensure you're eating enough to fuel your daily activities");
      } else if (avgCalories > 3000) {
        insights.suggestions.push("Consider monitoring your calorie intake - aim for a balanced approach to maintain healthy weight");
      } else if (avgCalories >= 1800 && avgCalories <= 2500) {
        insights.positives.push("Great calorie balance! You're maintaining a healthy energy intake");
      }
    }
    
    if (avgWater != null) {
      if (avgWater < 2) {
        insights.suggestions.push("Increase your water intake - aim for at least 2-2.5 liters daily for optimal hydration");
      } else if (avgWater >= 2.5) {
        insights.positives.push("Excellent hydration habits! Proper water intake supports all bodily functions");
      }
    }

    // Analyze steps patterns
    const avgSteps = metrics.average_steps;
    if (avgSteps != null) {
      if (avgSteps < 8000) {
        insights.suggestions.push("Try to increase your daily steps - aim for at least 8,000-10,000 steps for better cardiovascular health");
      } else if (avgSteps >= 15000) {
        insights.positives.push("Outstanding step count! You're maintaining excellent daily activity levels");
      } else if (avgSteps >= 10000) {
        insights.positives.push("Great daily activity! You're meeting the recommended step count for good health");
      }
    }

    // Analyze task patterns from logs
    const allTasks = weekLogs.flatMap(log => log.tasks || []);
    const taskTexts = allTasks.map(task => task.text?.toLowerCase() || '');
    
    // Check for exercise/gym patterns
    const exerciseTasks = taskTexts.filter(text => 
      text.includes('gym') || text.includes('workout') || text.includes('exercise') || 
      text.includes('run') || text.includes('fitness')
    );
    if (exerciseTasks.length < 2) {
      insights.suggestions.push("Consider adding more physical activity to your routine - aim for at least 3-4 sessions per week");
    } else if (exerciseTasks.length >= 4) {
      insights.positives.push("Excellent fitness consistency! Regular exercise is boosting your overall well-being");
    }

    // Check for learning/reading patterns
    const learningTasks = taskTexts.filter(text => 
      text.includes('read') || text.includes('learn') || text.includes('study') || 
      text.includes('book') || text.includes('course')
    );
    if (learningTasks.length < 2) {
      insights.suggestions.push("Dedicate more time to learning and personal development activities");
    } else if (learningTasks.length >= 3) {
      insights.positives.push("Great commitment to continuous learning and self-improvement");
    }

    // Fill remaining suggestions if needed
    while (insights.suggestions.length < 5) {
      const genericSuggestions = [
        "Set specific, measurable goals for next week to track progress better",
        "Try the 2-minute rule: if a task takes less than 2 minutes, do it immediately",
        "Schedule regular breaks throughout your day to maintain focus and energy",
        "Practice gratitude journaling to improve overall mood and perspective",
        "Use time-blocking to allocate specific time slots for different activities"
      ];
      const randomSuggestion = genericSuggestions[Math.floor(Math.random() * genericSuggestions.length)];
      if (!insights.suggestions.includes(randomSuggestion)) {
        insights.suggestions.push(randomSuggestion);
      }
    }

    // Limit to top 5 suggestions
    insights.suggestions = insights.suggestions.slice(0, 5);

    return insights;
  };

  const metrics = {
    completion_rate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
    average_mood: average(moodScores),
    average_energy: average(energyLevels),
    average_discipline: average(discipline),
    average_sociability: average(sociability),
    average_productivity: average(productivity),
    average_protein: average(protein),
    average_calories: average(calories),
    average_water: average(water),
    average_steps: average(steps)
  };

  const personalInsights = generatePersonalInsights(weekLogs, metrics);

  const report = {
    week_start_date: weekStartDate,
    week_end_date: new Date(end).toISOString().slice(0, 10),
    total_logs: weekLogs.length,
    average_mood: metrics.average_mood,
    average_energy: metrics.average_energy,
    average_discipline: metrics.average_discipline,
    average_sociability: metrics.average_sociability,
    average_productivity: metrics.average_productivity,
    average_protein: metrics.average_protein,
    average_calories: metrics.average_calories,
    average_water: metrics.average_water,
    average_steps: metrics.average_steps,
    tasks_completed: completedTasks,
    total_tasks: totalTasks,
    completion_rate: metrics.completion_rate,
    top_quotes: weekLogs.map((l) => l.quote).filter(Boolean).slice(0, 3),
    personal_insights: personalInsights,
    created_at: new Date().toISOString()
  };
  await setDoc(docRef, report, { merge: true });
  return { data: { id: docRef.id, ...report } };
};

export const getWeeklyReports = async () => {
  const userKey = getCurrentUserKey();
  const qy = query(userReportsCollectionRef(userKey), orderBy('week_start_date', 'desc'), fbLimit(12));
  const snap = await getDocs(qy);
  const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { data: reports };
};

// Health check
export const healthCheck = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/health`);
  } catch {
    return Promise.resolve({ data: { status: 'offline', message: 'Running in local mode' } });
  }
};

// Additional local-only functions
export const getDashboardStats = async () => {
  const logsResp = await getLogs();
  const logs = logsResp?.data || [];
  if (!logs.length) return { totalLogs: 0, currentStreak: 0, thisMonth: 0, averageRating: 0 };
  const totalLogs = logs.length;
  
  // Use unified streak calculation
  const currentStreak = calculateCurrentStreak(logs);
  
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  const thisMonth = logs.filter((l) => {
    const d = new Date(l.date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;
  let totalRating = 0, ratingCount = 0;
  logs.forEach((l) => {
    const r = l.ratings || {};
    const avg = (Number(r.discipline || 0) + Number(r.sociability || 0) + Number(r.productivity || 0)) / 3;
    if (!Number.isNaN(avg) && avg > 0) {
      totalRating += avg;
      ratingCount += 1;
    }
  });
  const averageRating = ratingCount ? Math.round((totalRating / ratingCount) * 10) / 10 : 0;
  return { totalLogs, currentStreak, thisMonth, averageRating };
};

export const getRecentLogs = async (limit = 5) => {
  const userKey = getCurrentUserKey();
  const qy = query(userLogsCollectionRef(userKey), orderBy('date', 'desc'), fbLimit(limit));
  const snap = await getDocs(qy);
  const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  // Format logs for dashboard display (matching the old API format)
  const formattedLogs = logs.map(log => {
    const ratings = log.ratings || {};
    const avgRating = Math.round((Number(ratings.discipline || 0) + Number(ratings.sociability || 0) + Number(ratings.productivity || 0)) / 3);
    
    const tasks = Array.isArray(log.tasks) ? log.tasks : [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task?.completed).length;
    
    return {
      date: log.date,
      rating: avgRating,
      tasks: totalTasks,
      completed: completedTasks
    };
  });
  
  return formattedLogs;
};

export const exportData = () => {
  return localDataService.exportData();
};

export const exportDataByDateRange = async (startDate, endDate) => {
  const userKey = getCurrentUserKey();
  const qy = query(userLogsCollectionRef(userKey), orderBy('date', 'desc'));
  const snap = await getDocs(qy);
  const allLogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  // Filter logs by date range
  const filteredLogs = allLogs.filter(log => {
    const logDate = new Date(log.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return logDate >= start && logDate <= end;
  });
  
  return {
    logs: filteredLogs,
    dateRange: { startDate, endDate },
    exportDate: new Date().toISOString(),
    totalLogs: filteredLogs.length
  };
};

export const exportWeeklyReportPDF = async (weekStartDate) => {
  const report = await getWeeklyReport(weekStartDate);
  return report.data;
};

export const importData = (data) => {
  return localDataService.importData(data);
};

export const clearAllData = () => {
  return localDataService.clearAllData();
}; 