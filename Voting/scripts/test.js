const {ethers} = require("hardhat");

async function main(){
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("SimpleVoting");
    const voting = await Voting.deploy("Milk", "Water");
    await voting.waitForDeployment();

    const contractAddress = await voting.getAddress();
    console.log("Contract address: ", contractAddress);

    const options = await voting.viewOptions();
    console.log(options);

    await voting.connect(voter1).vote(1);
    console.log("Voter1 voted Milk");

    await voting.connect(voter2).vote(1);
    console.log("Voter2 voted Milk");

    await voting.connect(voter3).vote(2);
    console.log("Voter3 voted Water");

    const winner = await voting.winner();
    console.log(winner);

}
main().catch(console.error)