import eventBus from './utils/eventBus';
import localDataService from './services/localDataService';
import apiClient from './apiClient';

const extractErrorMessage = (error, fallback = 'Something went wrong') => {
  try {
    const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback;
    if (typeof msg === 'string' && msg.trim()) return msg;
  } catch {}
  return fallback;
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// No token storage in localStorage
const getToken = () => null;

// Check if backend is available
const isBackendAvailable = async () => {
  try {
    await apiClient.get(`/health`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
};

// AI Quotes (backend preferred, public fallback)
export const getAIQuote = async () => {
  try {
    const backendAvailable = await isBackendAvailable();
    if (backendAvailable) {
      const res = await apiClient.get(`/ai/quote`, { timeout: 6000 });
      const text = res?.data?.quote || res?.data?.text || res?.data;
      if (text && typeof text === 'string') return { success: true, text };
    }
  } catch {}

  // Fallback to public quotes API (non-AI but varied)
  try {
    const res = await fetch('https://api.quotable.io/random');
    if (res.ok) {
      const data = await res.json();
      const content = [data?.content, data?.author ? `— ${data.author}` : ''].filter(Boolean).join(' ');
      if (content) return { success: true, text: content };
    }
  } catch {}

  return { success: false, text: null };
};

// Current user (from JWT/localStorage)
const getCurrentUserKey = () => {
  const raw = localStorage.getItem('authUser');
  if (!raw) throw new Error('Not authenticated');
  const u = JSON.parse(raw);
  return u.id;
};

// Backend endpoints
const logsUrl = () => `/logs`;
const logByDateUrl = (date) => `/logs/${encodeURIComponent(date)}`;
const draftsUrl = (date) => `/drafts/${encodeURIComponent(date)}`;

// Auth - Email/password with email verification via OTP and optional 2FA
export const emailSignUp = async (name, email, password) => {
  try {
    const res = await apiClient.post('/auth/signup', { name, email, password });
    return { needsVerification: true, message: res.data?.message || 'Verification code sent to your email.' };
  } catch (e) {
    const msg = extractErrorMessage(e, 'Sign up failed');
    throw new Error(msg);
  }
};

export const emailSignIn = async (email, password) => {
  try {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.needsOtp) {
      return { needsOtp: true, message: res.data?.message };
    }
    if (res.data?.user) {
      localStorage.setItem('authUser', JSON.stringify(res.data.user));
      return { user: res.data.user };
    }
    throw new Error('Unexpected login response');
  } catch (e) {
    const msg = extractErrorMessage(e, 'Invalid email or password');
    throw new Error(msg);
  }
};

export const verifyEmailCode = async (email, code) => {
  try {
    const res = await apiClient.post('/auth/verify-email', { email, code });
    localStorage.setItem('authUser', JSON.stringify(res.data.user));
    return { user: res.data.user };
  } catch (e) {
    throw new Error(extractErrorMessage(e, 'Invalid or expired code'));
  }
};

export const verifyLoginCode = async (email, code) => {
  try {
    const res = await apiClient.post('/auth/verify-login', { email, code });
    localStorage.setItem('authUser', JSON.stringify(res.data.user));
    return { user: res.data.user };
  } catch (e) {
    throw new Error(extractErrorMessage(e, 'Invalid or expired code'));
  }
};

export const resendOtp = async (email, purpose) => {
  try {
    await apiClient.post('/auth/resend-otp', { email, purpose });
    return { success: true };
  } catch (e) {
    throw new Error(extractErrorMessage(e, 'Failed to resend code'));
  }
};

// Auth - Profile and logout
export const getProfile = async () => {
  const raw = localStorage.getItem('authUser');
  if (!raw) throw new Error('Not authenticated');
  return { data: JSON.parse(raw) };
};

export const logout = async () => {
  try { await apiClient.post('/auth/logout'); } catch {}
  localStorage.removeItem('authUser');
  return { data: { message: 'Logged out successfully' } };
};

// Auth - Password reset
export const forgotPassword = async (email) => {
  await apiClient.post('/auth/password/request', { email });
  return { data: { message: 'Password reset code sent' } };
};

export const resetPassword = async (email, code, new_password) => {
  return apiClient.post(`/auth/password/reset`, { email, code, newPassword: new_password });
};

// Logs
export const getLogs = async () => {
  const res = await apiClient.get(logsUrl());
  const logs = Array.isArray(res.data) ? res.data : [];
  return { success: true, data: logs };
};

export const createLog = async (log) => {
  const res = await apiClient.post(logsUrl(), { ...log });
  const data = res.data;
  eventBus.emit('logs:changed', { type: 'create', date: log.date, log: data });
  return { data };
};

export const updateLog = async (date, updates) => {
  const res = await apiClient.patch(logByDateUrl(date), { ...updates });
  const data = res.data;
  eventBus.emit('logs:changed', { type: 'update', date, log: data });
  return { data };
};

export const deleteLog = async (date) => {
  await apiClient.delete(logByDateUrl(date));
  eventBus.emit('logs:changed', { type: 'delete', date });
  return { data: { message: 'Deleted' } };
};

export const getLogByDate = async (date) => {
  try {
    const res = await apiClient.get(logByDateUrl(date));
    return { data: res.data || null };
  } catch (e) {
    return { data: null };
  }
};

// Cloud Drafts replacement
export const getCloudDraft = async (date) => {
  try {
    const res = await apiClient.get(draftsUrl(date));
    return { data: res.data || null };
  } catch (e) {
    return { data: null };
  }
};

export const saveCloudDraft = async (date, draftData) => {
  const payload = { ...draftData, _updatedAt: new Date().toISOString() };
  await apiClient.post(draftsUrl(date), payload);
  return { success: true };
};

export const clearCloudDraft = async (date) => {
  await apiClient.delete(draftsUrl(date));
  return { success: true };
};

export const subscribeCloudDraft = (_date, _onChange) => {
  // No realtime with Mongo; no-op
  return () => {};
};

// Weekly Reports
export const getWeeklyReport = async (weekStartDate, forceRegenerate = false) => {
  const logsResp = await getLogs();
  const logs = logsResp?.data || [];
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const weekLogs = logs.filter((l) => {
    const d = new Date(l.date);
    return d >= start && d <= end;
  });

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
    const diet = l.diet || {};
    if (diet.protein != null) protein.push(toNumber(diet.protein));
    if (diet.calories != null) calories.push(toNumber(diet.calories));
    if (diet.water != null) water.push(toNumber(diet.water));
    if (l.steps != null) steps.push(toNumber(l.steps));
  });
  const average = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

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
    created_at: new Date().toISOString()
  };
  return { data: { id: weekStartDate, ...report } };
};

