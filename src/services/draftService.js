const STORAGE_KEY = 'jibble_drafts_v1'

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeAll = (obj) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
  } catch {}
}

const buildKey = (userId, dateKey) => `${userId}__${dateKey}`

export const getDraft = (userId, dateKey) => {
  const all = readAll()
  const key = buildKey(userId, dateKey)
  return all[key] || null
}

export const saveDraft = (userId, dateKey, data) => {
  const all = readAll()
  const key = buildKey(userId, dateKey)
  all[key] = { ...data, _updatedAt: new Date().toISOString() }
  writeAll(all)
}

export const clearDraft = (userId, dateKey) => {
  const all = readAll()
  const key = buildKey(userId, dateKey)
  if (all[key]) {
    delete all[key]
    writeAll(all)
  }
}

export default { getDraft, saveDraft, clearDraft }


