# Blockchain Voting System

A decentralized voting application built with Solidity smart contracts and a Next.js frontend. This project demonstrates upgradeable smart contracts using the UUPS proxy pattern.

## Overview

This voting system allows users to cast votes on two options through a web interface connected to the Ethereum blockchain. The smart contract includes time-based voting sessions and can be upgraded without losing existing data.

## Features

- Wallet connection through MetaMask
- Time-limited voting sessions with countdown timer
- Real-time vote tracking
- Automatic winner announcement when voting ends
- Upgradeable smart contract architecture
- Owner-controlled voting session management

## Smart Contract Architecture

The project uses OpenZeppelin's upgradeable contracts with the UUPS pattern:

- **VotingV1**: Basic voting functionality with two options
- **VotingV2**: Adds time-based voting sessions and the ability to restart voting

### Key Functions

- `vote(uint256 option)`: Cast a vote for option 1 or 2
- `winner()`: Returns the winning option after voting ends
- `restartVoting(uint256 duration)`: Owner can start a new voting session with specified duration in minutes
- `viewOptions()`: Display available voting options

## Technology Stack

- Solidity 0.8.20
- Hardhat for development and deployment
- OpenZeppelin Contracts (Upgradeable)
- Next.js for frontend
- ethers.js for blockchain interaction
- Tailwind CSS for styling

## Setup and Installation

### Prerequisites

- Node.js installed
- MetaMask browser extension
- Sepolia testnet ETH for deployment

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your credentials:
```
SEPOLIA_RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

3. Deploy the initial contract:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

4. Upgrade to V2:
```bash
npx hardhat run scripts/upgrade.js --network sepolia
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd front_end
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_proxy_address
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Usage

### For Voters

1. Connect your MetaMask wallet
2. View the countdown timer and available options
3. Click on your preferred option to vote
4. Wait for transaction confirmation
5. View results after voting period ends

### For Contract Owner

Restart voting with a new duration:
```bash
npx hardhat run scripts/restartVoting.js --network sepolia
```

Edit the `DURATION_IN_MINUTES` variable in the script to set your desired voting period.

## Project Structure

```
Voting_System/
├── contracts/           # Solidity smart contracts
├── scripts/            # Deployment and interaction scripts
├── test/               # Contract tests
├── front_end/          # Next.js application
│   ├── pages/         # React pages
│   └── styles/        # CSS files
└── .openzeppelin/     # Upgrade history
```

## Contract Addresses

Proxy: 0x641f8474953E6b1Df07aD198262bf5775347De49

## Security Considerations

- Only the contract owner can restart voting sessions
- Each address can only vote once per session
- Contract owner cannot vote
- Voting is only possible during active sessions
- Winner can only be viewed after voting ends

## Future Improvements

- Support for more than two voting options
- Vote delegation functionality
- Vote history and analytics dashboard

## Author

Hope Mabuza