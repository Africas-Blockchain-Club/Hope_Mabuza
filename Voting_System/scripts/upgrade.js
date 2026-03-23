const {ethers, upgrades} = require("hardhat");

async function main(){
    const PROXY_ADDRESS = "0x641f8474953E6b1Df07aD198262bf5775347De49";

    const ImplV2 = await ethers.getContractFactory("VotingV2");
    const upgrade = await upgrades.upgradeProxy(PROXY_ADDRESS, ImplV2, {
        call: { fn: 'reinitialize', args: [60] }
    });
    await upgrade.waitForDeployment();

    const stillProxy = await upgrade.getAddress();
    console.log("Proxy address still, ", stillProxy);

    const newImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log("New implementation address: ", newImplementation);
}
main().catch(console.error)