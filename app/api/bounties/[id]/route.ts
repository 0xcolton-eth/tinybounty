import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { TINYBOUNTY_ADDRESS, TINYBOUNTY_ABI } from '@/config/wagmi';

const publicClient = createPublicClient({
  chain: process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? base : baseSepolia,
  transport: http(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bountyId = BigInt(params.id);
    const chainId = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? base.id : baseSepolia.id;

    const bounty = await publicClient.readContract({
      address: TINYBOUNTY_ADDRESS[chainId as keyof typeof TINYBOUNTY_ADDRESS],
      abi: TINYBOUNTY_ABI,
      functionName: 'getBounty',
      args: [bountyId],
    });

    return NextResponse.json({
      id: bounty[0].toString(),
      poster: bounty[1],
      title: bounty[2],
      description: bounty[3],
      reward: bounty[4].toString(),
      deadline: bounty[5].toString(),
      worker: bounty[6],
      submissionURI: bounty[7],
      status: Number(bounty[8]),
      createdAt: bounty[9].toString(),
      claimedAt: bounty[10].toString(),
      submittedAt: bounty[11].toString(),
    });
  } catch (error) {
    console.error('Error fetching bounty:', error);
    return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
  }
}