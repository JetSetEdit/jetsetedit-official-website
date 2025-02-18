import Image from 'next/image';
import { GradientCursor } from '@/components/GradientCursor';
import { StarCollector } from '@/components/StarCollector';

export default function Home() {
  return (
    <main className="h-screen bg-gradient-to-br from-[#e8f0ff] to-[#f5f8ff] flex items-center justify-center overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#00B2FF_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03]" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00B2FF] to-[#0077FF] opacity-[0.03] animate-gradient-x" />
      </div>
      
      {/* Gradient cursor effect */}
      <GradientCursor />
      
      {/* Star collector game */}
      <StarCollector />
      
      {/* Main content */}
      <div className="w-full max-w-[1400px] mx-auto text-center relative z-10">
        <div className="-mt-16 space-y-16">
          <Image
            src="/Web_Ready/Web_Ready/base/text/base_textlogo_transparent_background.png"
            alt="Jet Set Edit Logo"
            width={1200}
            height={180}
            priority
            className="w-auto h-auto"
          />
          
          <div className="flex flex-col items-center">
            <h1 className="text-4xl tracking-wide font-light uppercase relative animate-fade-up">
              <span className="bg-gradient-to-r from-[#00B2FF] via-[#0077FF] to-[#00B2FF] animate-gradient-x bg-[200%_auto] bg-clip-text text-transparent">
                Coming Soon
              </span>
            </h1>
          </div>
        </div>
      </div>
    </main>
  );
}
