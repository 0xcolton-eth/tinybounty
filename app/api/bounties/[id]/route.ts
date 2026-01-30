import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { TINYBOUNTY_ADDRESS, TINYBOUNTY_ABI } from '@/config/contracts';

const publicClient = createPublicClient({
  chain: process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? base : baseSepolia,
  transport: http(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bountyId = BigInt(id);
    const chainId = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? base.id : baseSepolia.id;

    const bounty = await publicClient.readContract({
      address: TINYBOUNTY_ADDRESS[chainId as keyof typeof TINYBOUNTY_ADDRESS],
      abi: TINYBOUNTY_ABI,
      functionName: 'getBounty',
      args: [bountyId],
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error fetching bounty:', error);
    return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
  }
}