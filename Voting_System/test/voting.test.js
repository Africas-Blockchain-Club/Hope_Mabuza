const {ethers}= require("hardhat");
const{expect} = require("chai");

describe("Test Simple Voting Sustem", function(){
    let voter1;
    let voter2;
    let voter3;
    let SimpleVoting;
    let simpleVoting;

    this.beforeEach(async function(){
        [voter1, voter2, voter3] = await ethers.getSigners();
        SimpleVoting = await ethers.getContractFactory("SimpleVoting");
        simpleVoting = await SimpleVoting.deploy();
        await simpleVoting.waitForDeployment();
    });

    describe("Check state after deployment", function(){
        it("Should have vote scores at 0", async function(){

            expect(await simpleVoting.x402Votes()).to.equal(0);
            expect(await simpleVoting.auditingVotes()).to.equal(0);
        });

        it("Should have user boolean as false", async function(){
            await simpleVoting.connect(voter1);
            const voterData = await simpleVoting.voterLog(voter1.getAddress());
            expect(voterData.hasVoted).to.equal(false);
        });
    });

    describe("Check state after users vote", function (){
        it("Should change user state after voting", async function(){
            const VotingasVoter1 = await simpleVoting.connect(voter1);
            let voterData = await VotingasVoter1.voterLog(voter1.getAddress());
            //before vote
            expect(voterData.hasVoted).to.equal(false);

            await VotingasVoter1.vote_X402();
            voterData = await VotingasVoter1.voterLog(voter1.getAddress());
            //after vote
            expect(voterData.hasVoted).to.equal(true);
            expect(voterData.votedFor).to.equal(0);//index of x402 in enum
            expect(await simpleVoting.x402Votes()).to.equal(1);
        });

         it("Should revert afer user tries to vote more than once", async function(){
            const VotingasVoter1 = await simpleVoting.connect(voter1);

            await VotingasVoter1.vote_X402();
            
            await expect(VotingasVoter1.vote_auditing()).to.be.reverted;
        });
    });

    describe("Get winner or draw", function(){
         it("Should get draw after 2 voters vote", async function(){
            const VotingasVoter1 = await simpleVoting.connect(voter1);
            await VotingasVoter1.vote_X402();

            const VotingasVoter2 = await simpleVoting.connect(voter2);
            await VotingasVoter2.vote_auditing();

            const status = await simpleVoting.winner();

            expect(status).to.equal("DRAW!!!!");

        });
        it("Should get Auditing as winner", async function(){
            const VotingasVoter1 = await simpleVoting.connect(voter1);
            await VotingasVoter1.vote_X402();

            const VotingasVoter2 = await simpleVoting.connect(voter2);
            await VotingasVoter2.vote_auditing();

            const VotingasVoter3 = await simpleVoting.connect(voter3);
            await VotingasVoter3.vote_auditing()

            const status = await simpleVoting.winner();

            expect(status).to.equal("Auditing is the WINNER !!!!");

        });

        it("Should get x402 as winner", async function(){
            const VotingasVoter1 = await simpleVoting.connect(voter1);
            await VotingasVoter1.vote_X402();

            const VotingasVoter2 = await simpleVoting.connect(voter2);
            await VotingasVoter2.vote_auditing();

            const VotingasVoter3 = await simpleVoting.connect(voter3);
            await VotingasVoter3.vote_X402()

            const status = await simpleVoting.winner();

            expect(status).to.equal("x402 is the WINNER !!!!");

        });
    });
})
