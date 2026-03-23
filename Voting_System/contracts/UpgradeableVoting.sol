// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract VotingV1 is Initializable, OwnableUpgradeable, UUPSUpgradeable{
    //state variables, what will I need to store and use over and over?

    struct Voter{
        bool hasVoted;
        string votedFor;
    }

    uint256 public option1Votes;
    uint256 public option2Votes;

    mapping(address => Voter) public voterLog;

    string public option1;
    string public option2;

    event Voted(address indexed voter, string option);

    uint256[50] private __gap;

    ///@custom:oz-upgrades-unsafe-allow constructor
    constructor (){
        _disableInitializers();
    }

    function initialize (string memory _option1, string memory _option2) public initializer{
        __Ownable_init();
        __UUPSUpgradeable_init();

        option1 = _option1;
        option2 = _option2;
    }

    function  viewOptions() public view returns(string memory){

        return string.concat("Select 1 for ", option1, " \n Select 2 for ", option2);

    }

    function vote(uint256 option) external {
        require(msg.sender != owner(), "Owner cannot vote");
        Voter storage voter = voterLog[msg.sender];
        require(voter.hasVoted == false, "Already voted");
        
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

    function winner() public view returns(string memory){
        if(option1Votes == option2Votes){
            return "ITS A DRAW!!!!!";
        }else if(option1Votes > option2Votes){
            return string.concat( option1 ," WINS!!!!!!");
        }else{
            return string.concat(option2, " WINS!!!!!!");

        }
    }

    function _authorizeUpgrade(address newImplementaion) internal override onlyOwner{}
}

///For version2 add timer for voting and use resetting the vote to zero

contract VotingV2 is Initializable, OwnableUpgradeable, UUPSUpgradeable{
        struct Voter{
        bool hasVoted;
        string votedFor;
    }

    uint256 public option1Votes;
    uint256 public option2Votes;

    mapping(address => Voter) public voterLog;

    string public option1;
    string public option2;

    event Voted(address indexed voter, string option);

    uint256 public duration;
    uint256 public startTime;

    uint256[48] private __gap;

    ///@custom:oz-upgrades-unsafe-allow constructor
    constructor (){
        _disableInitializers();
    }

    /// @custom:oz-upgrades-validate-as-initializer
    function reinitialize ( uint256 _duration) public reinitializer(2){
        __Ownable_init_unchained();

        duration = _duration * 60; //to get seconds, solidity knows seconds
        startTime = block.timestamp;

    }


    function  viewOptions() public view returns(string memory){

        return string.concat("Select 1 for ", option1, " \n Select 2 for ", option2);

    }

    function vote(uint256 option) external {
        require(block.timestamp < startTime + duration, "Voting time is over");
        require(msg.sender != owner(), "Owner cannot vote");
        Voter storage voter = voterLog[msg.sender];
        require(voter.hasVoted == false, "Already voted");
        
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

    function winner() public view returns(string memory){
        require(block.timestamp > startTime + duration, "Voting is still open");
        if(option1Votes == option2Votes){
            return "ITS A DRAW!!!!!";
        }else if(option1Votes > option2Votes){
            return string.concat( option1 ," WINS!!!!!!");
        }else{
            return string.concat(option2, " WINS!!!!!!");

        }
    }

    function restartVoting(uint256 _duration) external onlyOwner {
        duration = _duration * 60;
        startTime = block.timestamp;
    }

    function _authorizeUpgrade(address newImplementaion) internal override onlyOwner{}
}

