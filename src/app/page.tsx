import { Metadata } from 'next';
import { HomeContent } from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: 'Welcome | JSE Admin',
  description: 'Jet Set Edit Admin Dashboard',
};

export default function HomePage() {
  return <HomeContent />;
}
