import { db } from './firebase'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'

// Fallback to localStorage for offline support
const STORAGE_KEY = 'jibble_drafts_v1'

const readAllLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeAllLocal = (obj) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
  } catch {}
}

const buildKey = (userId, dateKey) => `${userId}__${dateKey}`

// Cloud-based draft functions using Firestore
export const getDraft = async (userId, dateKey) => {
  try {
    // Try to get from Firestore first
    const draftRef = doc(db, 'users', userId, 'drafts', dateKey)
    const draftSnap = await getDoc(draftRef)
    
    if (draftSnap.exists()) {
      const draftData = draftSnap.data()
      // Also save to localStorage for offline access
      const all = readAllLocal()
      const key = buildKey(userId, dateKey)
      all[key] = draftData
      writeAllLocal(all)
      return draftData
    }
    
    // Fallback to localStorage if no cloud draft exists
    const all = readAllLocal()
    const key = buildKey(userId, dateKey)
    return all[key] || null
  } catch (error) {
    console.warn('Failed to fetch draft from cloud, using local fallback:', error)
    // Fallback to localStorage on error
    const all = readAllLocal()
    const key = buildKey(userId, dateKey)
    return all[key] || null
  }
}

export const saveDraft = async (userId, dateKey, data) => {
  const draftData = { ...data, _updatedAt: new Date().toISOString() }
  
  try {
    // Save to Firestore
    const draftRef = doc(db, 'users', userId, 'drafts', dateKey)
    await setDoc(draftRef, draftData, { merge: true })
    
    // Also save to localStorage for offline access
    const all = readAllLocal()
    const key = buildKey(userId, dateKey)
    all[key] = draftData
    writeAllLocal(all)
    
    console.log('✅ Draft saved to cloud and local storage')
  } catch (error) {
    console.warn('Failed to save draft to cloud, saving locally only:', error)
    // Fallback to localStorage only
    const all = readAllLocal()
    const key = buildKey(userId, dateKey)
    all[key] = draftData
    writeAllLocal(all)
  }
}

export const clearDraft = async (userId, dateKey) => {
  try {
    // Delete from Firestore
    const draftRef = doc(db, 'users', userId, 'drafts', dateKey)
    await deleteDoc(draftRef)
    
    // Also clear from localStorage
    const all = readAllLocal()
    const key = buildKey(userId, dateKey)
    if (all[key]) {
      delete all[key]
      writeAllLocal(all)
    }
    
    console.log('✅ Draft cleared from cloud and local storage')
  } catch (error) {
    console.warn('Failed to clear draft from cloud, clearing locally only:', error)
    // Fallback to localStorage only
    const all = readAllLocal()
    const key = buildKey(userId, dateKey)
    if (all[key]) {
      delete all[key]
      writeAllLocal(all)
    }
  }
}

// Migration function to move localStorage drafts to cloud
export const migrateLocalDraftsToCloud = async (userId) => {
  try {
    const all = readAllLocal()
    const userDrafts = Object.keys(all).filter(key => key.startsWith(`${userId}__`))
    
    if (userDrafts.length === 0) {
      console.log('No local drafts to migrate')
      return
    }
    
    console.log(`🔄 Migrating ${userDrafts.length} local drafts to cloud...`)
    
    for (const key of userDrafts) {
      const dateKey = key.replace(`${userId}__`, '')
      const draftData = all[key]
      
      try {
        const draftRef = doc(db, 'users', userId, 'drafts', dateKey)
        await setDoc(draftRef, draftData, { merge: true })
        console.log(`✅ Migrated draft for ${dateKey}`)
      } catch (error) {
        console.warn(`Failed to migrate draft for ${dateKey}:`, error)
      }
    }
    
    console.log('✅ Draft migration completed')
  } catch (error) {
    console.warn('Failed to migrate drafts:', error)
  }
}

export default { getDraft, saveDraft, clearDraft, migrateLocalDraftsToCloud }


