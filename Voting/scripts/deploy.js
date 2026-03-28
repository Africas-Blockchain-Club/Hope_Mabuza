const {ethers} = require("hardhat");

async function main(){
    const Voting = await ethers.getContractFactory("SimpleVoting");
    const voting = await Voting.deploy("Milk", "Water");
    await voting.waitForDeployment();

    const contractAddress = await voting.getAddress();
    console.log("Contract address: ", contractAddress);

}
main().catch(console.error)