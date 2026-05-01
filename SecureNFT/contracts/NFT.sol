// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyNFT is Initializable, ERC1155Upgradeable, OwnableUpgradeable, UUPSUpgradeable {

    string public name;
    string public symbol;

    uint256 public constant ROSE = 0;
    uint256 public constant LILY = 1;

    uint256 public constant ROSE_PRICE  = 0.01 ether;
    uint256 public constant LILY_PRICE  = 0.005 ether;

    uint256 public constant ROSE_MAX_SUPPLY = 100;
    uint256 public constant LILY_MAX_SUPPLY = 10000;

    mapping(uint256 => uint256) public totalSupply;
    mapping(uint256 => string)  private _tokenURIs;

    uint256[50] private __gap;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC1155_init("");
        __Ownable_init();
        __UUPSUpgradeable_init();

        name   = "My Flowers";
        symbol = "MFlower";
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI) external onlyOwner {
        _tokenURIs[tokenId] = tokenURI;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }


    function mintRose() external payable {
        require(msg.value == ROSE_PRICE, "Wrong ETH amount for Rose");
        require(balanceOf(msg.sender, ROSE) == 0, "Already own a Rose");
        require(totalSupply[ROSE] + 1 <= ROSE_MAX_SUPPLY, "Exceeds ROSE max supply");
        totalSupply[ROSE] += 1;
        _mint(msg.sender, ROSE, 1, "");
    }

    function mintLily(uint256 amount) external payable {
        require(msg.value == LILY_PRICE * amount, "Wrong ETH amount for Lily");
        require(totalSupply[LILY] + amount <= LILY_MAX_SUPPLY, "Exceeds LILY max supply");
        totalSupply[LILY] += amount;
        _mint(msg.sender, LILY, amount, "");
    }

    function mintBoth(uint256 lilyAmount) external payable {
        require(msg.value == ROSE_PRICE + (LILY_PRICE * lilyAmount), "Wrong ETH amount");
        require(balanceOf(msg.sender, ROSE) == 0, "Already own a Rose");
        require(totalSupply[ROSE] + 1 <= ROSE_MAX_SUPPLY, "Exceeds ROSE max supply");
        require(totalSupply[LILY] + lilyAmount <= LILY_MAX_SUPPLY, "Exceeds LILY max supply");
        totalSupply[ROSE] += 1;
        totalSupply[LILY] += lilyAmount;

        uint256[] memory ids     = new uint256[](2);
        uint256[] memory amounts = new uint256[](2);
        ids[0] = ROSE;      amounts[0] = 1;
        ids[1] = LILY;      amounts[1] = lilyAmount;
        _mintBatch(msg.sender, ids, amounts, "");
    }

    function ownerMint(uint256 tokenId, uint256 amount) external onlyOwner {
        if (tokenId == ROSE) {
            require(balanceOf(msg.sender, ROSE) == 0, "Already own a Rose");
            require(totalSupply[ROSE] + 1 <= ROSE_MAX_SUPPLY, "Exceeds ROSE max supply");
            totalSupply[ROSE] += 1;
            _mint(msg.sender, ROSE, 1, "");
        } else {
            require(totalSupply[tokenId] + amount <= LILY_MAX_SUPPLY, "Exceeds LILY max supply");
            totalSupply[tokenId] += amount;
            _mint(msg.sender, tokenId, amount, "");
        }
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = owner().call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }


    function safeTransferFrom(
        address, address, uint256, uint256, bytes memory
    ) public pure override {
        revert("Soulbound: tokens cannot be transferred");
    }

    function safeBatchTransferFrom(
        address, address, uint256[] memory, uint256[] memory, bytes memory
    ) public pure override {
        revert("Soulbound: tokens cannot be transferred");
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}