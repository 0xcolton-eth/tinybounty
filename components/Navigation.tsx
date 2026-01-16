'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          TinyBounty
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/bounties"
            className={`transition ${
              isActive('/bounties')
                ? 'text-white font-medium'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Browse
          </Link>
          <Link
            href="/create"
            className={`transition ${
              isActive('/create')
                ? 'text-white font-medium'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Post Bounty
          </Link>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
