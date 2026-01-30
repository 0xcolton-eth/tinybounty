'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TINYBOUNTY_ADDRESS, TINYBOUNTY_ABI } from '@/config/wagmi';
import { formatEther } from 'viem';
import Link from 'next/link';

interface Bounty {
  id: string;
  poster: string;
  title: string;
  description: string;
  reward: string;
  deadline: string;
  worker: string;
  submissionURI: string;
  status: number;
  createdAt: string;
  claimedAt: string;
  submittedAt: string;
}

const STATUS_LABELS = ['Open', 'Claimed', 'Submitted', 'Approved', 'Refunded', 'Disputed'];

export default function BountyDetail() {
  const params = useParams();
  const { address } = useAccount();
  const chainId = useChainId();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    async function loadBounty() {
      try {
        const response = await fetch(`/api/bounties/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setBounty(data);
        }
      } catch (error) {
        console.error('Failed to load bounty:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBounty();
  }, [params.id, isSuccess]);

  const handleClaim = () => {
    writeContract({
      address: TINYBOUNTY_ADDRESS[chainId as keyof typeof TINYBOUNTY_ADDRESS],
      abi: TINYBOUNTY_ABI,
      functionName: 'claimBounty',
      args: [BigInt(params.id as string)],
    });
  };

  const handleSubmit = async () => {
    if (!submissionFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', submissionFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      const { url } = await uploadRes.json();

      writeContract({
        address: TINYBOUNTY_ADDRESS[chainId as keyof typeof TINYBOUNTY_ADDRESS],
        abi: TINYBOUNTY_ABI,
        functionName: 'submitWork',
        args: [BigInt(params.id as string), url],
      });
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit work');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = () => {
    writeContract({
      address: TINYBOUNTY_ADDRESS[chainId as keyof typeof TINYBOUNTY_ADDRESS],
      abi: TINYBOUNTY_ABI,
      functionName: 'approveWork',
      args: [BigInt(params.id as string)],
    });
  };

  const handleRefund = () => {
    writeContract({
      address: TINYBOUNTY_ADDRESS[chainId as keyof typeof TINYBOUNTY_ADDRESS],
      abi: TINYBOUNTY_ABI,
      functionName: 'requestRefund',
      args: [BigInt(params.id as string)],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Bounty not found</div>
      </div>
    );
  }

  const isOpen = bounty.status === 0;
  const isClaimed = bounty.status === 1;
  const isSubmitted = bounty.status === 2;
  const isPoster = address?.toLowerCase() === bounty.poster.toLowerCase();
  const isWorker = address?.toLowerCase() === bounty.worker.toLowerCase();
  const canRefund = isSubmitted && isWorker && Date.now() / 1000 > Number(bounty.submittedAt) + 7200;

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

      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-4">
          <Link href="/bounties" className="text-blue-400 hover:text-blue-300">
            ← Back to all bounties
          </Link>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{bounty.title}</h1>
              <div className="flex items-center gap-4 text-slate-400">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  isOpen ? 'bg-green-900/50 text-green-400' :
                  bounty.status === 3 ? 'bg-blue-900/50 text-blue-400' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {STATUS_LABELS[bounty.status]}
                </span>
                <span>Posted by {bounty.poster.slice(0, 6)}...{bounty.poster.slice(-4)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-400 mb-1">
                {formatEther(BigInt(bounty.reward))} ETH
              </div>
              <div className="text-sm text-slate-500">
                Worker gets {(parseFloat(formatEther(BigInt(bounty.reward))) * 0.975).toFixed(6)} ETH
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
            <p className="text-slate-300 whitespace-pre-wrap">{bounty.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-slate-500 mb-1">Deadline</div>
              <div className="text-white font-semibold">
                {new Date(Number(bounty.deadline) * 1000).toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-slate-500 mb-1">Created</div>
              <div className="text-white font-semibold">
                {new Date(Number(bounty.createdAt) * 1000).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {isOpen && !isPoster && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Ready to work on this?</h3>
            <button
              onClick={handleClaim}
              disabled={isPending || isConfirming}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Claiming...' : 'Claim Bounty'}
            </button>
          </div>
        )}

        {isClaimed && isWorker && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Submit Your Work</h3>
            <input
              type="file"
              onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
              className="w-full mb-4 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
            <button
              onClick={handleSubmit}
              disabled={!submissionFile || uploading || isPending || isConfirming}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : isPending || isConfirming ? 'Submitting...' : 'Submit Work'}
            </button>
          </div>
        )}

        {isSubmitted && isPoster && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Review Submission</h3>
            {bounty.submissionURI && (
              <div className="mb-4">
                <a
                  href={bounty.submissionURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View submitted work →
                </a>
              </div>
            )}
            <button
              onClick={handleApprove}
              disabled={isPending || isConfirming}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Approving...' : 'Approve & Pay Worker'}
            </button>
          </div>
        )}

        {canRefund && (
          <div className="bg-amber-950/50 border border-amber-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-amber-400 mb-2">Auto-Refund Available</h3>
            <p className="text-slate-400 mb-4">
              The poster hasn&apos;t responded for over 2 hours. You can claim a full refund.
            </p>
            <button
              onClick={handleRefund}
              disabled={isPending || isConfirming}
              className="w-full px-6 py-4 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Processing...' : 'Request Refund'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}