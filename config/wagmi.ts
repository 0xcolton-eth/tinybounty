import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

// Re-export contract config for convenience (client-side only)
export {
  TINYBOUNTY_ADDRESS,
  TINYBOUNTY_ABI,
  BountyStatus,
  STATUS_LABELS,
  type Bounty,
  type UserStats,
} from './contracts';

// Wagmi config for RainbowKit
export const wagmiConfig = getDefaultConfig({
  appName: 'TinyBounty',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [base, baseSepolia],
  ssr: true,
});
