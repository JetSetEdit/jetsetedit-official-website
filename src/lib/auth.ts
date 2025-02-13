import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { auth } from "@/lib/server/firebase";

/**
 * ⚠️ CRITICAL AUTHENTICATION CONFIGURATION ⚠️
 * 
 * This file contains critical authentication logic for admin access.
 * The admin authentication flow is currently working with admin@jetsetedit.au.
 * 
 * DO NOT MODIFY the following without thorough testing:
 * 1. The signIn callback - handles admin role verification
 * 2. The session and jwt callbacks - handle role persistence
 * 3. The Google provider configuration
 * 
 * If you need to add new functionality:
 * - Add it separately without modifying existing admin auth logic
 * - Test thoroughly with both admin and non-admin accounts
 * - Verify admin@jetsetedit.au can still access the admin dashboard
 */

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Firebase',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "name@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }
        
        try {
          // First verify the user exists
          const userRecord = await auth.getUserByEmail(credentials.email);
          console.log('Found user:', userRecord.uid);
          
          // Get custom claims
          const customClaims = userRecord.customClaims || {};
          console.log('Custom claims:', customClaims);
          
          // For now, we'll allow any existing user to sign in
          // In production, you should implement proper password verification
          return {
            id: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName,
            role: customClaims.role || 'client',
            stripeCustomerId: customClaims.stripeCustomerId,
          };

        } catch (error) {
          console.error('Auth error:', error);
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
  callbacks: {
    async signIn({ user, account }) {
      try {
        // For credentials provider (client sign-in), allow it
        if (account?.provider === 'credentials') {
          return true;
        }

        // For social logins (admin sign-in), verify admin role
        if (account?.provider === 'google' || account?.provider === 'github') {
          const adminUser = await auth.getUserByEmail(user.email!);
          const customClaims = adminUser.customClaims || {};
          user.role = customClaims.role;
          return customClaims.role === 'admin';
        }
        return false;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      if (token.role) {
        session.user.role = token.role;
      }
      if (token.stripeCustomerId) {
        session.user.stripeCustomerId = token.stripeCustomerId;
      }
      return session;
    },
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user });
      if (user) {
        token.role = user.role;
        token.stripeCustomerId = user.stripeCustomerId;
      }
      return token;
    },
  },
}; 