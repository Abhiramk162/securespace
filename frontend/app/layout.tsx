import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SecureSphere — AI-Powered Open-Source Security Intelligence',
  description: 'Discover vulnerabilities, analyze dependency risks, investigate threats and protect your software with explainable AI-powered security intelligence.',
  keywords: ['cybersecurity', 'vulnerability scanner', 'open source security', 'dependency analysis', 'CVE', 'AI security'],
  authors: [{ name: 'SecureSphere Team' }],
  openGraph: {
    title: 'SecureSphere — AI-Powered Security Intelligence Platform',
    description: 'Discover. Analyze. Protect.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#101820" />
      </head>
      <body className="bg-navy-900 text-[#F4F7FA] antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#202C37',
              color: '#F4F7FA',
              border: '1px solid #2A3A48',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#20B486', secondary: '#F4F7FA' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#F4F7FA' },
            },
          }}
        />
      </body>
    </html>
  );
}
