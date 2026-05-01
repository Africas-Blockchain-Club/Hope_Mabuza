# 🌹 SecureNFT — The Enchanted Garden

A full-stack Web3 learning project that combines a Solidity smart contract, a Node.js backend server, and a React frontend into a complete NFT-gated DApp.

---

## What is this project?

SecureNFT is an NFT collection called **My Flowers** — a garden of Rose and Lily NFTs deployed on the Sepolia testnet. The Rose is exclusive (one per wallet) and acts as an access key. Only Rose holders can enter the garden and mint Lilies.

The project was built to learn three specific things in depth:

- **How to build a server-gated frontend** — using an Express server to verify NFT ownership on-chain before granting access to the UI
- **How to create and structure NFT metadata** — writing JSON metadata files and linking them to token IDs so NFT marketplaces can read name, description, and image
- **How to design a Web3 frontend** — building a mystical, animated DApp UI with React, inline SVG, canvas particles, and custom CSS design tokens

---

## What was learned

| Topic | What was practiced |
|---|---|
| Solidity ERC1155 | Writing an upgradeable multi-token contract with max supply, soulbound transfers, and payable mint functions |
| NFT Metadata | Structuring JSON metadata files with name, description, image, and attributes linked to token IDs |
| Hardhat | Compiling, deploying, and interacting with contracts via scripts |
| OpenZeppelin Upgrades | Using UUPS proxy pattern via `.openzeppelin/sepolia.json` |
| Express + Ethers.js (server) | Querying the blockchain from a backend to verify ownership without trusting the browser |
| Server-gated access | Why frontend checks alone are insecure, and how to enforce access with a server |
| CORS | Allowing the frontend (port 5173) to communicate with the backend (port 3000) |
| React + Vite | Component-based frontend with hooks, props, and conditional rendering |
| Ethers.js (frontend) | Connecting MetaMask, reading contract state, and sending transactions |
| CSS design system | CSS variables, glassmorphism, neon glows, keyframe animations |
| Canvas API | Drawing 120 animated sparkle particles with requestAnimationFrame |
| SVG illustration | Building a garden scene with layered SVG elements, radial gradients, and blur filters |

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Smart Contract | Solidity + Hardhat | ERC1155 NFT with UUPS upgradeable proxy |
| Backend | Node.js + Express | Verify Rose NFT ownership via blockchain query |
| Frontend | React + Vite | Animated DApp UI with wallet connection and minting |
| Blockchain Library | Ethers.js v6 | Used in both frontend and server to talk to the contract |
| Wallet | MetaMask | Signs transactions and provides wallet address |
| Network | Sepolia testnet | Where the contract is deployed |

---

## How the Access Gate Works

```
User lands on GatePage
        ↓
Connect MetaMask wallet
        ↓
Click "Check Access"
        ↓
Frontend sends wallet address → Express server (port 3000)
        ↓
Server calls balanceOf(wallet, 0) directly on the blockchain
        ↓
Rose balance > 0  →  "Access Granted" → HomePage shown
Rose balance = 0  →  "No NFT found"  → Gate stays locked
```

The server is the gatekeeper. Frontend checks can be bypassed in DevTools — the server cannot be fooled because it reads directly from the blockchain.

---

## Project Structure

