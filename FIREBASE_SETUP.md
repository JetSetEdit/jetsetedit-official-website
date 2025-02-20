# Firebase Authentication Setup with Next.js and Vercel

## Critical Rules to Follow

### 1. Firebase Initialization
- NEVER initialize Firebase in server components
- ALWAYS use a singleton pattern for initialization
- MUST check if Firebase is already initialized before initializing again
- MUST use environment variables for Firebase config

### 2. Environment Variables
- MUST prefix all Firebase-related environment variables with `NEXT_PUBLIC_`
- REQUIRED environment variables:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  ```
- MUST set these in both:
  - Local `.env.local` file
  - Vercel project settings

### 3. Client-Side Components
- ALL Firebase Auth operations MUST be in client components
- MUST add `'use client'` directive to any component using Firebase Auth
- Authentication state management components MUST be client-side

### 4. File Structure
```
src/
  lib/
    firebase/
      config.ts     # Firebase configuration
      auth.ts       # Auth utilities
  components/
    auth/
      AuthProvider.tsx    # Auth context provider
      ProtectedRoute.tsx  # Route protection component
  context/
    AuthContext.tsx      # Auth context definition
```

### 5. Protected Routes
- MUST implement client-side route protection
- MUST handle loading states during auth checks
- MUST redirect unauthenticated users appropriately

### 6. Error Handling
- MUST implement proper error boundaries for auth operations
- MUST handle all possible Firebase Auth error codes
- MUST provide user-friendly error messages

### 7. Performance Considerations
- AVOID unnecessary re-renders with auth state changes
- USE appropriate memoization for auth-dependent components
- IMPLEMENT proper loading states

### 8. Security Best Practices
- NEVER store sensitive auth data in localStorage
- ALWAYS use proper session management
- IMPLEMENT proper CSRF protection
- USE appropriate security headers

### 9. Deployment Checklist
1. Verify all environment variables are set in Vercel
2. Ensure build process doesn't include server-side Firebase initialization
3. Test auth flow in development environment
4. Test auth flow in preview deployment
5. Monitor auth state in production

### 10. Testing Requirements
- MUST test auth flow in development
- MUST test auth flow in Vercel preview deployments
- MUST verify error handling
- MUST test with different auth providers if using multiple

## Critical Build Errors to Prevent

### 1. Firebase Initialization Errors
- ❌ DON'T initialize Firebase multiple times across different files
- ❌ DON'T mix client and server initialization
- ✅ DO use this exact initialization pattern:
  ```typescript
  // src/lib/firebase/config.ts
  'use client';
  
  import { getApps, initializeApp } from 'firebase/app';
  import { getAuth } from 'firebase/auth';
  
  let app = getApps().length ? getApps()[0] : null;
  let auth = null;
  
  try {
    if (!app) {
      app = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
    }
    auth = getAuth(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
  
  export { app, auth };
  ```

### 2. Import/Export Errors
- ❌ DON'T use default exports for auth functions
- ❌ DON'T mix named and default exports
- ✅ DO use consistent named exports:
  ```typescript
  // src/lib/auth.ts
  'use client';
  
  import { auth } from './firebase/config';
  import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
  
  export const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  };
  
  export const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };
  ```

### 3. Client/Server Component Separation
- ❌ DON'T mix client and server code in the same component
- ✅ DO create separate components for client-side auth logic:
  ```typescript
  // src/components/auth/LoginForm.tsx - Client Component
  'use client';
  
  import { useState } from 'react';
  import { signIn } from '@/lib/auth';
  
  export const LoginForm = () => {
    // Client-side form logic
  };
  
  // src/app/login/page.tsx - Server Component
  import { LoginForm } from '@/components/auth/LoginForm';
  
  export default function LoginPage() {
    return <LoginForm />;
  }
  ```

### 4. Dependency Management
- ❌ DON'T mix different versions of date-related libraries
- ✅ DO specify exact versions in package.json:
  ```json
  {
    "dependencies": {
      "date-fns": "^2.30.0",
      "react-day-picker": "^8.10.0",
      "tailwindcss-animate": "^1.0.7"
    }
  }
  ```
- ✅ DO run `npm install` with proper flags when needed:
  ```bash
  # For dependency conflicts
  npm install --legacy-peer-deps
  
  # For clean install
  rm -rf node_modules package-lock.json
  npm install
  ```

### 5. Environment Variable Verification
- ❌ DON'T deploy without verifying all required variables
- ✅ DO add this verification code:
  ```typescript
  // src/lib/firebase/config.ts
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );
  
  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }
  ```

### 6. Pre-Deployment Checklist
1. Verify all imports use correct paths
   ```typescript
   // ✅ Correct
   import { signIn } from '@/lib/auth';
   import { useAuth } from '@/context/AuthContext';
   
   // ❌ Incorrect
   import signIn from '@/lib/auth';
   import { useAuth } from '@/lib/auth-context';
   ```

2. Check all client components have 'use client' directive
   ```typescript
   // ✅ Correct
   'use client';
   import { useAuth } from '@/context/AuthContext';
   
   // ❌ Incorrect
   import { useAuth } from '@/context/AuthContext';
   ```

3. Verify all dependencies are installed
   ```bash
   npm install tailwindcss-animate date-fns@^2.30.0 react-day-picker@^8.10.0
   ```

4. Test build locally before deployment
   ```bash
   npm run build
   ```

## Implementation Steps

1. Install Dependencies
   ```