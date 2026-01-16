# TinyBounty Quick Start 🚀

Get TinyBounty running in **under 10 minutes**.

## Step 1: Install (1 min)

```bash
npm install
```

## Step 2: Get WalletConnect Project ID (2 min)

1. Visit https://cloud.walletconnect.com
2. Sign up / Log in
3. Click "Create New Project"
4. Name it "TinyBounty"
5. Copy the **Project ID**

## Step 3: Set Environment Variables (1 min)

Create `.env.local`:
```bash
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=paste_your_project_id_here
```

## Step 4: Deploy Contract (3 min)

### Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Deploy to Base Sepolia
```bash
# Replace YOUR_PRIVATE_KEY and YOUR_WALLET_ADDRESS
forge create --rpc-url https://sepolia.base.org \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args YOUR_WALLET_ADDRESS \
  contracts/TinyBounty.sol:TinyBounty
```

**Copy the deployed contract address!**

## Step 5: Update Contract Address (1 min)

Edit `config/wagmi.ts`:
```typescript
export const TINYBOUNTY_ADDRESS = {
  [base.id]: '0x0000000000000000000000000000000000000000',
  [baseSepolia.id]: '0xYOUR_DEPLOYED_ADDRESS_HERE', // Paste here
} as const;
```

## Step 6: Run (1 min)

```bash
npm run dev
```

Visit http://localhost:3000 🎉

## Test the Full Flow

### Get Testnet ETH
1. Visit https://www.coinbase.com/faucet
2. Get Base Sepolia testnet ETH

### Post a Bounty
1. Connect wallet (make sure you're on Base Sepolia)
2. Click "Post a Bounty"
3. Fill in:
   - Title: "Design a simple logo"
   - Description: "Modern, minimalist style"
   - Reward: 0.001 ETH
   - Deadline: 2 hours
4. Click "Post Bounty" and confirm transaction

### Claim & Complete (Use Different Wallet)
1. Switch to a different wallet
2. Browse bounties and click on yours
3. Click "Claim Bounty"
4. Create a simple image file
5. Click "Submit Work" and upload it
6. Switch back to original wallet
7. Click "Approve & Pay Worker"

Done! You've completed a full bounty lifecycle.

## Deploy to Production

When ready to go live:

### 1. Deploy Contract to Base Mainnet
```bash
forge create --rpc-url https://mainnet.base.org \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args YOUR_TREASURY_ADDRESS \
  contracts/TinyBounty.sol:TinyBounty
```

### 2. Update Environment
```bash
NEXT_PUBLIC_NETWORK=mainnet
```

### 3. Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

Add these in Vercel dashboard:
- `NEXT_PUBLIC_NETWORK=mainnet`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id`

Enable Vercel Blob storage in the Storage tab.

## Troubleshooting

**"Transaction failed"**
- Make sure you have testnet ETH
- Check you're on Base Sepolia network
- Try increasing gas limit

**"Contract not found"**
- Verify contract address is correct in `config/wagmi.ts`
- Check `NEXT_PUBLIC_NETWORK` matches your deployment

**"Upload failed"**
- File must be under 50MB
- For local dev, Vercel Blob won't work (deploy to Vercel first)

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Check [README.md](./README.md) for architecture details
- Join the community and share what you build!

---

**Need help?** Open an issue or reach out on Discord.