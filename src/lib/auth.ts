'use client';

import { auth } from './firebase/config';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  AuthError as FirebaseAuthError
} from 'firebase/auth';
import type { Auth as FirebaseAuth } from 'firebase/auth';

export type AuthError = {
  code: string;
  message: string;
};

export type AuthResult = {
  data: { uid: string } | null;
  error: AuthError | null;
};

const handleAuthError = (error: unknown): AuthError => {
  if (error instanceof Error) {
    return {
      code: (error as FirebaseAuthError).code || 'unknown',
      message: error.message,
    };
  }
  return {
    code: 'unknown',
    message: 'An unexpected error occurred'
  };
};

export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  if (!auth) {
    return {
      data: null,
      error: {
        code: 'auth/not-initialized',
        message: 'Firebase auth not initialized'
      }
    };
  }

  try {
    const result = await signInWithEmailAndPassword(auth as FirebaseAuth, email, password);
    return { 
      data: { uid: result.user.uid }, 
      error: null 
    };
  } catch (error) {
    return { 
      data: null, 
      error: handleAuthError(error)
    };
  }
};

export const signInWithGoogle = async (): Promise<AuthResult> => {
  if (!auth) {
    return {
      data: null,
      error: {
        code: 'auth/not-initialized',
        message: 'Firebase auth not initialized'
      }
    };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth as FirebaseAuth, provider);
    return { 
      data: { uid: result.user.uid }, 
      error: null 
    };
  } catch (error) {
    return {
      data: null,
      error: handleAuthError(error)
    };
  }
};

export const signOut = async (): Promise<AuthResult> => {
  try {
    if (!auth) {
      throw new Error('Auth not initialized');
    }
    await firebaseSignOut(auth);
    return { data: null, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        code: (error as FirebaseAuthError).code || 'unknown',
        message: (error as FirebaseAuthError).message || 'An unknown error occurred'
      }
    };
  }
}; 