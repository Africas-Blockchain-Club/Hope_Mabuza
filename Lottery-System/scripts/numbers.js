require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.PROXY_ADDRESS;

  const contract = await ethers.getContractAt("WinningNumbers", contractAddress);

  console.log("Requesting random words...");
  const tx = await contract.requestRandomWords(false);
  await tx.wait();

  const requestId = await contract.lastRequestId();
  console.log("Request ID:", requestId.toString());

  console.log("Waiting for Chainlink VRF fulfillment (60s)...");
  await new Promise((resolve) => setTimeout(resolve, 60000));

  const [fulfilled] = await contract.getRequestStatus(requestId);

  if (!fulfilled) {
    console.log("Not fulfilled yet. Run the script again after a few more seconds.");
    return;
  }

  const winningNumbers = await contract.getWinningNumbers();
  console.log("\n🎰 Winning Numbers:", winningNumbers.map((n) => n.toString()).join(" - "));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});