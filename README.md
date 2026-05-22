# Hope Mabuza — Web3 Portfolio

A collection of 6 full-stack Ethereum dApps built as hands-on learning projects. Each project covers a distinct blockchain concept, from basic smart contracts to dynamic NFTs, staking systems, and verifiable on-chain randomness.

---

## Projects

| Project | Concept | Stack |
|---------|---------|-------|
| [SecureNFT](#1-securenft--the-enchanted-garden) | Server-gated NFT access control | ERC1155, Express, React |
| [VendingMachine](#2-vendingmachine-dapp) | Payable contract basics | Solidity, Next.js |
| [Lottery System](#3-lottery-system) | Chainlink VRF + Automation | ERC20, Chainlink, Next.js |
| [DynamicNFT](#4-dynamicnft--galaxy-club) | On-chain metadata evolution | ERC721, IPFS/Pinata, React |
| [NFT Staking](#5-nft-staking-dapp) | Multi-contract staking + rewards | ERC721 + ERC20, React |
| [Voting](#6-voting) | On-chain ballot | Solidity, Hardhat |

All contracts are deployed to the **Sepolia testnet**.

---

## Tech Stack

- **Smart Contracts:** Solidity 0.8.x, OpenZeppelin, Chainlink VRF V2+
- **Contract Dev:** Hardhat, Chai (testing), ethers.js v6
- **Frontend:** React 18 + Vite, Next.js
- **Wallet:** MetaMask
- **Storage:** IPFS via Pinata
- **Upgradability:** UUPS proxy pattern

---

## Projects

### 1. SecureNFT — "The Enchanted Garden"

An ERC1155 dApp with two token types: a **Rose** (access key) and a **Lily** (reward NFT). Only Rose holders can enter the garden and mint Lilies. Access is enforced at the server level — the Express backend queries the blockchain before the React frontend loads protected routes.

**Key concepts:** Server-gated authentication, ERC1155 multi-tokens, UUPS upgradeable contracts, CORS, soulbound tokens

**Contract:** `0x564A2d245F04b1dBA5B65FCe48920368B4f3C51B` (Sepolia)

**Run locally:**
```bash
# Backend
npm install
node Server.js          # port 3000

# Frontend
cd frontend && npm install && npm run dev   # port 5173
```

---

### 2. VendingMachine dApp

A payable smart contract that simulates a vending machine. Users purchase coke units (0.00001 ETH each) through a Next.js frontend. Covers the fundamentals of dApp interaction: ABIs, MetaMask signing, and Wei/ETH conversion.

**Key concepts:** Payable functions, ABI structure, ethers.js contract objects

**Contract:** `0xB266590c076742C52D790786D16aAED5F1665685` (Sepolia)

**Run locally:**
```bash
cd frontend && npm install && npm run dev   # port 3000
```

---

### 3. Lottery System

A multi-contract upgradeable lottery where players pick 7 numbers. Winning numbers are generated via **Chainlink VRF** (verifiable randomness) and results are triggered by **Chainlink Automation**. Three progressive contract versions (Lottery1 → Lottery3) show the evolution of the design.

**Key concepts:** Chainlink VRF V2+, Chainlink Automation, UUPS upgrades, round-based state, BPS fee collection

**Run locally:**
```bash
# Deploy
npx hardhat run scripts/deploy.js --network sepolia

# Frontend
cd frontend && npm install && npm run dev   # port 3000
```

---

### 4. DynamicNFT — "Galaxy Club"

An ERC721 NFT whose metadata and image change dynamically based on exploration activity. Clicking "Explore" increments an on-chain counter; once the counter crosses a threshold, the NFT URI updates to reveal a new galaxy name. Metadata and images live on **IPFS via Pinata**.

**Key concepts:** Dynamic NFT metadata, IPFS integration, UUPS upgrades, ethers.js auto-reconnect, iterating `ownerOf` to find token IDs

**Run locally:**
```bash
# Deploy
npx hardhat run scripts/deploy.js --network sepolia

# Frontend
cd DynamicNFT/frontend && npm install && npm run dev   # port 5173
```

---

### 5. NFT Staking dApp

A three-contract system: an **ERC721 NFT**, an **ERC20 reward token (WTC)**, and a **Staking contract**. Users mint NFTs, stake them to earn WTC at 0.00694 tokens/minute/NFT, and claim or withdraw after a 2-minute cooldown. Includes a full Hardhat/Chai test suite and emergency withdraw option.

**Key concepts:** Multi-contract coordination, time-based reward math, ReentrancyGuard, Pausable, comprehensive testing

**Deployed contracts (Sepolia):**
- NFT: `0x7dF1b504900D18549bB91Ba7c6406E67D9117f87`
- WTC Token: `0xD4E879B4BE8dee26f33032585726cbD097251d9A`
- Staking: `0xfE0A4F557212d38335bCD17ce4a03facb2aAe1D9`

**Run locally:**
```bash
# Test
npx hardhat test test/NFT_staking.test.js

# Deploy
npx hardhat run scripts/deploy.js --network sepolia

# Frontend
cd staking-dapp/frontend && npm install && npm run dev   # port 5173
```

---

### 6. Voting

A minimal on-chain voting contract supporting two options. Enforces one vote per address, excludes the owner, emits events, and exposes a winner-determination function. Verified on Etherscan.

**Key concepts:** Mapping-based access control, event emission, vote validation, Etherscan verification

**Contract:** `0x6f2490c4a22fB7532060A94fa4c8a85131b065a8` (Sepolia)

**Run locally:**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## Environment Setup

Each project reads secrets from a `.env` file in its root. The general pattern:

```env
SEPOLIA_RPC_URL=<your Alchemy or Infura endpoint>
DEPLOYER_PRIVATE_KEY=<wallet private key — never commit this>
ETHERSCAN_API_KEY=<for contract verification>
```

Frontend projects also need a `.env` in their `frontend/` folder:

```env
VITE_CONTRACT_ADDRESS=<deployed contract address>
VITE_RPC_URL=<sepolia endpoint>
```

> Never commit `.env` files. They are in `.gitignore`.

---

## Skills Demonstrated

- ERC20, ERC721, ERC1155 token standards
- UUPS upgradeable smart contracts
- Chainlink VRF and Automation integration
- NFT metadata on IPFS (Pinata)
- Server-gated frontend access (security pattern)
- Time-based reward calculations
- Multi-contract deployment and coordination
- Hardhat testing with Chai
- ethers.js v6 wallet and contract interaction
- React + Vite and Next.js frontends
- MetaMask wallet connection and signing
