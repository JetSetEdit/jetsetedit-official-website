import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as serviceAccount from '../../secrets/firebase-service-account.json';

const firebaseAdminConfig = {
  credential: cert(serviceAccount as any),
};

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth }; 