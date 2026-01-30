# TinyBounty 

**Micro-task marketplace on Base. Post tasks, get work done fast, pay in crypto.**

Built with Next.js 14, wagmi, RainbowKit, and deployed on Vercel.

## Features

- **Instant Escrow**: Funds locked in smart contract until work is approved
- **Auto-Refund**: Workers get paid if posters don't respond within 2 hours
- **On-Chain Reputation**: Track completion rates, earnings, and reliability
- **Fast & Cheap**: Built on Base for low fees and quick transactions
- **Mobile-First**: Works seamlessly with Coinbase Smart Wallet

## How It Works

### For Posters (Task Creators)
1. Connect your wallet
2. Create a bounty (min 0.0001 ETH, max 1 ETH)
3. Set a deadline (1 hour - 7 days)
4. Funds are escrowed in the smart contract
5. Approve submitted work to release payment

### For Workers
1. Browse open bounties
2. Claim a task you can complete
3. Upload your completed work
4. Get paid instantly when approved
5. Auto-refund if poster doesn't respond in 2 hours

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- React 18
- TailwindCSS
- wagmi + viem
- RainbowKit

**Smart Contracts**
- Solidity 0.8.20
- Foundry
- Base (L2)

**Infrastructure**
- Vercel (hosting)
- Vercel Blob (file storage)
- Vercel KV (metadata cache)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
- Get WalletConnect Project ID from https://cloud.walletconnect.com
- Add your deployed contract addresses

### 3. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

### Quick Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

Don't forget to:
- Deploy the smart contract first
- Enable Vercel Blob storage
- Add environment variables in Vercel dashboard

## Smart Contract

### Key Functions
- `createBounty()` - Post a new task with escrowed ETH
- `claimBounty()` - Claim a task to work on
- `submitWork()` - Upload completed work
- `approveWork()` - Approve and release payment
- `requestRefund()` - Claim auto-refund if poster ghosts

### Safety Features
- Workers can only claim 3 bounties at once (prevents squatting)
- 2-hour approval window for auto-refunds
- 2.5% platform fee on successful completions
- All funds escrowed on-chain

## Project Structure

```
tinybounty/
├── app/
│   ├── page.tsx              # Landing page
│   ├── create/page.tsx       # Post bounty form
│   ├── bounties/
│   │   ├── page.tsx          # Browse all bounties
│   │   └── [id]/page.tsx     # Bounty detail page
│   ├── dashboard/page.tsx    # Your bounties
│   ├── api/
│   │   ├── bounties/[id]/    # Fetch bounty data
│   │   └── upload/           # File upload handler
│   └── layout.tsx
├── config/
│   └── wagmi.ts              # Wallet + contract config
├── contracts/
│   └── TinyBounty.sol        # Main contract
└── public/
```

## Development Roadmap

### v1.0 (Current)
- [x] Core bounty creation/claiming
- [x] File uploads (Vercel Blob)
- [x] Auto-refund mechanism
- [x] Basic reputation tracking

### v1.1 (Next)
- [ ] User profiles with detailed stats
- [ ] Search and filter bounties
- [ ] Categories/tags
- [ ] Real-time notifications

### v1.2 (Future)
- [ ] Dispute resolution system
- [ ] Recurring bounties
- [ ] Bounty templates
- [ ] Mobile app (React Native)

## Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Submit a PR with clear description

## Security

- Contract is upgradeable via treasury-controlled functions
- Consider professional audit before mainnet launch
- Report security issues to: security@tinybounty.xyz

## License

MIT

## Links

- **Live App**: [tinybounty.vercel.app](https://tinybounty.vercel.app)
- **Base Explorer**: [basescan.org](https://basescan.org)
- **Discord**: [Join our community](#)
- **Twitter**: [@tinybounty](#)

---

Built with ❤️ on Base
