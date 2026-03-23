const {ethers, upgrades} = require("hardhat");
const {expect} = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");//to pass time


describe("Test Upgraddeable Voting System Contract", function(){
    let voter1;
    let voter2;
    let voter3;
    let owner;
    let V1;
    let V2;
    let proxy;

    beforeEach(async function(){
        [owner, voter1, voter2, voter3] = await ethers.getSigners();

        V1 = await ethers.getContractFactory("VotingV1");

        proxy = await upgrades.deployProxy(V1, ["Black", "White"], 
            {initializer: "initialize", kind: "uups"});
        await proxy.waitForDeployment();
        


    });

    describe("State after deployment", function(){

        it("Should get correct contract owner", async function(){
            
        });
        it("Should get correct options to vote for", async function(){
            const option1 = await proxy.option1();
            const option2 = await proxy.option2();

            expect(option1.toString()).to.equal("Black");
            expect(option2.toString()).to.equal("White");

        });

        it("Should have votes number as 0", async function(){
            const option1Votes = await proxy.option1Votes();
            const option2Votes = await proxy.option2Votes();
            expect(option1Votes).to.equal(0);
            expect(option2Votes).to.equal(0);

        });
    });

    describe("State after voting", function(){
        it("Should let user view options before voting", async function(){
            const VoteAsVoter1 = await proxy.connect(voter1);
            
            const options = await VoteAsVoter1.viewOptions();
            expect(options).to.equal("Select 1 for Black \n Select 2 for White");
        });
        it("Should change state of voter", async function(){
            const VoteAsVoter1 = await proxy.connect(voter1);
            await expect(VoteAsVoter1.vote(1)).to.emit(proxy, "Voted").withArgs(await voter1.getAddress(), "Black");
            const voter1Data = await VoteAsVoter1.voterLog(voter1.getAddress());

            expect(voter1Data.hasVoted).to.equal(true);
            expect(voter1Data.votedFor).to.equal("Black");
            
            const votes = await proxy.option1Votes();
            expect(votes).to.equal(1);
        });

        it("Should revert when user tries voting twice", async function(){
            const VoteAsVoter1 = await proxy.connect(voter1);
            await expect(VoteAsVoter1.vote(1)).to.emit(proxy, "Voted");
            await expect(VoteAsVoter1.vote(2)).to.be.revertedWith("Already voted");
        });

        it("Should revert when owner tries to vote", async function(){
            await expect(proxy.vote(2)).to.be.revertedWith("Owner cannot vote");
        });
        
    });

    describe("Get winner", function(){
        it("Should get winning vote", async function(){
            const VoteAsVoter1 = await proxy.connect(voter1);
            await expect(VoteAsVoter1.vote(1)).to.emit(proxy, "Voted").withArgs(await voter1.getAddress(), "Black");

            const VoteAsVoter2 = await proxy.connect(voter2);
            await expect(VoteAsVoter2.vote(1)).to.emit(proxy, "Voted").withArgs(await voter2.getAddress(), "Black");

            const VoteAsVoter3 = await proxy.connect(voter3);
            await expect(VoteAsVoter3.vote(2)).to.emit(proxy, "Voted").withArgs(await voter3.getAddress(), "White");

            const winner = await proxy.winner();
            expect(winner).to.equal("Black WINS!!!!!!");
        });

        it("Should get a draw", async function(){
            const VoteAsVoter1 = await proxy.connect(voter1);
            await expect(VoteAsVoter1.vote(1)).to.emit(proxy, "Voted").withArgs(await voter1.getAddress(), "Black");

            const VoteAsVoter2 = await proxy.connect(voter2);
            await expect(VoteAsVoter2.vote(2)).to.emit(proxy, "Voted").withArgs(await voter2.getAddress(), "White");

            const winner = await proxy.winner();
            expect(winner).to.equal("ITS A DRAW!!!!!");
        });
    });

    describe("Upgrade implementation", function(){
        beforeEach(async function(){
            V2 = await ethers.getContractFactory("VotingV2");
            const proxyAddress = await proxy.getAddress();

            proxy = await upgrades.upgradeProxy(proxyAddress, V2);
            await proxy.reinitialize(3);
            await proxy.waitForDeployment();
        });

        describe("Check if stake is still the same", function(){
            it("Options are still the same", async function(){
                expect(await proxy.owner()).to.equal(owner);

                const option1 = await proxy.option1();
                const option2 = await proxy.option2();
                expect(option1.toString()).to.equal("Black");
                expect(option2.toString()).to.equal("White");

                const option1Votes = await proxy.option1Votes();
                const option2Votes = await proxy.option2Votes();
                expect(option1Votes).to.equal(0);
                expect(option2Votes).to.equal(0);
            });

            it("Should revert when we try to reinitialize", async function(){
                await expect(proxy.reinitialize(4)).to.be.reverted;
            });


            //check functionality with timer
            it("Should revert if the duraction for voting is not over", async function(){
                const VoteAsVoter1 = await proxy.connect(voter1);
                await expect(VoteAsVoter1.vote(1)).to.emit(proxy, "Voted").withArgs(await voter1.getAddress(), "Black");
 
                const VoteAsVoter2 = await proxy.connect(voter2);
                await expect(VoteAsVoter2.vote(1)).to.emit(proxy, "Voted").withArgs(await voter2.getAddress(), "Black");

                const VoteAsVoter3 = await proxy.connect(voter3);
                await expect(VoteAsVoter3.vote(2)).to.emit(proxy, "Voted").withArgs(await voter3.getAddress(), "White");

                await expect(proxy.winner()).to.be.revertedWith("Voting is still open");
            });

            it("Should successfully see winner", async function(){
                const VoteAsVoter1 = await proxy.connect(voter1);
                await expect(VoteAsVoter1.vote(1)).to.emit(proxy, "Voted").withArgs(await voter1.getAddress(), "Black");
                await time.increase(60);
 
                const VoteAsVoter2 = await proxy.connect(voter2);
                await expect(VoteAsVoter2.vote(1)).to.emit(proxy, "Voted").withArgs(await voter2.getAddress(), "Black");
                await time.increase(60);

                const VoteAsVoter3 = await proxy.connect(voter3);
                await expect(VoteAsVoter3.vote(2)).to.emit(proxy, "Voted").withArgs(await voter3.getAddress(), "White");
                await time.increase(60);

                const winner = await proxy.winner();
                expect(winner).to.equal("Black WINS!!!!!!");
            
            });

            it("Should revert when voter tries to vote after the duration", async function(){
                const VoteAsVoter1 = await proxy.connect(voter1);
                await expect(VoteAsVoter1.vote(1)).to.emit(proxy, "Voted").withArgs(await voter1.getAddress(), "Black");
                await time.increase(60);

                const VoteAsVoter2 = await proxy.connect(voter2);
                await expect(VoteAsVoter2.vote(1)).to.emit(proxy, "Voted").withArgs(await voter2.getAddress(), "Black");
                await time.increase(120);

                const VoteAsVoter3 = await proxy.connect(voter3);
                await expect(VoteAsVoter3.vote(2)).to.be.revertedWith("Voting time is over");
            });

            it("Should revert when non-owner tries to restart voting", async function(){
                const proxyAsVoter1 = await proxy.connect(voter1);
                await expect(proxyAsVoter1.restartVoting(5)).to.be.reverted;
            });

            it("Should restart voting when owner calls it", async function(){
                await time.increase(200);
                
                await expect(proxy.restartVoting(5)).to.not.be.reverted;
                
                const duration = await proxy.duration();
                expect(duration).to.equal(300);

                const VoteAsVoter1 = await proxy.connect(voter1);
                await expect(VoteAsVoter1.vote(1)).to.emit(proxy, "Voted").withArgs(await voter1.getAddress(), "Black");
            });
        });
    });

})