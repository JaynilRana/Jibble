import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Web app Firebase configuration (sourced from environment only)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Basic validation to avoid deploying with leaked defaults
if (typeof window !== 'undefined') {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn('[Firebase] Missing config keys:', missing.join(', '))
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Analytics only in browser and if supported
let analytics
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  })
}

// Export common Firebase services
export const firebaseApp = app
export const auth = getAuth(app)
export const db = getFirestore(app)
export { analytics }