export const getWeeklyReports = async () => {
  return { data: [] };
};

// Health check
export const healthCheck = async () => {
  try {
    return await apiClient.get(`/health`);
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
  const today = new Date();
  const byDate = [...logs].sort((a, b) => (a.date > b.date ? -1 : 1));
  const hasLogForDate = (dateObj) => {
    const target = dateObj.toDateString();
    return byDate.some((l) => new Date(l.date).toDateString() === target);
  };
  const base = new Date(today);
  if (!hasLogForDate(today)) {
    base.setDate(base.getDate() - 1);
  }
  let currentStreak = 0;
  for (let i = 0; i < byDate.length; i++) {
    const d = new Date(byDate[i].date);
    const expected = new Date(base);
    expected.setDate(base.getDate() - i);
    if (d.toDateString() === expected.toDateString()) currentStreak += 1; else break;
  }
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
  const logsResp = await getLogs();
  const logs = (logsResp?.data || []).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit);
  return logs.map((log) => {
    const ratings = log.ratings || {};
    const avgRating = Math.round((Number(ratings.discipline || 0) + Number(ratings.sociability || 0) + Number(ratings.productivity || 0)) / 3);
    const tasks = Array.isArray(log.tasks) ? log.tasks : [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t?.completed).length;
    return { date: log.date, rating: avgRating, tasks: totalTasks, completed: completedTasks };
  });
};

export const exportData = () => {
  return localDataService.exportData();
};

export const exportDataByDateRange = async (startDate, endDate) => {
  const all = await getLogs();
  const allLogs = all?.data || [];
  const filteredLogs = allLogs.filter((log) => {
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