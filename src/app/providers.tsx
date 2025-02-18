import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Elements stripe={getStripe()}>
        {children}
        <Toaster />
      </Elements>
    </ThemeProvider>
  );
} 