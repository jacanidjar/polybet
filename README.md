# 🎯 Polybet

**A decentralized prediction market platform** - Trade on the outcomes of real-world events.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![Hardhat](https://img.shields.io/badge/Hardhat-Ethereum-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Quick Start

```bash
# Start everything (Blockchain + Backend + Frontend)
polybet.bat
```

That's it! The script will:
1. Start local blockchain (Hardhat)
2. Deploy smart contracts
3. Start Backend API (http://localhost:3001)
4. Start Frontend (http://localhost:3000)

## 📁 Project Structure

```
polybet/
├── apps/
│   ├── api/           # NestJS Backend (REST API + SQLite)
│   └── web/           # Next.js Frontend (React + Tailwind)
├── packages/
│   └── contracts/     # Solidity Smart Contracts (Hardhat)
└── polybet.bat        # One-click startup script
```

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| Backend | NestJS, Prisma ORM, SQLite |
| Blockchain | Hardhat, Solidity, Wagmi, Viem |
| Auth | Privy (Wallet + Email login) |

## 🔧 Manual Setup

If you need to run components individually:

```bash
# 1. Blockchain (Terminal 1)
cd packages/contracts
npm install
npx hardhat node

# 2. Deploy Contracts (Terminal 2)
cd packages/contracts
npx hardhat run scripts/deploy.js --network localhost

# 3. Backend (Terminal 3)
cd apps/api
npm install
npm run start:dev

# 4. Frontend (Terminal 4)
cd apps/web
npm install
npm run dev
```

## 🧪 Testing the App

1. Open http://localhost:3000
2. Connect wallet (MetaMask → Localhost 8545)
3. Click **Gas** button → Get free test ETH
4. Click **Get $1,000** → Get test USDC
5. Select a market and trade!

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `polybet.bat` | Start all services |
| `full_reset.bat` | Nuclear reset (clean everything) |
| `clean_and_push.bat` | Git workflow helper |

## 🌐 Endpoints

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Blockchain RPC | http://localhost:8545 |

## 📝 License

MIT
