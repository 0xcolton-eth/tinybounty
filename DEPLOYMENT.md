# TinyBounty Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- Foundry (for smart contract deployment)
- Vercel account
- WalletConnect Project ID
- Base wallet with ETH for deployment

## Step 1: Clone and Install

```bash
git clone <your-repo>
cd tinybounty
npm install
```

## Step 2: Deploy Smart Contract

### Install Foundry (if not installed)
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Create Foundry Project
```bash
mkdir contracts
cd contracts
forge init
```

### Copy Contract
Copy `TinyBounty.sol` into `contracts/src/TinyBounty.sol`

### Deploy to Base Sepolia (Testnet)
```bash
forge create --rpc-url https://sepolia.base.org \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args YOUR_TREASURY_ADDRESS \
  src/TinyBounty.sol:TinyBounty \
  --verify
```

### Deploy to Base Mainnet
```bash
forge create --rpc-url https://mainnet.base.org \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args YOUR_TREASURY_ADDRESS \
  src/TinyBounty.sol:TinyBounty \
  --verify
```

**Save the deployed contract addresses!**

## Step 3: Configure Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_NETWORK=testnet  # or mainnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Update `config/wagmi.ts` with your deployed contract addresses:
```typescript
export const TINYBOUNTY_ADDRESS = {
  [base.id]: '0xYOUR_MAINNET_ADDRESS',
  [baseSepolia.id]: '0xYOUR_TESTNET_ADDRESS',
} as const;
```

## Step 4: Get WalletConnect Project ID

1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy the Project ID
4. Add to `.env.local`

## Step 5: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 and:
1. Connect wallet
2. Post a test bounty
3. Claim it with a different wallet
4. Submit work and approve

## Step 6: Deploy to Vercel

### Connect Repository
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Add Environment Variables in Vercel Dashboard

1. Go to your project settings
2. Add environment variables:
   - `NEXT_PUBLIC_NETWORK`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `BLOB_READ_WRITE_TOKEN` (auto-configured by Vercel)

### Enable Vercel Blob

1. Go to Storage tab in Vercel dashboard
2. Create a new Blob store
3. Connect to your project

## Step 7: Verify Everything Works

1. Visit your production URL
2. Connect wallet (switch to Base network)
3. Post a bounty
4. Claim, submit, and approve to test full flow
5. Check auto-refund by waiting 2+ hours after submission

## Troubleshooting

### "Contract not found" error
- Verify contract is deployed to correct network
- Check `NEXT_PUBLIC_NETWORK` matches your deployment
- Confirm contract addresses in `config/wagmi.ts`

### Upload fails
- Ensure Blob storage is enabled in Vercel
- Check file size is under 50MB
- Verify `BLOB_READ_WRITE_TOKEN` is set

### Transactions fail
- Check wallet has sufficient ETH for gas
- Verify you're on the correct network (Base)
- Check browser console for specific error

## Production Checklist

- [ ] Contract deployed to Base mainnet
- [ ] Contract verified on BaseScan
- [ ] Treasury address is secure multisig
- [ ] Environment variables set in Vercel
- [ ] Blob storage enabled
- [ ] Test full bounty lifecycle
- [ ] Monitor gas costs and adjust limits if needed
- [ ] Set up error monitoring (Sentry recommended)

## Security Notes

- Never commit private keys or `.env.local`
- Use hardware wallet for treasury operations
- Monitor contract for unusual activity
- Consider auditing contract before mainnet launch
- Implement rate limiting on API routes for production

## Maintenance

### Withdraw Platform Fees
```bash
# Call withdrawFees() from treasury address
cast send YOUR_CONTRACT_ADDRESS "withdrawFees()" \
  --private-key TREASURY_PRIVATE_KEY \
  --rpc-url https://mainnet.base.org
```

### Update Treasury Address
```bash
cast send YOUR_CONTRACT_ADDRESS "updateTreasury(address)" NEW_TREASURY \
  --private-key TREASURY_PRIVATE_KEY \
  --rpc-url https://mainnet.base.org
```

## Support

- Base Discord: https://base.org/discord
- Vercel Support: support@vercel.com
- File issues: [GitHub Issues]