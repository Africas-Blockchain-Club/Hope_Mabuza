# SecureNFT

## What is this project?
SecureNFT is a learning project built to understand how a **smart contract**, a **backend server**, and a **frontend** all work together in a Web3 application.

The idea is simple — users can mint flower NFTs (ROSE and LILY), but they can only access the minting panel if they already own one. The server is the gatekeeper that checks the blockchain before granting access.

---

## What was the goal?
The main goal was not just to build an NFT — it was to learn:

- How to write and deploy a **Solidity smart contract** (ERC1155)
- How a **backend server** (Express) can talk to the blockchain using Ethers.js
- How a **frontend** (React) talks to the server and the contract
- Why you need a server instead of doing everything in the browser
- How **wallet connection** works with MetaMask
- How to protect frontend features behind a **server-side NFT ownership check**

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Smart Contract | Solidity + Hardhat | ERC1155 NFT with max supply |
| Backend | Node.js + Express | Verify NFT ownership via blockchain |
| Frontend | React + Vite | UI for connecting wallet and minting |
| Blockchain Library | Ethers.js | Talk to the contract from both server and frontend |
| Wallet | MetaMask | Sign transactions and provide wallet address |

---

## How it works

1. User connects their MetaMask wallet on the frontend
2. User clicks **Check Access** — the frontend sends the wallet address to the Express server
3. The server queries the smart contract on the blockchain to check if the wallet owns any NFTs
4. If yes → the mint panel is unlocked
5. If no → access is denied
6. Once inside, the user can mint ROSE, LILY, or both

---

## Project Structure

```
SecureNFT/
├── contracts/
│   └── NFT.sol               — ERC1155 smart contract with max supply
├── scripts/
│   ├── deploy.js             — Deploys the contract to the network
│   └── interact.js           — Mints NFTs and checks balances via script
├── frontend/
│   └── src/
│       ├── abi.json          — Contract ABI extracted from Hardhat artifact
│       ├── useContract.js    — Wallet connection hook
│       ├── useNFTGate.js     — Calls the server to check NFT ownership
│       ├── MintPanel.jsx     — Mint Rose, Lily, and Both UI
│       └── App.jsx           — Main page, wires everything together
├── Server.js                 — Express server that verifies NFT ownership
├── hardhat.config.js         — Hardhat network and compiler config
├── .env                      — RPC URL, private key, API keys (never commit this)
├── FRONTEND_EXPLAINED.md     — Beginner guide to the frontend
└── SERVER_EXPLAINED.md       — Beginner guide to the server
```

---

## How to run

**1. Start a local blockchain node:**
```bash
npx hardhat node
```

**2. Deploy the contract:**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

**3. Paste the deployed address into:**
`frontend/src/useContract.js` — line 5

**4. Start the server:**
```bash
node Server.js
```

**5. Start the frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

