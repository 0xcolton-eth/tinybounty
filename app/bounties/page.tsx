'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import { TINYBOUNTY_ADDRESS, TINYBOUNTY_ABI, STATUS_LABELS, Bounty, BountyStatus } from '@/config/wagmi';

export default function BrowseBounties() {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open'>('open');

  useEffect(() => {
    async function loadBounties() {
      if (!publicClient) return;

      try {
        // Get the next bounty ID to know how many bounties exist
        const nextId = await publicClient.readContract({
          address: TINYBOUNTY_ADDRESS[chainId as keyof typeof TINYBOUNTY_ADDRESS],
          abi: TINYBOUNTY_ABI,
          functionName: 'nextBountyId',
        });

        const bountyPromises: Promise<unknown>[] = [];
        
        // Fetch all bounties (start from 1, not 0)
        for (let i = 1; i < Number(nextId); i++) {
          bountyPromises.push(
            publicClient.readContract({
              address: TINYBOUNTY_ADDRESS[chainId as keyof typeof TINYBOUNTY_ADDRESS],
              abi: TINYBOUNTY_ABI,
              functionName: 'getBounty',
              args: [BigInt(i)],
            })
          );
        }

        const results = await Promise.all(bountyPromises);

        const formattedBounties: Bounty[] = results.map((result: unknown) => {
          const bounty = result as { id: bigint; poster: string; title: string; description: string; reward: bigint; deadline: bigint; worker: string; submissionURI: string; status: number; createdAt: bigint; claimedAt: bigint; submittedAt: bigint };
          return {
            id: bounty.id.toString(),
            poster: bounty.poster,
            title: bounty.title,
            description: bounty.description,
            reward: bounty.reward.toString(),
            deadline: bounty.deadline.toString(),
            worker: bounty.worker,
            submissionURI: bounty.submissionURI,
            status: Number(bounty.status),
            createdAt: bounty.createdAt.toString(),
            claimedAt: bounty.claimedAt.toString(),
            submittedAt: bounty.submittedAt.toString(),
          };
        });

        // Sort by most recent first
        formattedBounties.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

        setBounties(formattedBounties);
      } catch (error) {
        console.error('Failed to load bounties:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBounties();
  }, [chainId, publicClient]);

  const filteredBounties = filter === 'open'
    ? bounties.filter(b => b.status === BountyStatus.Open)
    : bounties;

  const getStatusBadgeClass = (status: number) => {
    switch (status) {
      case BountyStatus.Open:
        return 'bg-green-900/50 text-green-400 border-green-700';
      case BountyStatus.Claimed:
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
      case BountyStatus.Submitted:
        return 'bg-blue-900/50 text-blue-400 border-blue-700';
      case BountyStatus.Approved:
        return 'bg-purple-900/50 text-purple-400 border-purple-700';
      case BountyStatus.Refunded:
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case BountyStatus.Disputed:
        return 'bg-red-900/50 text-red-400 border-red-700';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            TinyBounty
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/bounties" className="text-white font-medium">
              Browse
            </Link>
            <Link href="/create" className="text-slate-300 hover:text-white transition">
              Post Bounty
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Browse Bounties</h1>
            <p className="text-slate-400">
              Find tasks to work on and earn crypto.
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'open'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Open Only
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Bounties
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 animate-pulse"
              >
                <div className="h-6 bg-slate-800 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-800 rounded w-2/3 mb-6"></div>
                <div className="h-8 bg-slate-800 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredBounties.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {filter === 'open' ? 'No open bounties' : 'No bounties yet'}
            </h2>
            <p className="text-slate-400 mb-8">
              {filter === 'open'
                ? 'All bounties have been claimed. Check back soon!'
                : 'Be the first to post a bounty.'}
            </p>
            <Link
              href="/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Post a Bounty
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBounties.map((bounty) => (
              <Link
                key={bounty.id}
                href={`/bounties/${bounty.id}`}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                      bounty.status
                    )}`}
                  >
                    {STATUS_LABELS[bounty.status]}
                  </span>
                  <span className="text-2xl font-bold text-blue-400">
                    {formatEther(BigInt(bounty.reward))} ETH
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition line-clamp-2">
                  {bounty.title}
                </h3>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {bounty.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    by {bounty.poster.slice(0, 6)}...{bounty.poster.slice(-4)}
                  </span>
                  <span>
                    Deadline: {new Date(Number(bounty.deadline) * 1000).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
