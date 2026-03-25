require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const vrfCoordinator = process.env.VRF_COORDINATOR;
  const subscriptionId = process.env.SUBSCRIPTION_ID;
  const keyHash = process.env.KEY_HASH;

  console.log("Deploying contract...");

  const LotteryRandomTest = await ethers.getContractFactory("LotteryRandomTest");

  const contract = await LotteryRandomTest.deploy(
    vrfCoordinator,
    subscriptionId,
    keyHash
  );

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});