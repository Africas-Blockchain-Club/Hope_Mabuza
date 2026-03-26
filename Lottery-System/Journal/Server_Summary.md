# 🧠 Lottery System Architecture (Automation + Backend)

## 📌 Overview

This project is a fully automated blockchain lottery system built using:

- Smart Contracts (Solidity)
- Chainlink VRF (randomness)
- Chainlink Automation (round execution)
- Backend Server (Node.js)
- Database (PostgreSQL)

The goal is to ensure that the lottery runs **autonomously onchain**, while also maintaining a **reliable offchain system** for storing history and serving data to users.

---

## ⚙️ Core Components

### 1. Smart Contract (Onchain Logic)

The smart contract is the **source of truth** and handles:

- Creating and managing lottery rounds
- Accepting player tickets
- Validating number selections (no duplicates)
- Requesting randomness via Chainlink VRF
- Generating winning numbers
- Matching player numbers
- Distributing rewards
- Handling rollovers
- Automatically starting new rounds

⚠️ Important:  
All critical logic (money, winners, randomness) is handled **onchain** to ensure trustlessness.

---

### 2. Chainlink VRF (Randomness)

Chainlink VRF is used to:

- Generate provably random numbers
- Ensure fairness and transparency
- Prevent manipulation of winning numbers

Flow:
1. Contract requests randomness
2. Chainlink returns random words
3. Contract generates winning numbers from randomness

---

### 3. Chainlink Automation (Autonomous Execution)

Chainlink Automation ensures the lottery runs **without manual intervention**.

It:
- Monitors contract conditions (`checkUpkeep`)
- Calls `performUpkeep` when a round ends
- Triggers:
  - Randomness request
  - Winner selection
  - Reward distribution
  - New round creation

✅ This removes the need for running a local script or server.

---

### 4. Backend Server (Offchain Layer)

The backend server is **NOT responsible for lottery logic**.

Instead, it acts as a **support system** for:

- Storing round history
- Indexing blockchain events
- Serving data to the frontend
- Monitoring contract activity

---

## 🖥️ What is a Server?

A server is a program that runs continuously on the internet and:

- Listens for requests
- Processes data
- Returns responses

In this project, the server:

- Listens to contract events
- Saves them in a database
- Provides APIs for the frontend

---

## 🧩 Why We Use a Server

Blockchains are not ideal for:

- Querying large datasets
- Filtering/searching history
- Fast UI responses

So we use a server to:

- Store structured data
- Improve frontend performance
- Enable analytics and tracking
- Provide a better user experience

---

## 🏗️ Backend Stack

Recommended stack:

- **Node.js + Express** → Backend server
- **Ethers.js** → Blockchain interaction
- **PostgreSQL (Supabase)** → Database
- **Railway / Render** → Hosting

---

## 🗄️ Database Design

### `rounds`
- `round_id`
- `start_time`
- `end_time`
- `status`
- `prize_pool`
- `rollover_amount`
- `winning_numbers`
- `vrf_request_id`

### `tickets`
- `ticket_id`
- `round_id`
- `player_address`
- `chosen_numbers`
- `match_count`
- `reward_amount`

### `events`
- `event_name`
- `round_id`
- `tx_hash`
- `block_number`
- `payload`

---

## 🔄 System Flow

### 1. Deployment
- Contract is deployed
- First round starts automatically

### 2. Ticket Purchase
- Players buy tickets
- Contract records entries

### 3. Round Ends
- Time condition is met

### 4. Automation Trigger
- Chainlink Automation calls `performUpkeep`

### 5. Randomness Request
- Contract requests VRF randomness

### 6. Winning Numbers Generated
- VRF fulfills request
- Contract derives winning numbers

### 7. Reward Distribution
- Winners are calculated
- Rewards are distributed
- Remaining funds roll over

### 8. New Round Starts
- Automatically begins after distribution

### 9. Backend Indexing
- Server listens to events
- Saves data into database

### 10. Frontend Access
- Frontend fetches data from backend APIs

---

## 📡 Backend Responsibilities

The backend:

- Listens to events:
  - `RoundStarted`
  - `TicketPurchased`
  - `WinningNumbersRequested`
  - `WinningNumbersDrawn`
  - `RewardsDistributed`

- Stores structured data
- Provides API endpoints:
  - `GET /rounds`
  - `GET /rounds/:id`
  - `GET /players/:address`

---

## ⚠️ Important Design Rule

The backend server must **NOT control**:

- When a round ends
- Who wins
- How rewards are distributed

These must remain:

✅ Onchain  
✅ Deterministic  
✅ Trustless  

---

## 🧠 Mental Model

- **Smart Contract** → The judge (rules & money)
- **Chainlink Automation** → The alarm clock (triggers actions)
- **Chainlink VRF** → The random draw machine
- **Backend Server** → The record keeper
- **Database** → The archive

---

## 🚀 Final Architecture Summary

| Layer        | Responsibility                          |
|-------------|----------------------------------------|
| Smart Contract | Lottery logic, funds, fairness       |
| Chainlink VRF | Randomness generation                |
| Chainlink Automation | Automatic execution           |
| Backend Server | Event indexing & API               |
| Database | Historical data storage                   |
| Frontend | User interaction                         |

---

## 🎯 Goal

To build a **fully automated, trustless lottery system** where:

- No manual intervention is required
- All critical logic is onchain
- Users can easily access historical data
- The system is scalable and production-ready

---