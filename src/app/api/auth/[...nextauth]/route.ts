import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { auth as adminAuth } from "@/lib/firebase-admin";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Firebase',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "name@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const userCredential = await signInWithEmailAndPassword(
            firebaseAuth,
            credentials.email,
            credentials.password
          );
          
          const { user } = userCredential;
          return {
            id: user.uid,
            email: user.email,
            name: user.displayName,
            image: user.photoURL,
          };
        } catch (error) {
          console.error('Firebase auth error:', error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      },
      httpOptions: {
        timeout: 10000 // Increase timeout to 10 seconds
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Sign in callback:', { user, account, profile });
      try {
        if (account?.provider === 'google' || account?.provider === 'github') {
          console.log('Creating Firebase token for social login');
          const firebaseToken = await adminAuth.createCustomToken(user.id);
          user.firebaseToken = firebaseToken;
          console.log('Firebase token created successfully');
          return true;
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        // Return false only for critical errors
        if (error instanceof Error && error.message.includes('timeout')) {
          console.log('Retrying after timeout...');
          return true; // Allow retry on timeout
        }
        return false;
      }
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      try {
        if (token.firebaseToken) {
          session.firebaseToken = token.firebaseToken;
        }
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback:', { token, user, account });
      try {
        if (user?.firebaseToken) {
          token.firebaseToken = user.firebaseToken;
        }
        return token;
      } catch (error) {
        console.error('Error in jwt callback:', error);
        return token;
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 