// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleVoting {
    //state variables - stored in the blockchain

    address public owner;
    struct Voter{
        bool hasVoted;
        string votedFor;
    }

    uint256 public option1Votes;
    uint256 public option2Votes;

    mapping(address => Voter) public voters;

    string public option1;
    string public option2;

    event Voted(address indexed voter, string option);


    constructor (string memory _option1, string memory _option2) {
        owner = msg.sender;
        option1 = _option1;
        option2 = _option2;
    }

    //view options to vote for
    function  viewOptions() public view returns(string memory){
        return string.concat("Select 1 for ", option1, " or  Select 2 for ", option2);

    }

    //vote for the options you viewed on top
    function vote(uint256 option) external {
        require(msg.sender != owner, "Owner cannot vote");

        Voter storage voter = voters[msg.sender];
        require(!voter.hasVoted, "Already voted");

        require(option == 1 || option == 2, "Invalid option");
        
        voter.hasVoted = true;

        if (option == 1) {
            voter.votedFor = option1;
            option1Votes++;
            emit Voted(msg.sender, option1);
        } else {
            voter.votedFor = option2;
            option2Votes++;
            emit Voted(msg.sender, option2);
        } 

    }

    //get winner by comparing the numbers
    function winner() public view returns(string memory){
        if(option1Votes == option2Votes){
            return "ITS A DRAW!!!!!";
        }else if(option1Votes > option2Votes){
            return string.concat( option1 ," WINS!!!!!!");
        }else{
            return string.concat(option2, " WINS!!!!!!");

        }
    }

}