require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const contract = await ethers.getContractAt("Lottery1", process.env.PROXY_ADDRESS);

  console.log("currentRoundId :", (await contract.currentRoundId()).toString());
  console.log("rolloverPool   :", (await contract.rolloverPool()).toString());
  console.log("roundDuration  :", (await contract.roundDuration()).toString());

  const round0 = await contract.rounds(0);
  console.log("rounds[0].active:", round0.active);

  console.log("\nCalling startRound with explicit gas...");
  const tx = await contract.startRound({ gasLimit: 300000 });
  await tx.wait();
  console.log("✅ Round started!");

  const roundId = await contract.currentRoundId();
  const round = await contract.rounds(roundId);
  console.log("Round ID  :", roundId.toString());
  console.log("Active    :", round.active);
  console.log("End Time  :", new Date(Number(round.endTime) * 1000).toLocaleString());
}

main().catch(console.error);
