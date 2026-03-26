require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  const contract = await ethers.getContractAt("Lottery2", proxyAddress);

  const [owner] = await ethers.getSigners();

  let roundId = await contract.currentRoundId();
  let round = await contract.rounds(roundId);

  if (!round.active) {
    console.log("\nNo active round yet. Waiting for Automation to start one (checks every 30s)...");
    while (!round.active) {
      await new Promise((resolve) => setTimeout(resolve, 30000));
      roundId = await contract.currentRoundId();
      round = await contract.rounds(roundId);
      console.log("Round ID:", roundId.toString(), "| Active:", round.active);
    }
  }

  if (round.drawRequested) {
    console.log("\nRound", roundId.toString(), "already has draw requested. Waiting for next round...");
    while (round.drawRequested || !round.active) {
      await new Promise((resolve) => setTimeout(resolve, 30000));
      roundId = await contract.currentRoundId();
      round = await contract.rounds(roundId);
      console.log("Round ID:", roundId.toString(), "| Active:", round.active, "| Draw Requested:", round.drawRequested);
    }
  }
  const entryFee = await contract.entryFee();

  console.log("--- Round Info ---");
  console.log("Round ID  :", roundId.toString());
  console.log("Active    :", round.active);
  console.log("End Time  :", new Date(Number(round.endTime) * 1000).toLocaleString());
  console.log("Entry Fee :", ethers.formatEther(entryFee), "ETH");

  // Single player buys a ticket (one entry per wallet per round)
  const p1Numbers = [3, 12, 18, 27, 35, 41, 48];
  console.log("\nPlayer buying ticket:", p1Numbers.join(" - "));
  const tx1 = await contract.connect(owner).buyTicket(p1Numbers, { value: entryFee });
  await tx1.wait();
  console.log("Ticket bought ✅");

  // Confirm one-entry restriction
  try {
    await contract.connect(owner).buyTicket(p1Numbers, { value: entryFee });
    console.log("❌ ERROR: Double entry was allowed!");
  } catch (e) {
    console.log("Double entry blocked ✅:", e.message.includes("Already entered") ? "Already entered this round" : e.message);
  }

  const ticketCount = await contract.getRoundTicketCount(roundId);
  console.log("\nTotal tickets in round:", ticketCount.toString());

  console.log("\nWaiting for round to expire and Automation to trigger...");
  console.log("Round ends at:", new Date(Number(round.endTime) * 1000).toLocaleString());

  // Poll until round is drawn
  console.log("\nPolling for round result (checks every 30s)...");
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 30000));

    const updatedRound = await contract.rounds(roundId);

    if (updatedRound.drawn) {
      const winningNumbers = await contract.getRoundWinningNumbers(roundId);
      console.log("\n🎰 Winning Numbers:", winningNumbers.map((n) => n.toString()).join(" - "));

      const ticketCount = await contract.getRoundTicketCount(roundId);
      const p1Ticket = await contract.getTicket(roundId, ticketCount - 1n);

      console.log("\n--- Results ---");
      console.log("Player numbers :", p1Ticket.numbers.map((n) => n.toString()).join(" - "));
      console.log("Player matches :", p1Ticket.matchedCount.toString());
      console.log("Player reward  :", ethers.formatEther(p1Ticket.reward), "ETH");

      const pot = updatedRound.pot;
      const nextRoundId = roundId + 1n;
      const nextRound = await contract.rounds(nextRoundId);

      console.log("\nRound pot        :", ethers.formatEther(pot), "ETH");
      console.log("Owner fee (10%)  :", ethers.formatEther(pot * 10n / 100n), "ETH");
      console.log("Next round pot   :", ethers.formatEther(nextRound.pot), "ETH", "(includes rollover)");
      break;
    }

    console.log("Round not drawn yet, checking again in 30s...");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
