const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    const ROSE_URI = process.env.ROSE_URI;
    const LILY_URI = process.env.LILY_URI;

    console.log("Deploying with account:", deployer.address);
    console.log(
        "Account balance:",
        ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
        "ETH\n"
    );


    const MyNFT = await ethers.getContractFactory("MyNFT");

    console.log("Deploying MyNFT (UUPS proxy)...");
    const myNFT = await upgrades.deployProxy(
        MyNFT,
        [],
        {
            initializer: "initialize",
            kind: "uups",
        }
    );

    await myNFT.waitForDeployment();

    const proxyAddress = await myNFT.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

    console.log("Proxy deployed to:         ", proxyAddress);
    console.log("Implementation deployed to:", implementationAddress);

    // 2. Set token URIs
    console.log("\nSetting token URIs...");

    const roseTx = await myNFT.setTokenURI(0, ROSE_URI);
    await roseTx.wait();
    console.log(`  ROSE (id=0) URI set → ${ROSE_URI}`);

    const lilyTx = await myNFT.setTokenURI(1, LILY_URI);
    await lilyTx.wait();
    console.log(`  LILY (id=1) URI set → ${LILY_URI}`);

    // 3. Verify
    const roseURI = await myNFT.uri(0);
    const lilyURI = await myNFT.uri(1);
    console.log("\nVerification:");
    console.log("  uri(0):", roseURI);
    console.log("  uri(1):", lilyURI);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});