// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract VendingMachine {

    // state variables
    address public owner;
    mapping (address => uint) public cokeBalances;

    // set the owner as th address that deployed the contract
    // set the initial vending machine balance to 100
    constructor() {
        owner = msg.sender;
        cokeBalances[address(this)] = 100;
    }

    function getVendingMachineBalance() public view returns (uint) {
        return cokeBalances[address(this)];
    }

    // Let the owner restock the vending machine
    function restock(uint amount) public {
        require(msg.sender == owner, "Only the owner can restock.");
        cokeBalances[address(this)] += amount;
    }

    // Purchase donuts from the vending machine
    function purchase(uint amount) public payable {
        require(msg.value >= amount * 0.00001 ether, "You must pay at least 0.00001 ETH per donut");
        require(cokeBalances[address(this)] >= amount, "Not enough donuts in stock to complete this purchase");
        cokeBalances[address(this)] -= amount;
        cokeBalances[msg.sender] += amount;
    }
}