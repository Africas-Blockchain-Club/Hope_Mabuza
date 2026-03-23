# Solidity Syntax Recap

## 1. Contract Structure

Every Solidity contract follows this basic layout:

```solidity
pragma solidity ^0.8.20;

contract MyContract {
    // state variables
    // constructor / initializer
    // functions
}
```

---

## 2. Data Types

These are the most common types you'll use:

```solidity
uint256 public number;
bool public isActive;
address public user;
string public name;
```

**Struct** — groups related data together:

```solidity
struct Person {
    string name;
    uint256 age;
}
```

**Mapping** — like a dictionary, great for fast lookups:

```solidity
mapping(address => uint256) public balances;
```

---

## 3. Storage — This One Matters A Lot

Storage controls where your data lives and how long it sticks around. Get this wrong and you'll either waste gas or lose data silently.

### `storage`
Data saved permanently on the blockchain. Costs gas, but persists forever.

```solidity
uint256 public count; // lives in storage
```

### `memory`
Temporary — only exists during the function call. Cheaper than storage.

```solidity
function setName(string memory _name) public {}
```

### `calldata`
Read-only input for external functions. The cheapest option for function inputs.

```solidity
function setName(string calldata _name) external {}
```

### The Gotcha You Need to Know

```solidity
Person memory p = people[msg.sender];
p.age = 30; // this does NOT save anything
```

```solidity
Person storage p = people[msg.sender];
p.age = 30; // this saves to the blockchain
```

### Quick Reference

| Use case                | Use this  |
| ----------------------- | --------- |
| Permanent data          | storage   |
| Temporary calculations  | memory    |
| External function input | calldata  |

---

## 4. Constructor

Runs once when the contract is deployed. Used to set initial values.

```solidity
constructor() {
    owner = msg.sender;
}
```

> Not used in upgradeable contracts — use `initialize()` instead.

---

## 5. Functions

```solidity
function setValue(uint256 _value) public {
    value = _value;
}
```

**Visibility** controls who can call a function:
- `public` — anyone
- `external` — only from outside the contract
- `internal` — only this contract and children
- `private` — only this contract

**Mutability** describes what the function does with state:
- `view` — reads state, doesn't change it
- `pure` — doesn't read or change state
- `payable` — can receive ETH

---

## 6. Modifiers

Reusable rules you attach to functions:

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}
```

---

## 7. Events

Used for logging — not stored on-chain, but readable off-chain:

```solidity
event Deposited(address indexed user, uint256 amount);
emit Deposited(msg.sender, msg.value);
```

---

## 8. Error Handling

```solidity
require(amount > 0, "Invalid");  // check a condition, revert with message
revert("Error");                 // manually revert
assert(x > 0);                  // for internal invariants (should never fail)
```

---

## 9. Arrays

```solidity
uint[] public numbers;
numbers.push(10);
```

---

## 10. Inheritance

```solidity
contract B is A {}
```

---

## 11. Global Variables

These are always available inside any function:

```solidity
msg.sender      // address that called the function
msg.value       // ETH sent with the call
block.timestamp // current block time
```

---

## 12. Payable

Marks a function as able to receive ETH:

```solidity
function deposit() public payable {}
```

---

## 13. Design Rules Worth Remembering

- Use **mapping** for fast lookups
- Use **struct** for grouped data
- Use **events** for logging, not storage
- Use **modifiers** to enforce rules cleanly
- Avoid loops over large datasets
- Be careful with **storage** — it costs gas

---

## 14. Mental Checklist When Reading Code

1. Where does the data live? → `storage` / `memory` / `calldata`
2. Who can call this function? → visibility
3. Does it change state? → `view` / `pure`
4. Does it involve ETH? → `payable`
5. Are rules being enforced? → `require` / modifier

---

## Summary

- `storage` = permanent, lives on the blockchain
- `memory` = temporary, gone after the function ends
- `calldata` = read-only input, cheapest for external calls

If data needs to persist → use `storage`  
If it's just temporary → use `memory`  
If it's an external input you won't modify → use `calldata`
