// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleVoting {
    //state variables - stored in the blockchain
    enum Choices {X402, Auditing}
    
    struct Voter {
        bool hasVoted;
        Choices votedFor;
    }

    mapping(address => Voter) public voterLog;

    uint256 public x402Votes;
    uint256 public auditingVotes; 

    event Voted(address indexed voter, Choices choice);


    function vote_X402() external {
        require(!voterLog[msg.sender].hasVoted, "Already voted");
        voterLog[msg.sender].hasVoted = true;
        voterLog[msg.sender].votedFor = Choices.X402;
        x402Votes += 1;

        emit Voted(msg.sender, Choices.X402);
    }

    function vote_auditing() external {
        require(!voterLog[msg.sender].hasVoted, "Already voted");
        voterLog[msg.sender].hasVoted = true;
        voterLog[msg.sender].votedFor = Choices.Auditing;
        auditingVotes += 1;

        emit Voted(msg.sender, Choices.Auditing);
    }

    function winner() public view  returns (string memory){
        if (x402Votes == auditingVotes) {
            return "DRAW!!!!";
    } else if (x402Votes > auditingVotes) {
            return "x402 is the WINNER !!!!";
    } else {
        return "Auditing is the WINNER !!!!";
    }
        
    }

}