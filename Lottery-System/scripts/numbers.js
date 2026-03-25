require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x123E14a0815fAB7b72376473Cd72CB23e12BB4e1";

  const contract = await ethers.getContractAt(
    "LotteryRandomTest",
    contractAddress
  );

  console.log("Requesting random words...");

  const tx = await contract.requestRandomWords(false); // or true
  const receipt = await tx.wait();

  console.log("Request sent!");

  const requestId = await contract.lastRequestId();
  console.log("Request ID:", requestId.toString());

  // wait for Chainlink VRF
  console.log("Waiting for Chainlink response...");
  await new Promise((resolve) => setTimeout(resolve, 60000)); // 60 seconds

  const [fulfilled, randomWords] =
    await contract.getRequestStatus(requestId);

  if (!fulfilled) {
    console.log("Still not fulfilled. Try again in a bit...");
    return;
  }

  console.log("Random Words:");
  console.log(randomWords);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});