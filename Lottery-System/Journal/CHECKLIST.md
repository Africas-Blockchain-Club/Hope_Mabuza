# Lottery Contract Checklist

> Work through each section **in order**. Tick a box only once you've tested and confirmed it works.

---

## 🔴 Step 1 — Deploy the Contract
- [ ] Deploy contract with a valid **Chainlink VRF subscription ID**
- [ ] Confirm the **first round starts automatically** on deployment
- [ ] Confirm `roundStartTime` is set and `lotteryOpen` is `true`

---

## 🟠 Step 2 — Players Buy Tickets
- [ ] Players call `buyTicket()` with **7 numbers (1–49)** and the correct `ENTRY_FEE`
- [ ] Input numbers are validated to be **between 1 and 49**
- [ ] Ticket is stored in the **tickets array**
- [ ] `TicketPurchased` event is emitted

---

## 🟡 Step 3 — Round Ends (After 5 Minutes)
- [ ] After **5 minutes**, the round automatically closes (`lotteryOpen` → `false`)
- [ ] Contract automatically requests **7 random numbers from Chainlink VRF**
- [ ] `RequestSent` event is emitted

---

## 🟢 Step 4 — Chainlink VRF Responds
- [ ] `fulfillRandomWords()` is called automatically by Chainlink
- [ ] 7 numbers are generated in range **1–49**
- [ ] Numbers are **unique** (no duplicates)
- [ ] Numbers are **sorted in ascending order**
- [ ] Numbers are stored in `winningNumbers[7]`
- [ ] `WinningNumbersGenerated` event is emitted

---

## 🔵 Step 5 — Rewards Are Distributed Automatically
- [ ] Contract checks each ticket using **sequential prefix matching**:
  - Compare player numbers against winning numbers **position by position, starting from position 1**
  - **Stop counting the moment a mismatch occurs** — numbers after the mismatch are ignored
  - Example: Winning `1,2,3,4,5,6,7` vs Player `1,2,4,3,5,6,7` → mismatch at position 3 → **2 matches**
- [ ] Only tickets with **2+ sequential matches** qualify for a reward
- [ ] Reward tiers (% of total pool):
  | Matches | Pool Share |
  |---------|------------|
  | 2       | 2%         |
  | 3       | 10%        |
  | 4       | 15%        |
  | 5       | 20%        |
  | 6       | 20%        |
  | 7       | 30%        |
- [ ] If multiple players share the same tier, the **tier's pool share is split equally** between them
- [ ] **Owner takes a 10% fee** from the total pool
- [ ] Rewards are automatically sent to winners
- [ ] Leftover ETH (no winners in a tier / remainder) **rolls over** to the next round's pool
- [ ] `RewardClaimed` event is emitted per winner

---

## 🟣 Step 6 — Next Round Starts Automatically
- [ ] Current round **tickets are cleared**
- [ ] `roundStartTime` resets and `lotteryOpen` is set back to `true`
- [ ] New round is ready — players can buy tickets immediately
- [ ] Rolled-over ETH is included in the **new round's pool**

---

## ⚫ Step 7 — Build the dApp (Frontend)
> Only start this once the contract is fully tested and working.

- [ ] Set up a frontend project (e.g. React + ethers.js)
- [ ] Connect to MetaMask via wallet provider
- [ ] Display current round info (time remaining, pool size)
- [ ] Allow players to enter 7 numbers and call `buyTicket()`
- [ ] Show winning numbers after each round
- [ ] Show each player their match result and reward amount
- [ ] Display round history (past winning numbers, pool sizes)
- [ ] Test full end-to-end flow through the dApp

---

## 🔘 Step 8 — Server Automation (Do This Last)
> Only start this once the dApp is fully tested and working.

- [ ] Set up a backend server (e.g. Node.js) that listens to contract events
- [ ] Server monitors `WinningNumbersGenerated` to confirm VRF responded
- [ ] Server monitors `roundStartTime` and automatically triggers the next round if no player buys a ticket
- [ ] Server listens for `RewardClaimed` events and logs payouts
- [ ] Server handles any edge cases (e.g. VRF delay, no players in a round)
- [ ] Deploy server to a reliable host (e.g. AWS EC2) so it runs 24/7
- [ ] Test full end-to-end flow with the server running

---

## ⚠️ Notes
- Never send ETH directly to the contract — always use `buyTicket()`
- Make sure your **MetaMask gas** is sufficient before each transaction
- Monitor all events in **Remix** to confirm each step works correctly
- Chainlink VRF requires a **funded subscription** to respond
