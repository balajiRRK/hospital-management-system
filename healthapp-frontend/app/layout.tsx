import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';

import { AuthProvider } from '@/app/providers/authProvider';
import Navbar from '@/components/ui/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HealthApp',
  description: 'Capstone health management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {/* Have to look to see if this the right way  */}
          <div className="flex justify-end p-3">
            <Navbar />
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
