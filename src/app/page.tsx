'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function Home() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = () => {
    setIsLoading('credentials');
    router.push('/auth/signin');
  };

  const handleSocialSignIn = async (provider: string) => {
    try {
      setIsLoading(provider);
      await signIn(provider, { callbackUrl: '/admin' });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setIsLoading(null);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#0F1117] flex flex-col items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="mb-12 relative w-full max-w-[400px] mx-auto">
          <Image
            src="/images/base_text-logoname_transparent_background.png"
            alt="JetSet Edit Logo"
            width={400}
            height={80}
            priority
            quality={100}
            className="w-full h-auto object-contain"
            style={{ maxWidth: '100%', height: 'auto' }}
            onError={(e) => {
              console.error('Error loading primary logo, trying fallback');
              const target = e.target as HTMLImageElement;
              target.src = "/images/customcolor_text-logoname_transparent_background.png";
            }}
          />
        </div>
        <p className="text-xl text-white mb-2">
          Client Portal
        </p>
        <p className="text-gray-400 mb-6">
          Welcome to JetSet Edit's client portal. If you're an existing client, please sign in to access your projects and account information.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleSignIn}
            disabled={isLoading !== null}
            className="w-full inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#00A3FF] hover:bg-[#0088D4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3FF] disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading === 'credentials' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in with Email'
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0F1117] text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={() => handleSocialSignIn('google')}
            disabled={isLoading !== null}
            className="w-full inline-flex justify-center items-center px-6 py-2.5 border border-gray-800 rounded-md shadow-sm bg-[#1A1D24] text-white hover:bg-[#22262F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3FF] disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading === 'google' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <button
            onClick={() => handleSocialSignIn('github')}
            disabled={isLoading !== null}
            className="w-full inline-flex justify-center items-center px-6 py-2.5 border border-gray-800 rounded-md shadow-sm bg-[#1A1D24] text-white hover:bg-[#22262F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3FF] disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading === 'github' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Sign in with GitHub
              </>
            )}
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          For business inquiries, please contact us directly.
        </p>
      </div>
    </div>
  );
}
