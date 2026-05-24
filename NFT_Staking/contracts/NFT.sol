// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFT is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using Strings for uint256;

    uint256 public nextTokenId;
    string public baseURI;
    uint256 public totalSupply;
    IERC20 public rewardToken;

    uint256 public constant UPGRADE_COST = 100 ether; // 100 RWT (18 decimals)

    mapping(uint256 => bool) public hasNewMetadata;

    uint256[50] private __gap;

    event MintedNFT(uint256 tokenId, address owner);
    event UpdatedMetadata(uint256 tokenId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory baseURI_, address rewardToken_) public initializer {
        baseURI = baseURI_;
        rewardToken = IERC20(rewardToken_);
        __ERC721_init("Galaxy NFT", "GNFT");
        __Ownable_init(msg.sender);
        totalSupply = 14;
    }

    function mint() public payable {
        require(nextTokenId < totalSupply, "All 14 NFTs have been minted");
        require(balanceOf(msg.sender) == 0, "Already minted one NFT");
        require(msg.value == 0.0001 ether, "Requires exactly 0.0001 ether");
        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        hasNewMetadata[tokenId] = false;
        nextTokenId++;
        emit MintedNFT(tokenId, msg.sender);
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = owner().call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }


    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (hasNewMetadata[tokenId] == false) {
            return string(abi.encodePacked(baseURI, "0.json"));
        } else {
            return string(abi.encodePacked(baseURI, (tokenId + 1).toString(), ".json"));
        }
    }

    // Burn 100 RWT to upgrade the NFT to its new metadata
    function upgradeMetadata(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not your NFT");
        require(!hasNewMetadata[tokenId], "Already upgraded");
        require(rewardToken.balanceOf(msg.sender) >= UPGRADE_COST, "Not enough RWT");

        rewardToken.transferFrom(msg.sender, address(0x000000000000000000000000000000000000dEaD), UPGRADE_COST);
        hasNewMetadata[tokenId] = true;
        emit UpdatedMetadata(tokenId);
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        baseURI = baseURI_;
    }

    function ownerSetNewURI(uint256 tokenId) public onlyOwner {
        hasNewMetadata[tokenId] = true;
    }

    function _authorizeUpgrade(address newImpl) internal override onlyOwner {}
}