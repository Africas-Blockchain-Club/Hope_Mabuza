require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers'); // Common library for blockchain
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));
// 1. Connection to the Blockchain
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const contractAddress = '0x564A2d245F04b1dBA5B65FCe48920368B4f3C51B';
const abi = [ "function balanceOf(address account, uint256 id) view returns (uint256)" ];
const nftContract = new ethers.Contract(contractAddress, abi, provider);


app.post('/verify-nft', async (req, res) => {
  const { walletAddress } = req.body;

  try {
    // 2. Query the Smart Contract directly from the Server
    const [rose, lily] = await Promise.all([
        nftContract.balanceOf(walletAddress, 0),
        nftContract.balanceOf(walletAddress, 1),
    ]);

    if (rose > 0n || lily > 0n) {
      // 3. Logic for "User owns the NFT"
      res.json({ authorized: true, message: "Access Granted" });
    } else {
      res.status(403).json({ authorized: false, message: "No NFT found" });
    }
  } catch (error) {
    res.status(500).send("Error checking blockchain");
  }
});
app.listen(3000, () => console.log("Server running on http://localhost:3000"));