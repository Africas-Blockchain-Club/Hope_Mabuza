const {ethers} = require ("hardhat");

async function main(){
    const[voter1, voter2] = await ethers.getSigners();

    const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
    const simpleVoting = await SimpleVoting.deploy();
    await simpleVoting.waitForDeployment();

    const contractAddress = await simpleVoting.getAddress();
    console.log("Contract deployed at: ", contractAddress);

    await simpleVoting.connect(voter1).vote_X402();

    await simpleVoting.connect(voter2).vote_auditing();

    const winner = await simpleVoting.winner();

    console.log("Winner is:", winner);


}
main().catch(console.error);