
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://mcgv.de'),
  title: 'Code & Beats – Musik, Code & Games – vereint.',
  description: 'PowerShell by day. Synthwave by night. Gaming always. Moderne Portfolio-Website mit Musik, PowerShell-Scripts und Gaming-Content.',
  keywords: ['Music', 'PowerShell', 'Gaming', 'Synthwave', 'Code', 'Scripts'],
  authors: [{ name: 'Michael', url: 'https://mcgv.de' }],
  creator: 'Michael',
  publisher: 'Code & Beats',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: '/',
    siteName: 'Code & Beats',
    title: 'Code & Beats',
    description: 'PowerShell by day. Synthwave by night. Gaming always.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Code & Beats - Musik, Code & Games vereint',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Code & Beats',
    description: 'PowerShell by day. Synthwave by night. Gaming always.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
