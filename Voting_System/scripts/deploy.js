const {ethers, upgrades} = require("hardhat");

async function main(){
    const ImplV1 = await ethers.getContractFactory("VotingV1");

    const proxy = await upgrades.deployProxy(ImplV1, ["x402", "Auditing"],
        {initializer: "initialize", kind: "uups"}
    );

    await proxy.waitForDeployment();

    const proxyAddress = await proxy.getAddress();
    console.log("Proxy address: ", proxyAddress);

    const implementaionAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("Implementation address: ", implementaionAddress);

}
main().catch(console.error)