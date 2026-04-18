//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MyNFT is ERC1155 {

    string public name;
    string public symbol;

    // two different NFTs, each with their own ID
    uint256 public constant ROSE = 0;
    uint256 public constant LILY = 1;

    uint256 public constant ROSE_MAX_SUPPLY = 1000;
    uint256 public constant LILY_MAX_SUPPLY = 1000;

    mapping(uint256 => uint256) public totalSupply;

    constructor()
        ERC1155("null")
    {
        name   = "My Flowers";
        symbol = "MFL";
    }

    function mintRose(uint256 amount) external {
        require(totalSupply[ROSE] + amount <= ROSE_MAX_SUPPLY, "Exceeds ROSE max supply");
        totalSupply[ROSE] += amount;
        _mint(msg.sender, ROSE, amount, "");
    }

    function mintLily(uint256 amount) external {
        require(totalSupply[LILY] + amount <= LILY_MAX_SUPPLY, "Exceeds LILY max supply");
        totalSupply[LILY] += amount;
        _mint(msg.sender, LILY, amount, "");
    }

    function mintBoth(uint256 roseAmount, uint256 lilyAmount) external {
        require(totalSupply[ROSE] + roseAmount <= ROSE_MAX_SUPPLY, "Exceeds ROSE max supply");
        require(totalSupply[LILY] + lilyAmount <= LILY_MAX_SUPPLY, "Exceeds LILY max supply");
        totalSupply[ROSE] += roseAmount;
        totalSupply[LILY] += lilyAmount;

        uint256[] memory ids     = new uint256[](2);
        uint256[] memory amounts = new uint256[](2);
        ids[0] = ROSE;  amounts[0] = roseAmount;
        ids[1] = LILY;  amounts[1] = lilyAmount;
        _mintBatch(msg.sender, ids, amounts, "");
    }
}