```
SecureNFT/
│
├── contracts/
│   └── NFT.sol                  — ERC1155 contract: ROSE + LILY tokens, max supply,
│                                  soulbound transfers, payable minting, UUPS upgradeable
│
├── scripts/
│   ├── deploy.js                — Deploys the proxy contract to Sepolia
│   ├── interact.js              — Mints tokens and checks balances via script
│   └── new.js                   — Additional interaction script
│
├── metadata/
│   ├── images/
│   │   ├── 0.png                — Image for ROSE (token ID 0)
│   │   └── 1.png                — Image for LILY (token ID 1)
│   └── jsons/
│       ├── 0.json               — Metadata for ROSE: name, description, image, attributes
│       └── 1.json               — Metadata for LILY: name, description, image, attributes
│
├── frontend/
│   └── src/
│       ├── abi/
│       │   └── MyContract.json  — ABI array extracted from Hardhat artifact
│       ├── hooks/
│       │   ├── useContract.js   — Blockchain hook: provider, signer, contract instance
│       │   └── useAccess.js     — Server hook: calls /verify-nft, holds authorized state
│       ├── components/
│       │   ├── WalletConnect.jsx   — Connect button and address display
│       │   ├── ContractReader.jsx  — Reads and displays Lily balance from contract
│       │   ├── ContractWriter.jsx  — Lily mint buttons with ETH pricing
│       │   └── ParticleField.jsx   — Canvas animation: 120 floating sparkle particles
│       ├── pages/
│       │   ├── GatePage.jsx     — Access gate: connect wallet + check Rose ownership
│       │   └── HomePage.jsx     — Garden page: SVG scene, animations, mint controls
│       ├── App.jsx              — Root: calls hooks once, renders gate or garden
│       ├── index.css            — Global styles, CSS variables, neon buttons, cards
│       └── main.jsx             — React entry point
│
├── Server.js                    — Express server: queries blockchain, returns authorized/denied
├── hardhat.config.js            — Hardhat config: Sepolia network, compiler settings
├── .env                         — RPC URL, private key, Etherscan API key (never commit)
├── .openzeppelin/
│   └── sepolia.json             — OpenZeppelin upgrade manifest for proxy tracking
└── Journal/
    ├── FRONTEND_EXPLAINED.md    — Step-by-step frontend guide with code and explanations
    ├── SERVER_EXPLAINED.md      — Step-by-step server guide with code and explanations
    └── USEFUL_INFO.md           — Notes, references, and things learned along the way
```

---

## NFT Metadata

Each token has a metadata JSON file that tells marketplaces what the NFT is:

```json
// metadata/jsons/0.json — The Crimson Rose
{
  "name": "The Crimson Rose",
  "description": "A soulbound rose of eternal flame. Only one may bloom per wallet.",
  "image": "<your-ipfs-or-server-url>/images/0.png",
  "attributes": [
    { "trait_type": "Type", "value": "Rose" },
    { "trait_type": "Rarity", "value": "Exclusive" }
  ]
}
```

Token IDs map to metadata: `tokenURI(0)` returns Rose metadata, `tokenURI(1)` returns Lily metadata.

---

## How to Run

**1. Install dependencies (root — for Hardhat):**
```bash
npm install
```

**2. Install frontend dependencies:**
```bash
cd frontend
npm install
cd ..
```

**3. Set up your `.env` file in the project root:**
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

**4. Set up your `frontend/.env` file:**
```
VITE_CONTRACT_ADDRESS=0x564A2d245F04b1dBA5B65FCe48920368B4f3C51B
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

**5. Start the server (Terminal 1):**
```bash
node Server.js
# → Server running on http://localhost:3000
```

**6. Start the frontend (Terminal 2):**
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

**7. Open `http://localhost:5173` in your browser with MetaMask installed.**

---

## User Flow

1. Land on the **Gate Page** — dark card with glowing rose emblem
2. Click **Connect Wallet** — MetaMask opens
3. Click **Check Access** — server queries the blockchain
4. **If you own a Rose:** Access granted, the full Enchanted Garden appears
5. **If you don't:** "No NFT found" — gate stays locked
6. Inside the garden: choose how many Lilies to mint and send the transaction
7. Your Lily balance updates in the navbar after each mint

---

## Contract Details

- **Network:** Sepolia testnet
- **Contract Address:** `0x564A2d245F04b1dBA5B65FCe48920368B4f3C51B`
- **Token IDs:** `0` = ROSE, `1` = LILY
- **ROSE price:** 0.01 ETH — max 100 supply, 1 per wallet, soulbound
- **LILY price:** 0.005 ETH each — max 10,000 supply, unlimited per wallet
- **Standard:** ERC1155 (multi-token)
- **Upgradeable:** Yes, UUPS proxy pattern via OpenZeppelin

---

## Key Design Decisions

**Why a server instead of just checking in the frontend?**
Frontend code runs in the browser and can be modified by anyone using DevTools. A user could set a JavaScript variable to `true` and bypass any frontend check. The server calls the blockchain directly and cannot be tricked.

**Why ERC1155 instead of ERC721?**
ERC1155 supports multiple token types in a single contract. One contract handles both ROSE (ID 0) and LILY (ID 1) instead of deploying two separate contracts.

**Why UUPS upgradeable?**
The contract can be improved after deployment without losing the token balances or the contract address. The proxy stores the state; the implementation can be replaced.

**Why extract only the ABI array from Hardhat artifacts?**
Hardhat's full artifact JSON contains bytecode, deployment metadata, and other fields Ethers.js does not need. Ethers.js only accepts a plain array — passing the full artifact causes an "abi is not iterable" error.