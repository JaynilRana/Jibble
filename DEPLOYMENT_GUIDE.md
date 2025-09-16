# Jibble Production Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended)

### Step 1: Prepare Your Project

1. **Create Environment Variables File**
```bash
# Create .env.local file
touch .env.local
```

2. **Add Environment Variables**
```env
# .env.local
VITE_FIREBASE_API_KEY=AIzaSyA6girBwftKgH4970RKdV-MKhavB95EwK0
VITE_FIREBASE_AUTH_DOMAIN=jibble-f2531.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jibble-f2531
VITE_FIREBASE_STORAGE_BUCKET=jibble-f2531.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=731475000446
VITE_FIREBASE_APP_ID=1:731475000446:web:838d52c657a5881e2f6c2f
VITE_FIREBASE_MEASUREMENT_ID=G-5W088QE4PL
```

3. **Update Firebase Config**
```javascript
// src/services/firebase.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}
```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from Project Directory**
```bash
cd /path/to/your/jibble/project
vercel
```

4. **Follow the Prompts**
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name: **jibble** (or your preferred name)
- Directory: **./** (current directory)
- Override settings? **N**

5. **Set Environment Variables in Vercel Dashboard**
- Go to your project dashboard
- Settings → Environment Variables
- Add all the VITE_ variables from .env.local

### Step 3: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**
- Go to Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

2. **Update Firebase Auth Domain**
- Go to Firebase Console → Authentication → Settings
- Add your custom domain to "Authorized domains"

## 🔧 Production Optimizations

### 1. Update Vite Config
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
```

### 2. Add Security Headers
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Update Package.json
```json
{
  "name": "jibble",
  "version": "1.0.0",
  "description": "Daily log and productivity tracking app",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "deploy": "vercel --prod"
  }
}
```

## 🔐 Firebase Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Daily logs
      match /daily_logs/{logId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Weekly reports
      match /weekly_reports/{reportId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Storage Rules (if you add file uploads)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📊 Performance Monitoring

### 1. Add Vercel Analytics
```bash
npm install @vercel/analytics
```

```javascript
// src/main.jsx
import { inject } from '@vercel/analytics'
inject()
```

### 2. Firebase Performance
```javascript
// src/services/firebase.js
import { getPerformance } from 'firebase/performance'

const perf = getPerformance(app)
```

## 🚀 Deployment Commands

### Quick Deploy
```bash
# Build and deploy
npm run build
vercel --prod

# Or use the deploy script
npm run deploy
```

### Environment-Specific Deployments
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
vercel --target production
```

## 🔍 Post-Deployment Checklist

- [ ] Test authentication flow
- [ ] Verify email verification works
- [ ] Check all pages load correctly
- [ ] Test data persistence
- [ ] Verify mobile responsiveness
- [ ] Check console for errors
- [ ] Test export functionality
- [ ] Verify weekly reports generation
- [ ] Check performance metrics
- [ ] Test with different browsers

## 🆘 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check for TypeScript errors
   - Verify all imports are correct
   - Run `npm run lint` to check for issues

2. **Environment Variables Not Working**
   - Ensure variables start with `VITE_`
   - Check Vercel dashboard settings
   - Redeploy after adding variables

3. **Firebase Connection Issues**
   - Verify API keys are correct
   - Check Firebase project settings
   - Ensure domain is authorized

4. **Routing Issues**
   - Add vercel.json with rewrites
   - Check React Router configuration
   - Verify all routes are working

## 📈 Scaling Considerations

### When You Need to Scale:
- **User Growth**: Monitor Firebase usage limits
- **Data Growth**: Consider Firestore pricing
- **Performance**: Add caching strategies
- **Features**: Consider microservices architecture

### Cost Optimization:
- **Firebase**: Monitor read/write operations
- **Vercel**: Stay within free tier limits
- **CDN**: Leverage Vercel's global CDN
- **Images**: Optimize and compress assets

## 🎯 Success Metrics

Track these metrics post-deployment:
- Page load times
- User registration rate
- Daily active users
- Email verification success rate
- User retention
- Performance scores
