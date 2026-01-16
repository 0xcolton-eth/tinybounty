import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TinyBounty - Micro-Task Marketplace',
  description: 'Decentralized micro-task marketplace with instant escrow payments on Base.',
  keywords: ['bounty', 'crypto', 'Base', 'Ethereum', 'freelance', 'micro-tasks'],
  openGraph: {
    title: 'TinyBounty - Micro-Task Marketplace',
    description: 'Post tasks, get paid in crypto. Instant escrow on Base.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
