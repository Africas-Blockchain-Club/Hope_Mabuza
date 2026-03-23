
# Constructors and Events in Solidity

I was tasked with explaining constructors and events in Solidity, including what they are, why we use them, when to use them, how to use them, and examples.

---

# Constructors

## What is a Constructor

A constructor is a function that only runs once when the contract is deployed.  
It is used to initialize the contract’s state.

---

## Why we use constructors

We use constructors to:
- Set initial values of state variables  
- Define the contract owner  
- Initialize any state the contract needs at deployment  

---

## How to use a constructor

A constructor is defined using the `constructor` keyword and does not have a return type.

```solidity
address public owner;

constructor() {
    owner = msg.sender;
}
````

In this example:

* The deployer of the contract becomes the `owner`

---

## Constructor with parameters

A constructor can also take parameters to initialize state variables.

```solidity
address public owner;
string public car;

constructor(string memory _car) {
    owner = msg.sender;
    car = _car;
}
```

In this example:

* The owner is set to the deployer
* The `car` value is passed during deployment

---

## When to use a constructor

Use a constructor when:

* You need to set values at deployment
* You want to assign ownership
* You are working with a non-upgradeable contract

---

## When NOT to use a constructor

Do not use a constructor when:

* You do not need an initial state
* You are writing an upgradeable contract (use an initializer instead)

---

# Events

## What is an Event

An event is used to log information on the blockchain when something important happens in the contract.

---

## Why we use events

We use events to:

* Keep track of important actions
* Allow users to monitor activity
* Notify external applications (like frontends)

---

## How to use events

### Step 1: Declare the event

```solidity
event Vote(address voter, string vote);
```

### Step 2: Emit the event inside a function

```solidity
emit Vote(msg.sender, "x402");
```

---

## Example

```solidity
contract Voting {
    event Vote(address voter, string vote);

    function castVote(string memory _vote) public {
        emit Vote(msg.sender, _vote);
    }
}
```

In this example:

* When a user votes, the event logs the voter’s address and their vote

---

## When to use events

Use events when:

* A significant action occurs
* You want external applications to react
* You want actions to be traceable

---

## When NOT to use events

Do not use events:

* As a replacement for storage
* Inside contract logic (events cannot be easily read back)
* For unnecessary or minor actions

---

# Summary

* A constructor runs once at deployment and initializes the contract
* Events log important actions so they can be tracked outside the contract

