# The Server — What It Does and Why We Have It

## What is a Server?
Think of a server like a security guard at a club. The frontend (your website) is the entrance, and the blockchain (smart contract) is the VIP area. The security guard (server) checks if you are on the list before letting you in. The user never talks directly to the VIP area — they go through the guard.

---

## Why do we have a Server?

You might ask — why not just check the blockchain directly from the frontend like we did with balances?

The answer is **trust**. A frontend runs in the user's browser, which means a clever user could open the browser console and **fake or bypass any check you write there**. The server runs on a machine the user has no access to, so they cannot tamper with it.

The server is the **single source of truth** for whether a user is allowed in or not.

---

## What does Server.js actually do?

### Step 1 — Connect to the Blockchain
```js
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
```
The server connects to the Sepolia blockchain using a URL stored in the `.env` file. Think of this like the server picking up a phone line to the blockchain so it can ask questions.

### Step 2 — Load the Smart Contract
```js
const nftContract = new ethers.Contract(contractAddress, abi, provider);
```
The server loads your NFT contract using its address and ABI. The ABI is like an instruction manual that tells the server what functions the contract has and how to call them.

### Step 3 — Listen for Requests from the Frontend
```js
app.post('/verify-nft', async (req, res) => { ... });
```
The server opens a door at `http://localhost:3000/verify-nft`. When the frontend knocks on that door and sends a wallet address, the server wakes up and does the check.

### Step 4 — Check the Blockchain
```js
const [rose, lily] = await Promise.all([
  nftContract.balanceOf(walletAddress, 0),
  nftContract.balanceOf(walletAddress, 1),
]);
```
The server asks the smart contract — "does this wallet own any ROSE (id 0) or LILY (id 1) tokens?". It checks both at the same time to save time.

### Step 5 — Send the Result Back
```js
if (rose > 0n || lily > 0n) {
  res.json({ authorized: true, message: "Access Granted" });
} else {
  res.status(403).json({ authorized: false, message: "No NFT found" });
}
```
If the wallet owns at least 1 NFT, the server replies with `authorized: true`. If not, it replies with `authorized: false`. The frontend then decides what to show based on that answer.

---

## How the Frontend Connects to the Server

The frontend talks to the server through a file called `useNFTGate.js`. Here is what happens step by step:

1. User connects their wallet in the browser — MetaMask gives us their wallet address
2. User clicks the **Check Access** button
3. `useNFTGate.js` sends the wallet address to the server:
```js
const res = await fetch("http://localhost:3000/verify-nft", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ walletAddress: account }),
});
```
4. The server checks the blockchain and replies
5. `App.jsx` reads the reply and either shows the mint panel or an access denied message

---

## What is CORS and why did we install it?

CORS stands for Cross-Origin Resource Sharing. By default, browsers **refuse to let a website on one port talk to a server on a different port**. Our frontend runs on port `5173` and our server runs on port `3000` — two different ports, so the browser blocks it.

Installing `cors` and adding this line to the server:
```js
app.use(cors({ origin: 'http://localhost:5173' }));
```
tells the browser "it's okay, I trust requests coming from port 5173". Without this, every request from the frontend would be blocked before it even reached the server.

---

## The Relationship Between Frontend, Server, and Blockchain

```
[ User's Browser ]
      |
      | clicks "Check Access"
      v
[ Frontend - React App (port 5173) ]
      |
      | sends wallet address via HTTP POST
      v
[ Server - Express (port 3000) ]        <-- the security guard
      |
      | asks "does this wallet own an NFT?"
      v
[ Blockchain - Smart Contract ]         <-- the source of truth
      |
      | returns balance
      v
[ Server ]
      |
      | sends authorized: true/false
      v
[ Frontend ]
      |
      | shows mint panel OR access denied
      v
[ User sees the result ]
```

---

## How to Run Everything

You need **two terminals open at the same time**:

**Terminal 1 — Start the Server:**
```bash
cd /home/wtc/Documents/ABC/SecureNFT
node Server.js
```
You should see: `Server running on http://localhost:3000`

**Terminal 2 — Start the Frontend:**
```bash
cd /home/wtc/Documents/ABC/SecureNFT/frontend
npm run dev
```
You should see: `Local: http://localhost:5173`

Then open your browser at `http://localhost:5173`.
