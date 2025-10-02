# Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Create Firebase project
- [ ] Enable Authentication (Email/Password)
- [ ] Create Firestore database
- [ ] Enable Analytics (optional)
- [ ] Get Firebase configuration from Project Settings
- [ ] Set up environment variables in Vercel dashboard:
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
  - [ ] `VITE_FIREBASE_MEASUREMENT_ID` (optional)

### 2. Code Quality
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - successful build
- [ ] Test locally with `npm run preview`
- [ ] Check for console errors
- [ ] Verify all features work correctly

### 3. Firebase Security Rules
- [ ] Set up Firestore security rules
- [ ] Configure Authentication settings
- [ ] Test authentication flow
- [ ] Verify data access permissions

## Deployment Steps

### Option 1: Vercel CLI
1. [ ] Install Vercel CLI: `npm i -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Deploy: `npm run deploy`

### Option 2: Vercel Dashboard
1. [ ] Push code to GitHub/GitLab/Bitbucket
2. [ ] Connect repository to Vercel
3. [ ] Configure build settings (auto-detected)
4. [ ] Set environment variables
5. [ ] Deploy

## Post-Deployment Verification

### 1. Basic Functionality
- [ ] App loads without errors
- [ ] Authentication works
- [ ] Navigation works
- [ ] All pages load correctly
- [ ] Responsive design works on mobile

### 2. Firebase Integration
- [ ] User registration works
- [ ] User login works
- [ ] Data saves to Firestore
- [ ] Data loads from Firestore
- [ ] Analytics tracking (if enabled)

### 3. Performance
- [ ] Page load times are acceptable
- [ ] No console errors
- [ ] Images and assets load correctly
- [ ] Caching works properly

### 4. Security
- [ ] HTTPS is enabled
- [ ] Security headers are present
- [ ] No sensitive data exposed
- [ ] Firebase rules are properly configured

## Troubleshooting

### Common Issues

#### Build Fails
- Check environment variables are set
- Verify Firebase configuration
- Check for syntax errors with `npm run lint`

#### App Doesn't Load
- Check browser console for errors
- Verify Firebase project is active
- Check network requests in DevTools

#### Authentication Issues
- Verify Firebase Auth is enabled
- Check authentication domain settings
- Verify email/password provider is enabled

#### Data Not Saving
- Check Firestore security rules
- Verify database is created
- Check network requests for errors

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)

## Rollback Plan
If deployment fails:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test build locally
4. Fix issues and redeploy
5. Contact support if needed
