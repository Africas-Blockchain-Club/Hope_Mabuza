const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

describe("Test NFT Staking", function () {
    let owner, staker1, staker2;
    let nft, rewardToken, nftStaking;

    const MINT_PRICE = ethers.parseEther("0.0001");
    const REWARD_POOL = ethers.parseEther("5000");
    const REWARD_RATE = ethers.parseUnits("0.00694", 18);

    beforeEach(async function () {
        [owner, staker1, staker2] = await ethers.getSigners();

        // Deploy RewardToken proxy first (NFT needs its address)
        const RewardToken = await ethers.getContractFactory("RewardToken");
        rewardToken = await upgrades.deployProxy(RewardToken, [], { kind: "uups" });
        await rewardToken.waitForDeployment();

        // Deploy NFT proxy
        const NFT = await ethers.getContractFactory("NFT");
        nft = await upgrades.deployProxy(NFT, ["ipfs://base-uri/", await rewardToken.getAddress()], { kind: "uups" });
        await nft.waitForDeployment();

        // Deploy Staking proxy
        const Staking = await ethers.getContractFactory("Staking");
        nftStaking = await upgrades.deployProxy(
            Staking,
            [await nft.getAddress(), await rewardToken.getAddress(), REWARD_RATE],
            { kind: "uups" }
        );
        await nftStaking.waitForDeployment();

        // Mint reward pool to owner then fund the staking contract
        await rewardToken.mint(owner.address, REWARD_POOL);
        await rewardToken.approve(await nftStaking.getAddress(), REWARD_POOL);
        await nftStaking.fundRewards(REWARD_POOL);
    });

    async function mintNFT(user) {
        await nft.connect(user).mint({ value: MINT_PRICE });
        const tokenId = (await nft.nextTokenId()) - 1n;
        return tokenId;
    }

    async function increaseTime(seconds) {
        await ethers.provider.send("evm_increaseTime", [seconds]);
        await ethers.provider.send("evm_mine", []);
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await nft.owner()).to.equal(owner.address);
            expect(await rewardToken.owner()).to.equal(owner.address);
            expect(await nftStaking.owner()).to.equal(owner.address);
        });

        it("Should fund the staking contract with rewards", async function () {
            expect(await rewardToken.balanceOf(await nftStaking.getAddress())).to.equal(REWARD_POOL);
        });
    });

    describe("Staking", function () {
        it("Should allow user to stake an NFT", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            const stakedIds = await nftStaking.getStakedTokenIds(staker1.address);
            expect(stakedIds.length).to.equal(1);
            expect(await nftStaking.tokenOwner(tokenId)).to.equal(staker1.address);
        });

        it("Should revert when staking an already staked NFT", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            await expect(nftStaking.connect(staker1).stake(tokenId)).to.be.revertedWith("NFT already staked");
        });

        it("Should revert when non-owner tries to stake someone else's NFT", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);

            await expect(nftStaking.connect(staker2).stake(tokenId)).to.be.reverted;
        });
    });

    describe("Withdraw", function () {
        it("Should allow user to withdraw after coolTime", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);
            expect(await nft.balanceOf(staker1.address)).to.equal(0);

            await increaseTime(3600);

            await nftStaking.connect(staker1).withdraw(tokenId);
            expect(await nft.balanceOf(staker1.address)).to.equal(1);
            expect(await nftStaking.totalStaked()).to.equal(0);
        });

        it("Should revert when withdrawing before coolTime", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            await expect(nftStaking.connect(staker1).withdraw(tokenId)).to.be.revertedWith("Still locked");
        });

        it("Should allow emergency withdraw without coolTime", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            await nftStaking.connect(staker1).emergencyWithdraw(tokenId);
            expect(await nft.balanceOf(staker1.address)).to.equal(1);
            expect(await nftStaking.totalStaked()).to.equal(0);
        });

        it("Should revert when non-owner tries to emergency withdraw", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            await expect(nftStaking.connect(staker2).emergencyWithdraw(tokenId)).to.be.revertedWith("Not your NFT");
        });

        it("Should reset rewards to 0 on emergency withdraw", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            await increaseTime(200);
            const rewards = await nftStaking.calculateRewards(staker1.address);
            expect(rewards).to.be.gte(ethers.parseUnits("0.02", 18));

            await nftStaking.connect(staker1).emergencyWithdraw(tokenId);
            const userInfo = await nftStaking.userInfo(staker1.address);
            expect(userInfo.rewards).to.equal(0);
        });
    });

    describe("Withdraw and Claim", function () {
        it("Should withdraw NFT and claim rewards in one transaction", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            await increaseTime(120);

            const balanceBefore = await rewardToken.balanceOf(staker1.address);
            await nftStaking.connect(staker1).withdrawAndClaim(tokenId);
            const balanceAfter = await rewardToken.balanceOf(staker1.address);

            expect(await nft.balanceOf(staker1.address)).to.equal(1);
            expect(await nftStaking.totalStaked()).to.equal(0);
            // 120 seconds = 2 mins * 0.00694 ≈ 0.01388 tokens
            expect(balanceAfter - balanceBefore).to.be.gte(ethers.parseUnits("0.013", 18));
        });

        it("Should revert withdrawAndClaim before coolTime", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            await expect(nftStaking.connect(staker1).withdrawAndClaim(tokenId)).to.be.revertedWith("Still locked");
        });
    });

    describe("Claiming Rewards", function () {
        it("Should allow user to claim rewards after coolTime", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            await increaseTime(120);
            const calculated = await nftStaking.calculateRewards(staker1.address);
            expect(calculated).to.be.gte(ethers.parseUnits("0.013", 18));

            const balanceBefore = await rewardToken.balanceOf(staker1.address);
            await nftStaking.connect(staker1).claimRewards();
            const balanceAfter = await rewardToken.balanceOf(staker1.address);

            expect(balanceAfter - balanceBefore).to.be.gte(ethers.parseUnits("0.013", 18));
            const userInfo = await nftStaking.userInfo(staker1.address);
            expect(userInfo.rewards).to.equal(0);
        });

        it("Should transfer reward tokens to user on claim", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            await increaseTime(300);
            const balanceBefore = await rewardToken.balanceOf(staker1.address);
            await nftStaking.connect(staker1).claimRewards();
            const balanceAfter = await rewardToken.balanceOf(staker1.address);
            // 300 seconds = 5 mins * 0.00694 ≈ 0.0347 tokens
            expect(balanceAfter - balanceBefore).to.be.gte(ethers.parseUnits("0.034", 18));
        });

        it("Should revert when claiming before coolTime", async function () {
            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);

            await expect(nftStaking.connect(staker1).claimRewards()).to.be.revertedWith("Still locked");
        });
    });

    describe("Owner Functions", function () {
        it("Should allow owner to set reward rate", async function () {
            const newRate = ethers.parseEther("2");
            await nftStaking.connect(owner).setRewardRate(newRate);
            expect(await nftStaking.rewardRate()).to.equal(newRate);
        });

        it("Should revert when non-owner sets reward rate", async function () {
            await expect(nftStaking.connect(staker1).setRewardRate(1)).to.be.reverted;
        });

        it("Should allow owner to set cool time", async function () {
            await nftStaking.connect(owner).setCoolTime(60);
            expect(await nftStaking.coolTime()).to.equal(60);
        });

        it("Should revert when non-owner sets cool time", async function () {
            await expect(nftStaking.connect(staker1).setCoolTime(60)).to.be.reverted;
        });

        it("Should allow owner to fund rewards", async function () {
            const amount = ethers.parseEther("1000");
            await rewardToken.mint(owner.address, amount);
            await rewardToken.connect(owner).approve(await nftStaking.getAddress(), amount);

            const balanceBefore = await rewardToken.balanceOf(await nftStaking.getAddress());
            await nftStaking.connect(owner).fundRewards(amount);
            const balanceAfter = await rewardToken.balanceOf(await nftStaking.getAddress());

            expect(balanceAfter - balanceBefore).to.equal(amount);
        });

        it("Should revert when non-owner tries to fund rewards", async function () {
            await expect(nftStaking.connect(staker1).fundRewards(1)).to.be.reverted;
        });

        it("Should allow owner to pause and block staking", async function () {
            await nftStaking.connect(owner).pause();

            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);

            await expect(nftStaking.connect(staker1).stake(tokenId)).to.be.reverted;
        });

        it("Should revert when non-owner tries to pause", async function () {
            await expect(nftStaking.connect(staker1).pause()).to.be.reverted;
        });

        it("Should allow owner to unpause", async function () {
            await nftStaking.connect(owner).pause();
            await nftStaking.connect(owner).unpause();

            const tokenId = await mintNFT(staker1);
            await nft.connect(staker1).setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(staker1).stake(tokenId);
            expect(await nftStaking.totalStaked()).to.equal(1);
        });

        it("Should revert when non-owner tries to unpause", async function () {
            await nftStaking.connect(owner).pause();
            await expect(nftStaking.connect(staker1).unpause()).to.be.reverted;
        });
    });
});
