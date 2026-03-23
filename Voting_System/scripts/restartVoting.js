const {ethers} = require("hardhat");

async function main(){
    const PROXY_ADDRESS = "0x641f8474953E6b1Df07aD198262bf5775347De49";
    const DURATION_IN_MINUTES = 5; // Change this value as needed

    const VotingContract = await ethers.getContractFactory("VotingV2");
    const voting = VotingContract.attach(PROXY_ADDRESS);

    console.log("Restarting voting with duration:", DURATION_IN_MINUTES, "minutes");
    const tx = await voting.restartVoting(DURATION_IN_MINUTES);
    await tx.wait();

    console.log("Voting restarted successfully!");
    console.log("Transaction hash:", tx.hash);
}

main().catch(console.error);
