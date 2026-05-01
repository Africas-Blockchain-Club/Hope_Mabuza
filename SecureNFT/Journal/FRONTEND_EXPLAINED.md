# 🧱 The Complete Guide: Building a Frontend for Your Solidity Smart Contract
### Vite + React + Ethers.js — From Zero to Working DApp

---

## TABLE OF CONTENTS

1. [Mental Model — How It All Connects](#1-mental-model)
2. [Prerequisites](#2-prerequisites)
3. [Step 1 — Create the Vite Project](#3-step-1-create-the-vite-project)
4. [Step 2 — Install Web3 Dependencies](#4-step-2-install-dependencies)
5. [Step 3 — Project Structure (Components)](#5-step-3-project-structure)
6. [Step 4 — Get Your ABI and Contract Address](#6-step-4-abi-and-contract-address)
7. [Step 5 — The Contract Hook (Core Logic)](#7-step-5-contract-hook)
8. [Step 6 — The Wallet Connection Component](#8-step-6-wallet-component)
9. [Step 7 — Reading from the Contract](#9-step-7-reading)
10. [Step 8 — Writing to the Contract](#10-step-8-writing)
11. [Step 9 — Wiring It All Together in App.jsx](#11-step-9-app)
12. [Debugging Guide — Fixing Common Errors](#12-debugging)
13. [The Checklist — Every Time You Build a DApp](#13-checklist)

---

## 1. Mental Model — How It All Connects

Before writing a single line of code, understand the chain of communication:

```
Your Browser (React UI)
        ↓
   MetaMask / Wallet  ←— the user's "key"
        ↓
  Ethers.js / Wagmi   ←— your translator library
        ↓
   RPC Provider        ←— your road to the blockchain (Infura, Alchemy, or localhost)
        ↓
  Smart Contract       ←— your Solidity code, deployed on-chain
```

**Three things you ALWAYS need to connect to a contract:**
1. **Contract Address** — where the contract lives on the blockchain
2. **ABI (Application Binary Interface)** — tells ethers.js WHAT functions the contract has
3. **Provider / Signer** — Provider = read only. Signer = read + write (needs wallet)

---

## 2. Prerequisites

Before starting, make sure you have:
- [Node.js](https://nodejs.org/) v18+ installed (`node -v` to check)
- [MetaMask](https://metamask.io/) browser extension installed
- Your compiled Solidity contract (you need the ABI JSON)
- The deployed contract address (from Remix, Hardhat, or Foundry)

---

## 3. Step 1 — Create the Vite Project

Open your terminal and run:

```bash
# Create a new Vite + React project
npm create vite@latest my-dapp -- --template react

# Move into the folder
cd my-dapp

# Install base dependencies
npm install
```

Then start it to confirm it works:
```bash
npm run dev
```
You should see a page at `http://localhost:5173`. ✅

---

## 4. Step 2 — Install Web3 Dependencies

```bash
npm install ethers
```

> **Why Ethers.js?** It's the most widely used library for interacting with Ethereum from JavaScript. It handles encoding/decoding contract calls, managing wallets, and talking to RPC providers.

Optional but recommended:
```bash
npm install @tanstack/react-query  # for async state management
```

---

## 5. Step 3 — Project Structure (No Spaghetti Code)

Delete the boilerplate and set up a clean structure:

```
my-dapp/
├── public/
├── src/
│   ├── abi/
│   │   └── MyContract.json       ← your ABI file goes here
│   ├── components/
│   │   ├── WalletConnect.jsx     ← handles wallet connection
│   │   ├── ContractReader.jsx    ← handles reading from contract
│   │   └── ContractWriter.jsx    ← handles writing to contract
│   ├── hooks/
│   │   └── useContract.js        ← core logic: provider, signer, contract instance
│   ├── App.jsx                   ← wires everything together
│   └── main.jsx                  ← entry point (don't touch much)
├── .env                          ← secret config (contract address, RPC URL)
└── vite.config.js
```

**Rule:** One component = one responsibility. Never mix wallet logic, read logic, and write logic in the same file.

---

## 6. Step 4 — Get Your ABI and Contract Address

### Getting the ABI

**From Remix:**
1. Compile your contract
2. In the "Solidity Compiler" tab → scroll down → click "ABI" to copy it
3. Paste it into `src/abi/MyContract.json`

**From Hardhat:**
After running `npx hardhat compile`, find it at:
```
artifacts/contracts/MyContract.sol/MyContract.json
```
Copy the `"abi": [...]` array into your `src/abi/MyContract.json`

**From Foundry:**
After running `forge build`, find it at:
```
out/MyContract.sol/MyContract.json
```

### Your ABI file should look like this:
```json
[
  {
    "inputs": [],
    "name": "getValue",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_value", "type": "uint256" }],
    "name": "setValue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

### Store your contract address in `.env`
Create a `.env` file in your project root:
```
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

> ⚠️ **Important:** In Vite, env variables MUST start with `VITE_` to be accessible in your code. Access them with `import.meta.env.VITE_CONTRACT_ADDRESS`.

---

## 7. Step 5 — The Contract Hook (Core Logic)

This is the most important file. It creates your connection to the contract.

**`src/hooks/useContract.js`**
```javascript
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MyContractABI from "../abi/MyContract.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export function useContract() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Connect wallet
  async function connectWallet() {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it.");
      }

      // Request wallet access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();

      // Create contract instance
      // - with signer: can READ and WRITE
      // - with provider only: can only READ
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyContractABI,
        web3Signer
      );

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setAccount(accounts[0]);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Wallet connection error:", err);
    }
  }

  // Create a read-only contract (no wallet needed)
  useEffect(() => {
    const readOnlyProvider = new ethers.JsonRpcProvider(
      import.meta.env.VITE_RPC_URL
    );
    const readOnlyContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MyContractABI,
      readOnlyProvider
    );
    setProvider(readOnlyProvider);
    setContract(readOnlyContract);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount(null);
        } else {
          setAccount(accounts[0]);
        }
      });
    }
  }, []);

  return { provider, signer, contract, account, isConnected, error, connectWallet };
}
```

---

## 8. Step 6 — The Wallet Connection Component

**`src/components/WalletConnect.jsx`**
```jsx
import { useContract } from "../hooks/useContract";

export default function WalletConnect() {
  const { account, isConnected, error, connectWallet } = useContract();

  // Shorten address for display: 0x1234...abcd
  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <div>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {shortAddress}</p>
      )}
    </div>
  );
}
```

---

## 9. Step 7 — Reading from the Contract

Reading = calling `view` or `pure` functions. These are FREE (no gas, no wallet needed).

**`src/components/ContractReader.jsx`**
```jsx
import { useState, useEffect } from "react";
import { useContract } from "../hooks/useContract";

export default function ContractReader() {
  const { contract } = useContract();
  const [value, setValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchValue() {
    if (!contract) return;

    try {
      setIsLoading(true);
      setError(null);

      // Call the contract's read function
      // Replace "getValue" with your actual function name
      const result = await contract.getValue();

      // Convert BigInt to string/number for display
      // Solidity uint256 comes back as BigInt in ethers v6
      setValue(result.toString());
    } catch (err) {
      setError(err.message);
      console.error("Read error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Read on component mount
  useEffect(() => {
    fetchValue();
  }, [contract]);

  return (
    <div>
      <h2>Contract Data</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {value !== null && <p>Current Value: {value}</p>}
      <button onClick={fetchValue}>Refresh</button>
    </div>
  );
}
```

---

## 10. Step 8 — Writing to the Contract

Writing = calling functions that change state. This costs gas and requires the user's wallet to sign.

**`src/components/ContractWriter.jsx`**
```jsx
import { useState } from "react";
import { useContract } from "../hooks/useContract";
import { ethers } from "ethers";

export default function ContractWriter() {
  const { contract, isConnected } = useContract();
  const [inputValue, setInputValue] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleWrite() {
    if (!contract || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      // Call the write function
      // Replace "setValue" with your actual function name
      const tx = await contract.setValue(inputValue);

      // Wait for transaction to be mined
      setTxHash(tx.hash); // show hash immediately so user knows it's sent
      await tx.wait();    // wait for confirmation

      alert("Transaction confirmed!");
    } catch (err) {
      // Parse common MetaMask errors into readable messages
      if (err.code === "ACTION_REJECTED") {
        setError("You rejected the transaction in MetaMask.");
      } else if (err.code === "INSUFFICIENT_FUNDS") {
        setError("Not enough ETH for gas fees.");
      } else {
        setError(err.message);
      }
      console.error("Write error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2>Update Contract</h2>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter new value"
      />
      <button onClick={handleWrite} disabled={isLoading || !isConnected}>
        {isLoading ? "Processing..." : "Send Transaction"}
      </button>

      {txHash && (
        <p>
          Transaction sent:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Etherscan
          </a>
        </p>
      )}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
```

---

## 11. Step 9 — Wire It All Together in App.jsx

**`src/App.jsx`**
```jsx
import WalletConnect from "./components/WalletConnect";
import ContractReader from "./components/ContractReader";
import ContractWriter from "./components/ContractWriter";

function App() {
  return (
    <div>
      <h1>My DApp</h1>
      <WalletConnect />
      <hr />
      <ContractReader />
      <hr />
      <ContractWriter />
    </div>
  );
}

export default App;
```

Run it:
```bash
npm run dev
```

---

## 12. Debugging Guide — Fixing Common Errors

### ❌ "Could not detect network"
**Cause:** Your RPC URL is wrong or missing.
**Fix:** Check `VITE_RPC_URL` in `.env`. Make sure it matches the network your contract is deployed on (Sepolia, Mainnet, localhost:8545, etc.)

---

### ❌ "Contract call revert" / execution reverted
**Cause:** The contract function threw an error (require failed, wrong state, etc.)
**Fix:** Read the revert reason in the console. It usually tells you exactly what `require()` failed. Check the Solidity code for that condition.

---

### ❌ "Cannot read properties of undefined (reading 'getValue')"
**Cause:** You called `contract.getValue()` before the contract was initialized.
**Fix:** Always guard with `if (!contract) return;` before calling contract functions.

---

### ❌ MetaMask shows but transaction never opens
**Cause:** The function call failed before it reached MetaMask (usually a JS error).
**Fix:** Wrap in try/catch and `console.error(err)` — read the full error object.

---

### ❌ "Wrong network" / contract returns garbage
**Cause:** MetaMask is on a different network than where your contract is deployed.
**Fix:** Check which network your contract is on (Remix shows this). Switch MetaMask to match.

---

### ❌ Numbers look wrong (999999999999999...)
**Cause:** Ethers v6 returns `BigInt` for `uint256`. You can't display it directly.
**Fix:** Use `.toString()` for display, or `Number(result)` for small numbers, or `ethers.formatEther(result)` for ETH values.

---

### ❌ "value" is undefined after read
**Cause:** The ABI function name in your code doesn't match the actual Solidity function name.
**Fix:** Open your `MyContract.json` ABI, find the exact `"name"` field, and use that exact string.

---

### ❌ Environment variables are undefined
**Cause:** You forgot the `VITE_` prefix, or you didn't restart the dev server after editing `.env`.
**Fix:** All env vars must start with `VITE_`. Restart `npm run dev` after changing `.env`.

---

## 13. The Checklist — Every Time You Build a DApp

Copy this checklist and check each box before considering your frontend "done":

```
SETUP
[ ] Vite project created and running
[ ] ethers installed
[ ] .env file created with VITE_CONTRACT_ADDRESS and VITE_RPC_URL
[ ] .env added to .gitignore (never commit secrets)

ABI + CONTRACT
[ ] ABI exported from Remix/Hardhat/Foundry
[ ] ABI saved to src/abi/MyContract.json
[ ] Contract deployed and address confirmed correct
[ ] Network in MetaMask matches network of deployment

STRUCTURE
[ ] useContract.js hook handles provider, signer, contract instance
[ ] WalletConnect component handles connection UI
[ ] ContractReader component handles all read calls
[ ] ContractWriter component handles all write calls

READ FUNCTIONS
[ ] Called on component mount (useEffect)
[ ] Loading state shown while fetching
[ ] Error caught and displayed
[ ] BigInt values converted with .toString()

WRITE FUNCTIONS
[ ] Wallet connection checked before calling
[ ] tx.hash shown immediately after sending
[ ] await tx.wait() called for confirmation
[ ] ACTION_REJECTED error handled gracefully
[ ] Loading/disabled state on button during transaction

TESTING
[ ] Tested on correct network (Sepolia/local)
[ ] Read functions return correct values
[ ] Write function opens MetaMask
[ ] Transaction appears on Etherscan after send
[ ] Error messages are human-readable
```

---

## Quick Reference Card

| Task | Code |
|------|------|
| Create contract (read+write) | `new ethers.Contract(address, abi, signer)` |
| Create contract (read only) | `new ethers.Contract(address, abi, provider)` |
| Call read function | `const result = await contract.myFunction()` |
| Call write function | `const tx = await contract.myFunction(arg); await tx.wait()` |
| Convert BigInt for display | `value.toString()` |
| Format ETH value | `ethers.formatEther(value)` |
| Parse ETH to wei | `ethers.parseEther("1.0")` |
| Get connected address | `await signer.getAddress()` |
| Get current network | `await provider.getNetwork()` |
| Listen to contract event | `contract.on("EventName", callback)` |

---

*This guide covers Ethers.js v6 (the current version). If you see `ethers.providers.Web3Provider` in old tutorials, that's v5 — v6 uses `ethers.BrowserProvider` instead.*