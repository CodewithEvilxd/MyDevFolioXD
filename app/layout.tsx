// app/layout.tsx
import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { LanguageProvider } from '@/lib/LanguageContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import VisitorCounter from '@/components/ui/VisitorCounter';

// Font for code and technical elements
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Font for UI and general text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MyDevFolioXD | Developer Portfolio',
  description: 'Developer portfolio generated from GitHub profile',
  other: {
    'google-site-verification': 'nuCl9b7zW3D9gHLY2i0bTUAsUuelQXWQZDKsw0MpaNQ',
  },
  openGraph: {
    title: 'MyDevFolioXD | Developer Portfolio',
    description: 'Developer portfolio generated from GitHub profile',
    url: 'https://www.MyDevFolioXD.com/',
    siteName: 'MyDevFolioXD',
    images: [
      {
        url: 'https://www.MyDevFolioXD.com/MyDevFolioXDOG.png',
        width: 1200,
        height: 630,
        alt: 'Opengraph',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className='font-sans min-h-screen flex flex-col relative'>
        <LanguageProvider>
          <ThemeProvider>
            <div className='fixed top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2'>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <div className='fixed top-2 left-2 sm:top-4 sm:left-4 text-xs font-mono text-[var(--text-secondary)]'>
              {new Date()
                .toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                .toUpperCase()}
            </div>

          <main className='flex-grow container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12'>
            {children}
            <Analytics />
          </main>

          <VisitorCounter />

          <div className='fixed bottom-2 right-2 sm:bottom-4 sm:right-4'>
            <div className='bg-[var(--primary)] bg-opacity-10 backdrop-blur-sm border border-[var(--primary)] border-opacity-30 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs text-white'>
              <span className='hidden sm:inline'>Made with </span>
              <span className='font-bold'>MyDevFolioXD</span>
            </div>
          </div>

          {/* Grid decorations */}
          <div className='grid-marker top-[25%] left-[10%]'></div>
          <div className='grid-marker bottom-[15%] right-[10%]'></div>
          <div className='grid-marker top-[10%] right-[30%]'></div>
          <div className='grid-marker bottom-[30%] left-[20%]'></div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
