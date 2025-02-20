import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp();

// Initialize Firestore
const db = getFirestore();

// Export the database instance
export { db }; 