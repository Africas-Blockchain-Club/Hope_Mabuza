# Building a Frontend for the Voting dApp

This guide documents the steps I took to build a simple React/Next.js frontend for my VotingV1 smart contract. The goal was to connect a website to the contract deployed on Sepolia so that users can connect their wallet and vote.

---

## What We Are Building

A simple dApp (decentralised application) that:
- Connects to the user's MetaMask wallet
- Reads data from the VotingV1 contract (options, vote counts, winner)
- Lets users cast a vote by calling the `vote()` function on-chain

---

## The Stack

| Tool | Purpose |
|---|---|
| Next.js | React framework for the frontend |
| ethers.js | JavaScript library to talk to the blockchain |
| MetaMask | Browser wallet to sign transactions |
| Tailwind CSS | Utility-first CSS for styling |

---

## Step 1: Create the Frontend Folder

Since the Voting_System folder is already a Hardhat project, I created a separate `front_end` folder inside it to keep things clean. Each has its own `package.json` so they don't interfere with each other.

```bash
mkdir front_end
cd front_end
npx create-next-app@latest .
```

The `.` at the end tells Next.js to set up the project in the current folder instead of creating a new subfolder.

When prompted, I chose:
- TypeScript → **No** (plain JavaScript is simpler)
- ESLint → **Yes**
- Tailwind CSS → **Yes**
- App Router → **No** (Pages Router is easier to understand)
- React Compiler → **No** (experimental, not needed)

---

## Step 2: Install ethers.js

Inside the `front_end` folder, I installed ethers.js:

```bash
npm install ethers
```

This library is what allows the frontend to:
- Connect to MetaMask
- Read from the contract
- Send transactions

Without it, the website has no way to talk to the blockchain.

---

## Step 3: Copy the Contract ABI

When Hardhat compiles a contract, it generates a JSON file containing the ABI (Application Binary Interface). The ABI is basically a description of all the functions in the contract — ethers.js needs it to know how to call them.

I copied the ABI from the artifacts folder into the `front_end` folder:

```bash
cp ../artifacts/contracts/UpgradeableVoting.sol/VotingV1.json ./VotingV1.json
```

> Important: Every time you recompile the contract, you need to copy the ABI again.

---

## Step 4: Set Up the Environment Variable

I created a `.env.local` file in the `front_end` folder to store the contract's proxy address. I used the most recent proxy address from `.openzeppelin/sepolia.json`.

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xB4ed1C08c957680d2b577025af349513Fab0Ff17
```

The `NEXT_PUBLIC_` prefix is required by Next.js to make the variable accessible in the browser.

> After changing `.env.local`, always restart the dev server — Next.js only reads it on startup.

---

## Step 5: Build the UI

I replaced the default `pages/index.js` with a custom page that:

1. Connects to MetaMask using `ethers.BrowserProvider`
2. Creates a contract instance using the ABI and proxy address
3. Reads `option1`, `option2`, `option1Votes`, `option2Votes`, and `winner` from the contract
4. Lets the user vote by calling `contract.vote(1)` or `contract.vote(2)`

The key part of connecting to the contract looks like this:

```js
const _provider = new ethers.BrowserProvider(window.ethereum);
await _provider.send("eth_requestAccounts", []);
const _signer = await _provider.getSigner();
const _contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, _signer);
```

- `BrowserProvider` — wraps MetaMask so ethers.js can use it
- `getSigner` — gets the connected wallet (needed to send transactions)
- `Contract` — creates an object that represents the deployed contract

---

## Step 6: Style It

I used Tailwind CSS utility classes to give the app a clean neutral look:
- Light grey page background
- White card in the center
- Two vote buttons side by side
- A result box showing the current winner
- Different shades of grey to separate important from secondary information

---

## Step 7: Run It

```bash
npm run dev
```

Open `http://localhost:3000` in the browser, make sure MetaMask is on **Sepolia**, and connect the wallet.

---

## How It All Connects

```
MetaMask (wallet)
      ↓
ethers.js (bridge)
      ↓
Proxy Contract on Sepolia (0xB4ed1C08...)
      ↓
VotingV1 Logic (reads options, records votes)
```

The user always interacts with the **proxy address**, but the actual logic runs inside the VotingV1 implementation contract underneath it. This is the UUPS upgradeable pattern.

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `could not decode result data` | Wrong network or wrong contract address | Switch MetaMask to Sepolia |
| `Install MetaMask first` | MetaMask not installed | Install the MetaMask browser extension |
| `Already voted` | Wallet already voted | Use a different wallet address |
| `Owner cannot vote` | Connected wallet is the contract owner | Use a non-owner wallet |

---

## Summary

- The frontend is a Next.js app inside the `front_end` folder
- ethers.js connects the website to the blockchain via MetaMask
- The ABI tells ethers.js what functions the contract has
- The proxy address tells ethers.js where the contract lives on Sepolia
- Always make sure MetaMask is on the correct network before connecting
