# SimpleVoting Smart Contract

## Overview

`SimpleVoting` is a basic Solidity smart contract that allows users to vote between two options.  
Each wallet address can vote only once, and the contract keeps track of the total votes for each option.

The contract owner creates the voting session by providing the two options during deployment, but the owner is not allowed to vote.

---

## Features

- Two voting options
- One vote per wallet address
- Owner cannot vote
- Tracks total votes for each option
- Stores what each voter voted for
- Emits an event whenever a vote is cast
- Returns the winning option or a draw

---

## How It Works

1. The contract is deployed with two options.
2. Users view the available options.
3. Users cast their vote by selecting option 1 or option 2.
4. Each address can only vote once.
5. Votes are counted and stored on-chain.
6. The winner can be retrieved at any time.

---

## Usage

### Deployment

Deploy the contract with two options:

- Example:
  - Option 1: `Cats`
  - Option 2: `Dogs`

---

### Voting

- Users vote by selecting:
  - `1` → for option 1  
  - `2` → for option 2  

---

### Viewing Results

- The contract returns:
  - The winning option  
  - Or a draw if both options have equal votes  

---

## Example Workflow

1. Deploy contract with:
   - `"Cats"` and `"Dogs"`

2. Users vote:
   - `vote(1)` → votes for Cats  
   - `vote(2)` → votes for Dogs  

3. Check the result:
   - Returns the winner or a draw  

---

## Rules

- The contract owner **cannot vote**
- Each address can **only vote once**
- Only valid options (`1` or `2`) are accepted

---

## Limitations

- Only supports two options
- No voting deadline
- No multiple rounds
- Results can be viewed at any time

---

## Possible Improvements

- Add voting duration
- Support multiple options
- Add multiple voting rounds
- Optimize gas usage (remove string storage)
- Add frontend integration

---

## License

MIT License