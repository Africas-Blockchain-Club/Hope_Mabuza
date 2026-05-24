# GalaxyStake

**Live at → [galaxystake.netlify.app](https://galaxystake.netlify.app)**

A full-stack NFT staking protocol on Ethereum. Mint a Member NFT, stake it to earn GLXY reward tokens every minute, and exchange 100 GLXY for a rare Galaxy NFT — earned, not bought.

---

## How it works

| Step | Action | Details |
|------|--------|---------|
| 1 | **Mint** | Get a Galaxy Member NFT for 0.0001 ETH. Supply is limited to 14. |
| 2 | **Stake** | Lock your NFT into the vault. Earns ~1 GLXY per NFT per minute. A 5-minute cooldown applies before unstaking. |
| 3 | **Unstake** | Withdraw your NFT after the cooldown. GLXY rewards are claimed automatically in the same transaction. |
| 4 | **Exchange** | Accumulate 100 GLXY in your wallet and exchange them for a Galaxy NFT — a rare collectible. |

---

## Smart Contracts

All contracts are UUPS upgradeable proxies deployed on **Sepolia testnet**.

| Contract | Address |
|----------|---------|
| RewardToken (GLXY) | `0x0E2A110BFff2625DCD0a45566EcceD8bCE4DcCA2` |
| NFT | `0x0e420C7188f21fD4CfA377fF608aFb0B8980aa35` |
| Staking | `0x0d8fece45503FDCeC7387A87fcE5de15447758bb` |

### Contracts overview

**`NFT.sol`** — ERC-721 UUPS upgradeable. Members mint here for 0.0001 ETH. Max supply of 14.

**`Staking.sol`** — Handles staking, unstaking, and reward calculation. Key parameters:
- Cooldown: 5 minutes before unstaking
- Reward formula: `(numNFTs × rate × timeStaked) / 60`
- `withdrawAndClaim()` — atomic unstake + reward claim in one transaction

**`token.sol`** — ERC-20 GLXY reward token. Minted directly to the staking contract to fund rewards.

---

## Tech Stack

**Smart Contracts**
- Solidity + OpenZeppelin (UUPS upgradeable proxies)
- Hardhat + `@openzeppelin/hardhat-upgrades`
- Deployed to Sepolia via `scripts/deploy.js`

**Frontend**
- Vite + React 18
- React Router v6 (multi-page: Landing, Mint, Stake, Unstake, Exchange)
- ethers.js v6 (`BrowserProvider`, `Contract`, `parseEther`, `formatEther`)
- Tailwind CSS v3
- GSAP (page transitions, counter animations)
- React Context API (`Web3Context`) with custom hooks per feature

---

## Project Structure

```
NFT_Staking/
├── contracts/
│   ├── NFT.sol
│   ├── Staking.sol
│   └── token.sol
├── scripts/
│   └── deploy.js          # reads BASE_URI from .env
├── frontend/app/
│   ├── src/
│   │   ├── abi/           # NFT.json, Staking.json, RewardToken.json
│   │   ├── components/    # Navbar, GalaxyBg, RewardCounter, CooldownTimer, WalletModal …
│   │   ├── context/       # Web3Context.jsx
│   │   ├── hooks/         # useWallet, useContracts, useNFTs, useMint, useStake, useUnstake, useRewards, useStats
│   │   └── pages/         # Landing, Mint, Stake, Unstake, Exchange
│   └── tailwind.config.js
└── hardhat.config.js
```

---

## Running locally

**Contracts**
```bash
npm install
npx hardhat compile
# copy .env.example → .env and fill in BASE_URI + PRIVATE_KEY
npx hardhat run scripts/deploy.js --network sepolia
```

**Frontend**
```bash
cd frontend/app
npm install
npm run dev        # http://localhost:5173
```

Update `src/constants/addresses.js` with your deployed contract addresses after running the deploy script.

---

## Environment variables

Create a `.env` file in the project root:

```
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
BASE_URI=ipfs://your_metadata_cid/
```

---

## Wallet support

Connect via MetaMask, Coinbase Wallet, or any injected browser wallet. The connect button always opens the MetaMask account picker so you can choose which address to use.
