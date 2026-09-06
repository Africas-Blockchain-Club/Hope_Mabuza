// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//-------------Inheriting contract in same file----------

contract Mother {
    function helloMother() public pure returns(string memory){
        return "Hellow from mother.";
    }
}

contract Father {
    function helloFather() public pure returns (string memory){
        return "Hellow from father";
    }
}

contract Child is Mother, Father {
    function helloChild() public pure returns (string memory){
        return "Hellow from Child";
    }
}

//----------------Inheriting contract using address, can be in different files----------
contract Parent_File {
    function externalFunction() public pure returns (string memory) {
        return "Called from another contract";
    }
}

contract Child_File {
    Parent_File externalContract;

    constructor(address _externalContractAddress) {
        externalContract = Parent_File(_externalContractAddress);
    }

    function callExternalFunction() public view returns (string memory) {
        return externalContract.externalFunction();
    }

    function resetExternalContract(address _externalContractAddress) public {
        externalContract = Parent_File(_externalContractAddress);
    }
}

//-----------------Playing with storage, memory and calldata----------
contract School {
    string public schoolName;

    constructor(string memory _name) {
        schoolName = _name;
    }

    function getSchoolName() public view returns (string memory) {
        return schoolName;
    }
}

// contract StudentsSystem is School {

//     struct Student {
//         string name;
//         uint mathGrade;
//         uint scienceGrade;
//     }

//     mapping(uint => Student) public students;

//     constructor(string memory _schoolName) School(_schoolName) {
        
//     }

//     function addStudent(uint _id, string calldata _name, uint _mathGrade, uint _scienceGrade) public {
//         students[_id] = Student(_name, _mathGrade, _scienceGrade);
//     }

//     function getStudent(uint _id) public view returns (string memory, uint, uint) {
//         Student memory s = students[_id];
//         return (s.name, s.mathGrade, s.scienceGrade);
//     }
// }

contract WTC_StudentsSystem is School {

    struct Student {
        string name;
        uint256 average;
    }

    mapping(uint => Student) public students;

    constructor(string memory _schoolName) School(_schoolName) {
        
    }

    function addStudent(uint _id, string calldata _name, uint _level) public {
        students[_id] = Student(_name, _level);
    }

    function getStudent(uint _id) public view returns (string memory, uint) {
        Student memory s = students[_id];
        return (s.name, s.average);
    }
}

contract ABC_StudentsSystem is School {

    struct Student {
        string name;
        string level;
    }

    mapping(uint => Student) public students;

    constructor(string memory _schoolName) School(_schoolName) {
        
    }

    function addStudent(uint _id, string calldata _name, string calldata _level) public {
        students[_id] = Student(_name,_level);
    }

    function getStudent(uint _id) public view returns (string memory, string memory) {
        Student memory s = students[_id];
        return (s.name, s.level);
    }
}



contract AdminControl {
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function changeAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;
    }
}


contract FullSchoolSystem is AdminControl {
    ABC_StudentsSystem abc_school;
    WTC_StudentsSystem wtc_school;
    

    constructor(address _abc_school, address _wtc_school) 
        AdminControl() {    
        abc_school = ABC_StudentsSystem(_abc_school);
        wtc_school = WTC_StudentsSystem(_wtc_school);
        }

    //get full student details of the student
    //BLOCKER, Why? -> The 2 different schools return different data types
    //now the returns are different, so how will i do it?
    function getFullDetails(uint _id, string memory schoolName) public view {
        require(
            keccak256(abi.encodePacked(schoolName)) == keccak256(abi.encodePacked("WTC")) ||
            keccak256(abi.encodePacked(schoolName)) == keccak256(abi.encodePacked("ABC")),
            "Invalid school"
            );

        if (keccak256(abi.encodePacked(schoolName)) == keccak256(abi.encodePacked("ABC"))){
            getABCDetails(_id);
            
        } else {
            getWTCDetails(_id);
        }
        
    }

    function addABCStudent(uint _id, string calldata _name, string calldata _level) public{
        abc_school.addStudent(_id, _name, _level);
    }

    function addWTCStudent(uint _id, string calldata _name, uint256 _level) public{
        wtc_school.addStudent(_id, _name, _level);
    }

    //edit student details??????

    //helper functions
    function getABCDetails(uint256 _id) internal  view returns(string memory, 
            string memory,  string memory, address) {
        (string memory name, string memory level) = abc_school.getStudent(_id);
        return (name, level, abc_school.getSchoolName(), admin);
        }

     function getWTCDetails(uint256 _id) internal view returns(string memory, 
            uint256,  string memory, address) {
        (string memory name, uint256 level) = wtc_school.getStudent(_id);
        return (name, level, wtc_school.getSchoolName(), admin);
        }

    


}

