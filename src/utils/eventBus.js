// Simple event bus for app-wide notifications without extra deps
const listeners = new Map();

export const on = (eventName, handler) => {
  if (!listeners.has(eventName)) listeners.set(eventName, new Set());
  listeners.get(eventName).add(handler);
  return () => off(eventName, handler);
};

export const off = (eventName, handler) => {
  const set = listeners.get(eventName);
  if (!set) return;
  set.delete(handler);
  if (set.size === 0) listeners.delete(eventName);
};

export const emit = (eventName, payload) => {
  const set = listeners.get(eventName);
  if (!set) return;
  // Iterate on a copy so handlers can remove themselves safely
  Array.from(set).forEach((fn) => {
    try { fn(payload); } catch {}
  });
};

export default { on, off, emit };


