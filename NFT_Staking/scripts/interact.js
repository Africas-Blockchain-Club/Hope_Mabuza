const { ethers, upgrades } = require("hardhat");

const MINT_PRICE = ethers.parseEther("0.0001");
const REWARD_POOL = ethers.parseUnits("5000", 18);
const REWARD_RATE = ethers.parseUnits("0.00694", 18); // tokens per minute per NFT
const UPGRADE_COST = ethers.parseUnits("100", 18);    // 100 RWT to upgrade metadata

async function main() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    // ── Step 1: Deploy ──────────────────────────────────────────────────────────
    console.log("=== Deploying Contracts ===");

    const RewardToken = await ethers.getContractFactory("RewardToken");
    const rewardToken = await upgrades.deployProxy(RewardToken, [], { kind: "uups" });
    await rewardToken.waitForDeployment();
    console.log("RewardToken deployed:", await rewardToken.getAddress());

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await upgrades.deployProxy(
        NFT,
        ["ipfs://base-uri/", await rewardToken.getAddress()],
        { kind: "uups" }
    );
    await nft.waitForDeployment();
    console.log("NFT deployed:", await nft.getAddress());

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await upgrades.deployProxy(
        Staking,
        [await nft.getAddress(), await rewardToken.getAddress(), REWARD_RATE],
        { kind: "uups" }
    );
    await staking.waitForDeployment();
    console.log("Staking deployed:", await staking.getAddress());

    await rewardToken.mint(owner.address, REWARD_POOL);
    await rewardToken.approve(await staking.getAddress(), REWARD_POOL);
    await staking.fundRewards(REWARD_POOL);
    await staking.setCoolTime(10);
    console.log(`\nReward pool funded with ${ethers.formatUnits(REWARD_POOL, 18)} RWT | Cool time: 10s`);

    // ── Step 2: Mint ────────────────────────────────────────────────────────────
    console.log("\n=== Step 1: Users Mint NFTs ===");
    console.log("Each user pays 0.0001 ETH and receives one Galaxy NFT starting at base metadata.\n");

    const users = [
        { signer: user1, name: "User1" },
        { signer: user2, name: "User2" },
        { signer: user3, name: "User3" },
    ];

    const tokenIds = {};
    for (const user of users) {
        const tx = await nft.connect(user.signer).mint({ value: MINT_PRICE });
        const receipt = await tx.wait();

        const mintEvent = receipt.logs
            .map((log) => { try { return nft.interface.parseLog(log); } catch { return null; } })
            .find((e) => e && e.name === "MintedNFT");

        const tokenId = mintEvent.args.tokenId;
        tokenIds[user.name] = tokenId;
        console.log(`${user.name} — minted NFT #${tokenId} | metadata: ${await nft.tokenURI(tokenId)}`);
    }

    // ── Step 3: Stake ───────────────────────────────────────────────────────────
    console.log("\n=== Step 2: Users Stake Their NFTs ===");
    console.log("NFTs are transferred to the staking contract. Users start earning RWT.\n");

    for (const user of users) {
        const tokenId = tokenIds[user.name];
        await nft.connect(user.signer).approve(await staking.getAddress(), tokenId);
        await staking.connect(user.signer).stake(tokenId);
        console.log(`${user.name} — staked NFT #${tokenId} | NFT now held by staking contract`);
    }

    console.log(`\nTotal NFTs staked: ${await staking.totalStaked()}`);

    // ── Step 4: Earn rewards (advance time) ─────────────────────────────────────
    console.log("\n=== Step 3: Time Passes — Users Earn RWT ===");
    console.log("Advancing chain time by 15 seconds (past the 10s cool period).\n");

    await ethers.provider.send("evm_increaseTime", [15]);
    await ethers.provider.send("evm_mine");

    for (const user of users) {
        const pending = await staking.calculateRewards(user.signer.address);
        console.log(`${user.name} — pending rewards: ${ethers.formatUnits(pending, 18)} RWT`);
    }

    // ── Step 5: Unstake ─────────────────────────────────────────────────────────
    console.log("\n=== Step 4: Users Unstake — NFTs Returned to Wallet ===");
    console.log("Users must withdraw their NFT before they can upgrade its metadata.\n");

    for (const user of users) {
        const tokenId = tokenIds[user.name];
        await staking.connect(user.signer).withdraw(tokenId);
        console.log(`${user.name} — withdrew NFT #${tokenId} | NFT back in wallet`);
    }

    // ── Step 6: Claim rewards ───────────────────────────────────────────────────
    console.log("\n=== Step 5: Users Claim Earned RWT ===\n");

    for (const user of users) {
        await staking.connect(user.signer).claimRewards();
        const balance = await rewardToken.balanceOf(user.signer.address);
        console.log(`${user.name} — RWT balance after claim: ${ethers.formatUnits(balance, 18)}`);
    }

    // ── Step 7: Top up to 100 RWT (demo only) ──────────────────────────────────
    // In production users accumulate 100 RWT purely through staking.
    // Here we top up the difference so the demo doesn't require ~14,000 minutes of staking.
    console.log("\n=== [Demo Only] Topping users up to 100 RWT ===");
    console.log("In production this threshold is reached by staking over time.\n");

    for (const user of users) {
        const balance = await rewardToken.balanceOf(user.signer.address);
        if (balance < UPGRADE_COST) {
            await rewardToken.mint(user.signer.address, UPGRADE_COST - balance);
        }
        console.log(`${user.name} — RWT balance: ${ethers.formatUnits(await rewardToken.balanceOf(user.signer.address), 18)}`);
    }

    // ── Step 8: Upgrade metadata ────────────────────────────────────────────────
    console.log("\n=== Step 6: Users Spend 100 RWT to Upgrade NFT Metadata ===");
    console.log("100 RWT is burned. The NFT metadata advances to its upgraded URI.\n");

    for (const user of users) {
        const tokenId = tokenIds[user.name];
        const uriBefore = await nft.tokenURI(tokenId);

        await rewardToken.connect(user.signer).approve(await nft.getAddress(), UPGRADE_COST);
        await nft.connect(user.signer).upgradeMetadata(tokenId);

        const uriAfter = await nft.tokenURI(tokenId);
        const rwtLeft = await rewardToken.balanceOf(user.signer.address);
        console.log(`${user.name} — NFT #${tokenId} upgraded`);
        console.log(`  metadata before : ${uriBefore}`);
        console.log(`  metadata after  : ${uriAfter}`);
        console.log(`  RWT remaining   : ${ethers.formatUnits(rwtLeft, 18)}\n`);
    }

    // ── Final summary ───────────────────────────────────────────────────────────
    console.log("=== Final Summary ===\n");
    for (const user of users) {
        const tokenId = tokenIds[user.name];
        console.log(
            `${user.name} — NFT #${tokenId} upgraded: ${await nft.hasNewMetadata(tokenId)} | RWT: ${ethers.formatUnits(await rewardToken.balanceOf(user.signer.address), 18)} | NFTs in wallet: ${await nft.balanceOf(user.signer.address)}`
        );
    }
    console.log(`\nTotal NFTs still staked: ${await staking.totalStaked()}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
