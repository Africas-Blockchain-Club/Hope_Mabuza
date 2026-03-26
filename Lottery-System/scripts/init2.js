require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;

  const contract = await ethers.getContractAt("Lottery1", proxyAddress);

  console.log("Calling initialize2 on upgraded proxy...");
  const tx = await contract.initialize2();
  await tx.wait();
  console.log("initialize2 called successfully.");

  const roundId = await contract.currentRoundId();
  const round = await contract.rounds(roundId);
  const entryFee = await contract.entryFee();
  const ticketCount = await contract.getRoundTicketCount(roundId);

  console.log("\n--- Contract State ---");
  console.log("Current Round ID :", roundId.toString());
  console.log("Round Active     :", round.active);
  console.log("Round End Time   :", new Date(Number(round.endTime) * 1000).toLocaleString());
  console.log("Entry Fee        :", ethers.formatEther(entryFee), "ETH");
  console.log("Tickets in Round :", ticketCount.toString());

  if (ticketCount == 0) {
    console.log("\n⚠️  No players in this round — round will be skipped and pot rolled over.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
