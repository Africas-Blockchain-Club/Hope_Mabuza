const {ethers} = require("hardhat");

async function main(){
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address: ", deployerAddress);

    const NFT = await ethers.getContractFactory("MyNFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();

    console.log("Contract address: ", nftAddress);
}
main().catch(console.error);