import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Web app Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA6girBwftKgH4970RKdV-MKhavB95EwK0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'jibble-f2531.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'jibble-f2531',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'jibble-f2531.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '731475000446',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:731475000446:web:838d52c657a5881e2f6c2f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5W088QE4PL'
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


