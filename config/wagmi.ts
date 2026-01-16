import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

// Contract addresses per chain
export const TINYBOUNTY_ADDRESS = {
  [base.id]: '0x0000000000000000000000000000000000000000' as const, // TODO: Replace after mainnet deploy
  [baseSepolia.id]: '0x0000000000000000000000000000000000000000' as const, // TODO: Replace after testnet deploy
} as const;

// Contract ABI - Generated from TinyBounty.sol
export const TINYBOUNTY_ABI = [
  // Read Functions
  {
    type: 'function',
    name: 'getBounty',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'poster', type: 'address' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'reward', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'worker', type: 'address' },
          { name: 'submissionURI', type: 'string' },
          { name: 'status', type: 'uint8' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'claimedAt', type: 'uint256' },
          { name: 'submittedAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserStats',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'bountiesPosted', type: 'uint256' },
          { name: 'bountiesCompleted', type: 'uint256' },
          { name: 'totalEarned', type: 'uint256' },
          { name: 'totalSpent', type: 'uint256' },
          { name: 'ghostCount', type: 'uint256' },
          { name: 'approvalCount', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'canRefund',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'calculatePayout',
    inputs: [{ name: 'reward', type: 'uint256' }],
    outputs: [
      { name: 'payout', type: 'uint256' },
      { name: 'fee', type: 'uint256' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'nextBountyId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'activeClaimCount',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'treasury',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalFeesCollected',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'PLATFORM_FEE_BPS',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'APPROVAL_WINDOW',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MIN_BOUNTY',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MAX_BOUNTY',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  // Write Functions
  {
    type: 'function',
    name: 'createBounty',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'claimBounty',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'submitWork',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'submissionURI', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveWork',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requestRefund',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'disputeBounty',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelBounty',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Events
  {
    type: 'event',
    name: 'BountyCreated',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'poster', type: 'address', indexed: true },
      { name: 'reward', type: 'uint256', indexed: false },
      { name: 'deadline', type: 'uint256', indexed: false },
      { name: 'title', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'BountyClaimed',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
      { name: 'claimedAt', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'WorkSubmitted',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
      { name: 'submissionURI', type: 'string', indexed: false },
      { name: 'submittedAt', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'WorkApproved',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'poster', type: 'address', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
      { name: 'payout', type: 'uint256', indexed: false },
      { name: 'fee', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'BountyRefunded',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'BountyDisputed',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'initiator', type: 'address', indexed: true },
    ],
  },
] as const;

// Wagmi config for RainbowKit
export const wagmiConfig = getDefaultConfig({
  appName: 'TinyBounty',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [base, baseSepolia],
  ssr: true,
});

// Types
export interface Bounty {
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

export interface UserStats {
  bountiesPosted: bigint;
  bountiesCompleted: bigint;
  totalEarned: bigint;
  totalSpent: bigint;
  ghostCount: bigint;
  approvalCount: bigint;
}

export const BountyStatus = {
  Open: 0,
  Claimed: 1,
  Submitted: 2,
  Approved: 3,
  Refunded: 4,
  Disputed: 5,
} as const;

export const STATUS_LABELS = ['Open', 'Claimed', 'Submitted', 'Approved', 'Refunded', 'Disputed'] as const;
