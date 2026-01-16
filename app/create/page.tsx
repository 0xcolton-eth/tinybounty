'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TINYBOUNTY_ADDRESS, TINYBOUNTY_ABI } from '@/config/wagmi';
import { parseEther } from 'viem';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateBounty() {
  const router = useRouter();
  const chainId = useChainId();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [hours, setHours] = useState('2');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const deadline = Math.floor(Date.now() / 1000) + (parseInt(hours) * 3600);
    
    writeContract({
      address: TINYBOUNTY_ADDRESS[chainId as keyof typeof TINYBOUNTY_ADDRESS],
      abi: TINYBOUNTY_ABI,
      functionName: 'createBounty',
      args: [title, description, BigInt(deadline)],
      value: parseEther(reward),
    });
  };

  if (isSuccess) {
    setTimeout(() => router.push('/bounties'), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            TinyBounty
          </Link>
          <ConnectButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Post a Bounty</h1>
          <p className="text-slate-400">
            Describe your task, set a reward, and get it done fast.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Design a logo for my app"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Modern, minimal design. Blue and white palette. SVG format preferred."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Reward (ETH)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                max="1"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="0.005"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
              <p className="text-sm text-slate-500 mt-1">
                Min: 0.0001 ETH • Max: 1 ETH
              </p>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Deadline (hours)
              </label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="8">8 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-2">Summary</h3>
            <div className="space-y-1 text-sm text-slate-400">
              <p>Reward: {reward || '0'} ETH</p>
              <p>Platform Fee (2.5%): {reward ? (parseFloat(reward) * 0.025).toFixed(6) : '0'} ETH</p>
              <p>Worker Receives: {reward ? (parseFloat(reward) * 0.975).toFixed(6) : '0'} ETH</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || isConfirming}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming ? 'Posting Bounty...' : isSuccess ? '✓ Bounty Posted!' : 'Post Bounty'}
          </button>

          {isSuccess && (
            <p className="text-center text-green-400 mt-4">
              Bounty created! Redirecting to browse page...
            </p>
          )}
        </form>

        <div className="mt-8 bg-blue-950/50 border border-blue-900 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-2">How it works</h3>
          <ol className="space-y-2 text-sm text-slate-400">
            <li>1. Your ETH is locked in the smart contract (escrow)</li>
            <li>2. A worker claims and completes your task</li>
            <li>3. You approve their work → they get paid instantly</li>
            <li>4. If you don&apos;t respond in 2 hours → auto-refund to worker</li>
          </ol>
        </div>
      </main>
    </div>
  );
}