# Setup Guide — New Machine

## Prerequisites

Make sure you have these installed before anything else:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MetaMask](https://metamask.io/) browser extension
- A code editor (VS Code recommended)

Verify Node is installed:
```bash
node -v
npm -v
```

---

## 1. Clone the Repo

```bash
git clone <your_github_repo_url>
cd VendingMachine-dApp
```

---

## 2. Install Root Dependencies (Hardhat)

```bash
npm install
```

This installs everything needed to compile and deploy the smart contract:
- `hardhat`
- `@nomicfoundation/hardhat-toolbox`
- `@openzeppelin/hardhat-upgrades`
- `dotenv`

---

## 3. Set Up the `.env` File

Create a `.env` file in the root of the project (same level as `hardhat.config.js`):

```bash
touch .env
```

Add the following to it:
```
SEPOLIA_RPC_URL=<your_alchemy_or_infura_sepolia_url>
DEPLOYER_PRIVATE_KEY=<your_wallet_private_key>
ETHERSCAN_API_KEY=<your_etherscan_api_key>
```

- `SEPOLIA_RPC_URL` — get this from [Alchemy](https://alchemy.com) or [Infura](https://infura.io) by creating a free Sepolia app
- `DEPLOYER_PRIVATE_KEY` — export your private key from MetaMask (Account Details → Export Private Key). **Never share this or push it to GitHub**
- `ETHERSCAN_API_KEY` — optional, only needed if you want to verify the contract on Etherscan

---

## 4. Compile the Contract

```bash
npx hardhat compile
```

This generates the `artifacts/` folder including the ABI JSON.

---

## 5. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the contract address printed in the terminal. You'll need it in the next step.

---

## 6. Update the Contract Address in the Frontend

Open `frontend/src/pages/index.js` and update line 7:

```js
const CONTRACT_ADDRESS = "<paste_your_new_contract_address_here>";
```

---

## 7. Copy the ABI to the Frontend

After compiling, copy the Hardhat artifact to the frontend:

```bash
cp artifacts/contracts/VendingMachine.sol/VendingMachine.json frontend/src/abi/VendingMachine.json
```

---

## 8. Install Frontend Dependencies

```bash
cd frontend
npm install
```

This installs:
- `next`
- `react`
- `ethers`
- `tailwindcss`

---

## 9. Run the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 10. Connect MetaMask

- Make sure MetaMask is switched to the **Sepolia** testnet
- Click **Connect Wallet** in the app
- You'll need Sepolia ETH to purchase — get some free from [https://sepoliafaucet.com](https://sepoliafaucet.com)

---

## Quick Reference

| Command | What it does |
|---|---|
| `npm install` | Install root Hardhat dependencies |
| `npx hardhat compile` | Compile the smart contract |
| `npx hardhat run scripts/deploy.js --network sepolia` | Deploy to Sepolia |
| `cd frontend && npm install` | Install frontend dependencies |
| `cd frontend && npm run dev` | Start the frontend dev server |
