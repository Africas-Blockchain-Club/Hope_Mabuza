# Frontend Development Journal

## Overview

The frontend is a Next.js app that connects to the `VendingMachine` smart contract deployed on the Sepolia testnet. It uses `ethers.js` to talk to the blockchain through MetaMask and Tailwind CSS for styling.

---

## Project Structure

```
frontend/
└── src/
    ├── abi/
    │   └── VendingMachine.json   ← Hardhat artifact copied after deployment
    ├── pages/
    │   └── index.js              ← Main UI and all blockchain logic
    └── styles/
        └── globals.css
```

### Why `src/abi/`?
The ABI JSON file is placed in `src/abi/` so it can be imported as a module directly into `index.js`. It should NOT go in `public/` — that folder is for static assets served directly to the browser, not for JS imports.

The file is the Hardhat artifact generated after compiling and deploying the contract. It has this shape:
```json
{
  "_format": "hh-sol-artifact-1",
  "contractName": "VendingMachine",
  "abi": [ ... ],
  "bytecode": "..."
}
```
Because the ABI is nested under the `abi` key, we destructure it on import:
```js
import VendingMachineArtifact from "../abi/VendingMachine.json";
const VendingMachineABI = VendingMachineArtifact.abi;
```
Without this, `ethers.Contract` throws `abi is not iterable` because it receives the whole object instead of the array it expects.

---

## index.js — Full Breakdown

### Imports & Contract Address
```js
import { useState } from "react";
import { ethers } from "ethers";
import VendingMachineArtifact from "../abi/VendingMachine.json";
const VendingMachineABI = VendingMachineArtifact.abi;

const CONTRACT_ADDRESS = "0xB266590c076742C52D790786D16aAED5F1665685";
```
- `useState` — React hook to manage UI state (wallet, stock, amounts, status messages)
- `ethers` — the library that bridges the browser to the blockchain
- `CONTRACT_ADDRESS` — the address where the contract lives on Sepolia

---

### State Variables
```js
const [account, setAccount] = useState(null);
const [stock, setStock] = useState(null);
const [purchaseAmt, setPurchaseAmt] = useState(1);
const [restockAmt, setRestockAmt] = useState(1);
const [status, setStatus] = useState("");
```
| State | Purpose |
|---|---|
| `account` | Stores the connected MetaMask wallet address |
| `stock` | Stores the current vending machine coke balance |
| `purchaseAmt` | How many cokes the user wants to buy |
| `restockAmt` | How many cokes the owner wants to restock |
| `status` | Feedback message shown at the bottom of the UI |

---

### `getContract(withSigner)`
```js
function getContract(withSigner = false) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  if (!withSigner) return new ethers.Contract(CONTRACT_ADDRESS, VendingMachineABI, provider);
  return provider.getSigner().then((signer) => new ethers.Contract(CONTRACT_ADDRESS, VendingMachineABI, signer));
}
```
This is the core "bridge" function. It creates a contract object that lets us call functions on the blockchain.

- `BrowserProvider(window.ethereum)` — wraps MetaMask so ethers.js can use it
- **Without signer** (`withSigner = false`) — returns a read-only contract, used for `getVendingMachineBalance`. No transaction is sent, no gas needed.
- **With signer** (`withSigner = true`) — fetches the MetaMask signer (the user's wallet identity) and returns a contract that can send transactions. Used for `purchase` and `restock`.

---

### `connectWallet()`
```js
async function connectWallet() {
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  setAccount(accounts[0]);
  setStatus("Wallet connected!");
}
```
Triggers the MetaMask popup asking the user to connect. On approval, stores the first account address in state.

---

### `getStock()`
```js
async function getStock() {
  try {
    const contract = getContract();
    const balance = await contract.getVendingMachineBalance();
    setStock(balance.toString());
  } catch (err) {
    setStatus(err.reason || err.message);
  }
}
```
Calls the read-only `getVendingMachineBalance()` function on the contract. No gas, no transaction — just a query. The result is a `BigInt` so we call `.toString()` before storing it.

Common reason this fails: MetaMask is on the wrong network. The contract only exists on Sepolia, so if MetaMask is on mainnet or another testnet, the call returns `0x` (empty) and throws a `BAD_DATA` error.

---

### `purchase()`
```js
async function purchase() {
  try {
    const contract = await getContract(true);
    const tx = await contract.purchase(purchaseAmt, {
      value: ethers.parseEther((purchaseAmt * 2).toString()),
    });
    setStatus("Purchasing... waiting for confirmation.");
    await tx.wait();
    setStatus(`Purchased ${purchaseAmt} coke(s)!`);
    getStock();
  } catch (err) {
    setStatus(err.reason || err.message);
  }
}
```
Sends a payable transaction to the `purchase(uint amount)` function on the contract.

- `getContract(true)` — needs a signer because this sends ETH
- `value: ethers.parseEther(...)` — the contract requires `2 ETH per coke`. `parseEther` converts the human-readable number into Wei (the smallest ETH unit) that the blockchain understands. For example, buying 3 cokes sends `6 ETH` worth of Wei.
- `tx.wait()` — waits for the transaction to be mined on Sepolia before updating the UI
- After success, `getStock()` is called to refresh the displayed balance

---

### `restock()`
```js
async function restock() {
  try {
    const contract = await getContract(true);
    const tx = await contract.restock(restockAmt);
    setStatus("Restocking...");
    await tx.wait();
    setStatus(`Restocked ${restockAmt} unit(s)!`);
    getStock();
  } catch (err) {
    setStatus(err.reason || err.message);
  }
}
```
Calls the `restock(uint amount)` function. This is NOT payable — no ETH is sent — but it still requires a signer because it writes to the blockchain (costs gas). The contract will reject this with `"Only the owner can restock."` if the connected wallet is not the deployer address.

---

## UI & Styling

The UI uses Tailwind CSS with a dark purple theme. The layout is a full-screen dark card (`#0d0d0d` background, `#141414` card) with purple borders and a subtle purple glow shadow.

### Sections
- **Header** — title with 🥫 emoji
- **Wallet** — shows "Connect Wallet" button before connection, switches to showing the truncated wallet address after
- **Stock** — displays current coke inventory with a Refresh button that calls `getStock()`
- **Purchase** — number input + Buy button, ETH cost updates live as you change the amount
- **Restock** — number input + Restock button, visually distinct (outlined style) to signal it's owner-only
- **Status** — feedback bar at the bottom that shows transaction progress, success messages, or errors

---

## Issues Encountered

| Issue | Cause | Fix |
|---|---|---|
| `abi is not iterable` | Passing the whole Hardhat artifact object to `ethers.Contract` instead of just the `abi` array | Destructure with `VendingMachineArtifact.abi` |
| `BAD_DATA: could not decode result` | MetaMask on wrong network, contract not found at address | Switch MetaMask to Sepolia |
| Refresh button silently failing | No error handling in `getStock` | Wrapped in try/catch to surface errors in the status bar |
