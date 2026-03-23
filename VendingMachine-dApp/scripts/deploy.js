const {ethers} = require("hardhat");

async function main(){
    const VendingM = await ethers.getContractFactory("VendingMachine");
    const vendingM = await VendingM.deploy();
    await vendingM.waitForDeployment();

    const contractAddress = await vendingM.getAddress();
    console.log("Contract address: ", contractAddress);

}
main().catch(console.error);