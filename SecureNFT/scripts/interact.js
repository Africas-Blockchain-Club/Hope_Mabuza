const { ethers } = require("hardhat");

const ROSE = 0;
const LILY = 1;

async function checkBalances(nft, label, signers) {
    console.log(`\n--- Balances: ${label} ---`);
    for (const signer of signers) {
        const addr = await signer.getAddress();
        const rose = await nft.balanceOf(addr, ROSE);
        const lily = await nft.balanceOf(addr, LILY);
        console.log(`${addr} | ROSE: ${rose} | LILY: ${lily}`);
    }
    console.log(`Total Supply  | ROSE: ${await nft.totalSupply(ROSE)} | LILY: ${await nft.totalSupply(LILY)}`);
}

async function main() {
    const [deployer, buyer1, buyer2] = await ethers.getSigners();
    console.log("Deployer:", await deployer.getAddress());

    const NFT = await ethers.getContractFactory("MyNFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    console.log("Contract deployed:", await nft.getAddress());

    await checkBalances(nft, "Before minting", [deployer, buyer1, buyer2]);

    // mintRose
    console.log("\nmintRose: deployer mints 2 ROSE");
    await nft.mintRose(2);

    console.log("mintRose: buyer1 mints 3 ROSE");
    await nft.connect(buyer1).mintRose(3);

    // mintLily
    console.log("mintLily: buyer2 mints 4 LILY");
    await nft.connect(buyer2).mintLily(4);

    // mintBoth
    console.log("mintBoth: deployer mints 1 ROSE + 2 LILY");
    await nft.mintBoth(1, 2);

    await checkBalances(nft, "After minting", [deployer, buyer1, buyer2]);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });