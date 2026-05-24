const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

describe("dNFT", function () {
    let owner, user1, user2;
    let nft, rewardToken;

    const MINT_PRICE = ethers.parseEther("0.0001");
    const UPGRADE_COST = ethers.parseUnits("100", 18);
    const DEAD = "0x000000000000000000000000000000000000dEaD";

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const RewardToken = await ethers.getContractFactory("RewardToken");
        rewardToken = await upgrades.deployProxy(RewardToken, [], { kind: "uups" });
        await rewardToken.waitForDeployment();

        const NFT = await ethers.getContractFactory("NFT");
        nft = await upgrades.deployProxy(
            NFT,
            ["ipfs://base-uri/", await rewardToken.getAddress()],
            { kind: "uups" }
        );
        await nft.waitForDeployment();
    });

    // ─── Deployment ────────────────────────────────────────────────────────────

    describe("Deployment", function () {
        it("sets the correct owner", async function () {
            expect(await nft.owner()).to.equal(owner.address);
        });

        it("sets the correct name and symbol", async function () {
            expect(await nft.name()).to.equal("Galaxy NFT");
            expect(await nft.symbol()).to.equal("GNFT");
        });

        it("sets total supply to 14", async function () {
            expect(await nft.totalSupply()).to.equal(14);
        });

        it("sets the reward token address", async function () {
            expect(await nft.rewardToken()).to.equal(await rewardToken.getAddress());
        });
    });

    // ─── Minting ───────────────────────────────────────────────────────────────

    describe("Minting", function () {
        it("allows a user to mint with exact payment", async function () {
            await nft.connect(user1).mint({ value: MINT_PRICE });
            expect(await nft.balanceOf(user1.address)).to.equal(1);
            expect(await nft.nextTokenId()).to.equal(1);
        });

        it("assigns token id 0 to the first minter", async function () {
            await nft.connect(user1).mint({ value: MINT_PRICE });
            expect(await nft.ownerOf(0)).to.equal(user1.address);
        });

        it("starts with base metadata (hasNewMetadata = false)", async function () {
            await nft.connect(user1).mint({ value: MINT_PRICE });
            expect(await nft.hasNewMetadata(0)).to.equal(false);
        });

        it("returns base tokenURI before upgrade", async function () {
            await nft.connect(user1).mint({ value: MINT_PRICE });
            expect(await nft.tokenURI(0)).to.equal("ipfs://base-uri/0.json");
        });

        it("reverts when minting with wrong payment", async function () {
            await expect(
                nft.connect(user1).mint({ value: ethers.parseEther("0.001") })
            ).to.be.revertedWith("Requires exactly 0.0001 ether");
        });

        it("reverts when a user tries to mint a second NFT", async function () {
            await nft.connect(user1).mint({ value: MINT_PRICE });
            await expect(
                nft.connect(user1).mint({ value: MINT_PRICE })
            ).to.be.revertedWith("Already minted one NFT");
        });

        it("reverts when total supply is exhausted", async function () {
            const signers = await ethers.getSigners();
            for (let i = 0; i < 14; i++) {
                await nft.connect(signers[i]).mint({ value: MINT_PRICE });
            }
            const extra = signers[14];
            await expect(
                nft.connect(extra).mint({ value: MINT_PRICE })
            ).to.be.revertedWith("All 14 NFTs have been minted");
        });

        it("emits MintedNFT event", async function () {
            await expect(nft.connect(user1).mint({ value: MINT_PRICE }))
                .to.emit(nft, "MintedNFT")
                .withArgs(0, user1.address);
        });
    });

    // ─── Transfers (no longer soulbound) ───────────────────────────────────────

    describe("Transfers", function () {
        it("allows transferring the NFT to another address", async function () {
            await nft.connect(user1).mint({ value: MINT_PRICE });
            await nft.connect(user1).transferFrom(user1.address, user2.address, 0);
            expect(await nft.ownerOf(0)).to.equal(user2.address);
        });
    });

    // ─── Metadata Upgrade ──────────────────────────────────────────────────────

    describe("upgradeMetadata", function () {
        beforeEach(async function () {
            await nft.connect(user1).mint({ value: MINT_PRICE });
            // Give user1 enough RWT and approve the NFT contract to spend it
            await rewardToken.mint(user1.address, UPGRADE_COST);
            await rewardToken.connect(user1).approve(await nft.getAddress(), UPGRADE_COST);
        });

        it("upgrades metadata when user has 100 RWT", async function () {
            await nft.connect(user1).upgradeMetadata(0);
            expect(await nft.hasNewMetadata(0)).to.equal(true);
        });

        it("returns the upgraded tokenURI after upgrade", async function () {
            await nft.connect(user1).upgradeMetadata(0);
            // tokenId 0 → (0 + 1).toString() = "1"
            expect(await nft.tokenURI(0)).to.equal("ipfs://base-uri/1.json");
        });

        it("burns 100 RWT from the user", async function () {
            const balanceBefore = await rewardToken.balanceOf(user1.address);
            await nft.connect(user1).upgradeMetadata(0);
            const balanceAfter = await rewardToken.balanceOf(user1.address);
            expect(balanceBefore - balanceAfter).to.equal(UPGRADE_COST);
        });

        it("sends the burned RWT to the dead address", async function () {
            await nft.connect(user1).upgradeMetadata(0);
            expect(await rewardToken.balanceOf(DEAD)).to.equal(UPGRADE_COST);
        });

        it("emits UpdatedMetadata event", async function () {
            await expect(nft.connect(user1).upgradeMetadata(0))
                .to.emit(nft, "UpdatedMetadata")
                .withArgs(0);
        });

        it("reverts when caller does not own the NFT", async function () {
            await expect(
                nft.connect(user2).upgradeMetadata(0)
            ).to.be.revertedWith("Not your NFT");
        });

        it("reverts when NFT is already upgraded", async function () {
            await nft.connect(user1).upgradeMetadata(0);
            // Give more tokens for a second attempt
            await rewardToken.mint(user1.address, UPGRADE_COST);
            await rewardToken.connect(user1).approve(await nft.getAddress(), UPGRADE_COST);
            await expect(
                nft.connect(user1).upgradeMetadata(0)
            ).to.be.revertedWith("Already upgraded");
        });

        it("reverts when user has insufficient RWT", async function () {
            // Burn most of the balance so they're short
            await rewardToken.connect(user1).transfer(user2.address, UPGRADE_COST - 1n);
            await expect(
                nft.connect(user1).upgradeMetadata(0)
            ).to.be.revertedWith("Not enough RWT");
        });
    });

    // ─── Owner Functions ───────────────────────────────────────────────────────

    describe("Owner Functions", function () {
        it("allows owner to set a new base URI", async function () {
            await nft.connect(owner).setBaseURI("ipfs://new-uri/");
            await nft.connect(user1).mint({ value: MINT_PRICE });
            expect(await nft.tokenURI(0)).to.equal("ipfs://new-uri/0.json");
        });

        it("allows owner to force-upgrade any token's metadata", async function () {
            await nft.connect(user1).mint({ value: MINT_PRICE });
            await nft.connect(owner).ownerSetNewURI(0);
            expect(await nft.hasNewMetadata(0)).to.equal(true);
        });

        it("reverts when non-owner calls ownerSetNewURI", async function () {
            await nft.connect(user1).mint({ value: MINT_PRICE });
            await expect(nft.connect(user1).ownerSetNewURI(0)).to.be.reverted;
        });

        it("allows owner to withdraw collected ETH", async function () {
            await nft.connect(user1).mint({ value: MINT_PRICE });
            const balanceBefore = await ethers.provider.getBalance(owner.address);
            await nft.connect(owner).withdraw();
            const balanceAfter = await ethers.provider.getBalance(owner.address);
            expect(balanceAfter).to.be.gt(balanceBefore);
        });

        it("reverts when non-owner tries to withdraw ETH", async function () {
            await expect(nft.connect(user1).withdraw()).to.be.reverted;
        });
    });
});
