'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            TinyBounty
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/bounties" className="text-slate-300 hover:text-white transition">
              Browse
            </Link>
            <Link href="/create" className="text-slate-300 hover:text-white transition">
              Post Bounty
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4">
        <div className="py-24 text-center">
          <div className="inline-block px-4 py-2 bg-blue-900/50 border border-blue-700 rounded-full text-blue-300 text-sm mb-6">
            ⚡ Built on Base • Low fees • Fast transactions
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Micro-tasks.<br />
            <span className="text-blue-400">Instant pay.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            Post small tasks with crypto bounties. Workers complete them, get paid instantly.
            Smart contract escrow protects both parties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
            >
              Post a Bounty
            </Link>
            <Link
              href="/bounties"
              className="px-8 py-4 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition text-lg border border-slate-700"
            >
              Browse Bounties
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <section className="py-16 border-t border-slate-800">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                📝
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">1. Post a Bounty</h3>
              <p className="text-slate-400">
                Describe your task, set a reward (0.0001–1 ETH), and your funds are locked in escrow.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">2. Work Gets Done</h3>
              <p className="text-slate-400">
                A worker claims your bounty, completes the task, and submits their work.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-amber-900/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                💰
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Instant Payment</h3>
              <p className="text-slate-400">
                Approve the work and the worker gets paid instantly. No response? Auto-refund in 2 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-slate-800">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why TinyBounty?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-start gap-4">
              <div className="text-2xl">🔒</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Smart Contract Escrow</h3>
                <p className="text-slate-400">
                  Funds are locked in a verified smart contract until work is approved.
                </p>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-start gap-4">
              <div className="text-2xl">⏱️</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Auto-Refund Protection</h3>
                <p className="text-slate-400">
                  If a poster ghosts you, claim an automatic refund after 2 hours.
                </p>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-start gap-4">
              <div className="text-2xl">💎</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Low 2.5% Fee</h3>
                <p className="text-slate-400">
                  Only charged on successful bounties. No hidden costs.
                </p>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-start gap-4">
              <div className="text-2xl">🚀</div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Built on Base</h3>
                <p className="text-slate-400">
                  Fast, cheap transactions on Coinbase&apos;s L2 network.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Connect your wallet and post your first bounty in minutes.
            </p>
            {isConnected ? (
              <Link
                href="/create"
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
              >
                Post a Bounty →
              </Link>
            ) : (
              <ConnectButton />
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>
            TinyBounty © 2026 • Built with ❤️ on Base
          </p>
          <p className="mt-2">
            <a href="https://github.com" className="hover:text-slate-300">GitHub</a>
            {' • '}
            <a href="https://basescan.org" className="hover:text-slate-300">Contract</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
