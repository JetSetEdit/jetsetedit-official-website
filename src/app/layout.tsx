import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { MainNavigation } from "@/components/MainNavigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "JetSetEdit - Professional Video Editing Services",
  description: "Transform your raw footage into stunning, professional videos with our expert editing services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <MainNavigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
