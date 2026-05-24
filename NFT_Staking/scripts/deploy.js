require("dotenv").config();
const { ethers, upgrades } = require("hardhat");

const BASE_URI = process.env.BASE_URI;
if (!BASE_URI) throw new Error("BASE_URI is not set in .env");

// Reward rate: 1 token per minute per NFT (in 18-decimal units)
// Based on contract formula: rewards = (numNFTs * rate * timeStaked) / 60
// So rate = 1e18 gives ~1 token/min per NFT
const REWARD_RATE = ethers.parseEther("1");

const COOL_TIME = 5 * 60; // 5 minutes in seconds

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy RewardToken (UUPS proxy)
  const Token = await ethers.getContractFactory("RewardToken");
  const token = await upgrades.deployProxy(Token, [], { kind: "uups" });
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("RewardToken deployed:", tokenAddress);

  // 2. Deploy NFT (UUPS proxy)
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await upgrades.deployProxy(NFT, [BASE_URI, tokenAddress], { kind: "uups" });
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("NFT deployed:", nftAddress);

  // 3. Deploy Staking (UUPS proxy)
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await upgrades.deployProxy(
    Staking,
    [nftAddress, tokenAddress, REWARD_RATE],
    { kind: "uups" }
  );
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("Staking deployed:", stakingAddress);

  // 4. Set cooling time to 5 minutes
  await staking.setCoolTime(COOL_TIME);
  console.log("Cool time set to 5 minutes");

  // 5. Mint reward tokens directly into the staking contract
  const FUND_AMOUNT = ethers.parseEther("10000"); // 10,000 RWT for rewards pool
  await token.mint(stakingAddress, FUND_AMOUNT);
  console.log("Staking contract funded with 10,000 RWT");

  console.log("\n--- Deployment Summary ---");
  console.log("RewardToken:", tokenAddress);
  console.log("NFT:        ", nftAddress);
  console.log("Staking:    ", stakingAddress);
  console.log("Cool time:  5 minutes");
  console.log("Reward rate:", ethers.formatEther(REWARD_RATE), "RWT/min per NFT");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
