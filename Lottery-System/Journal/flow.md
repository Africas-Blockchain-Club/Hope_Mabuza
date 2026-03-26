# 🎰 Lottery Contract Flow

## 🔁 End-to-End Lifecycle

```
┌─────────────────────────────────┐
│   Deploy Proxy + Implementation │
└────────────────┬────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │   Initialize   │
        └───────┬────────┘
                │
                ▼
        ┌────────────────┐
        │  Start Round   │◄─────────────────────────┐
        └───────┬────────┘                          │
                │                                   │
                ▼                                   │
        ┌────────────────┐                          │
        │  Players Buy   │◄──────┐                  │
        │    Tickets     │       │                  │
        └───────┬────────┘       │                  │
                │                │                  │
                ▼                │                  │
       ┌─────────────────┐       │                  │
       │  Round Expired? │──No───┘                  │
       └────────┬────────┘                          │
                │ Yes                               │
                ▼                                   │
   ┌────────────────────────┐                       │
   │ Chainlink Automation   │                       │
   │     checkUpkeep()      │                       │
   └────────────┬───────────┘                       │
                │                                   │
                ▼                                   │
       ┌─────────────────┐                          │
       │ Upkeep Needed?  │──No──► Wait              │
       └────────┬────────┘                          │
                │ Yes                               │
                ▼                                   │
        ┌───────────────┐                           │
        │ performUpkeep │                           │
        └───────┬───────┘                           │
                │                                   │
                ▼                                   │
       ┌─────────────────┐                          │
       │  Any Tickets?   │                          │
       └──┬──────────┬───┘                          │
          │ No       │ Yes                          │
          ▼          ▼                              │
   ┌──────────┐  ┌──────────────────────┐          │
   │  Skip    │  │ Request Random Words │          │
   │  Round   │  │    (Chainlink VRF)   │          │
   └────┬─────┘  └──────────┬───────────┘          │
        │                   │                      │
        ▼                   ▼                      │
   ┌─────────┐    ┌──────────────────────┐         │
   │Rollover │    │  VRF Response        │         │
   │  Pool   │    │  Generate 7 Numbers  │         │
   └────┬────┘    │  (1–49, sorted)      │         │
        │         └──────────┬───────────┘         │
        │                    │                     │
        │                    ▼                     │
        │         ┌──────────────────────┐         │
        │         │    Settle Round      │         │
        │         │  Calculate Matches   │         │
        │         │     Split Pot        │         │
        │         │   Assign Rewards     │         │
        │         └──────────┬───────────┘         │
        │                    │                     │
        │                    ▼                     │
        │         ┌──────────────────────┐         │
        │         │  Leftover → Rollover │         │
        │         └──────────┬───────────┘         │
        │                    │                     │
        └────────────────────┘                     │
                             │                     │
                             ▼                     │
                    ┌────────────────┐             │
                    │  Close Round   ├─────────────┘
                    └────────────────┘
```

---

## 🧠 How It Works (Step-by-Step)

### 1. Deployment

* Deploy proxy + implementation
* Call `initialize()`
* First round starts immediately

---

### 2. Active Round

Players can:

* call `buyTicket()`
* submit **7 numbers (1–49)**
* numbers can be in **any order**
* **no duplicates allowed**

---

### 3. Round Expiry

When:

```solidity
block.timestamp >= round.endTime
```

Chainlink Automation detects this via:

```solidity
checkUpkeep()
```

---

### 4. Automation Trigger

If conditions are met:

* `performUpkeep()` is called

Then:

#### Case A: No tickets

* round is skipped
* pot → `rolloverPool`
* new round starts

#### Case B: Tickets exist

* request randomness from Chainlink VRF

---

### 5. Randomness (VRF)

Chainlink calls:

```solidity
rawFulfillRandomWords()
```

Then:

* generate 7 numbers (1–49)
* ensure no duplicates
* sort ascending
* save as `winningNumbers`

---

### 6. Matching Logic

Matching is **position-based (prefix matching)**:

```text
Winning: [1,2,3,4,5,6,7]
Player:  [1,2,4,3,5,6,7]

Match:
✔ 1 == 1
✔ 2 == 2
✘ 4 != 3 → STOP

Result: 2 matches
```

---

### 7. Reward Distribution

Pot is split:

* **10% → Owner**
* **90% → Prize Pool**

| Matches | Reward |
| ------- | ------ |
| 2       | 5%     |
| 3       | 10%    |
| 4       | 15%    |
| 5       | 20%    |
| 6       | 20%    |
| 7       | 30%    |

* rewards are split among winners in each tier
* if no winners → that tier rolls over

---

### 8. Payout System (Pull Payments)

Winnings are stored:

```solidity
pendingRewards[player]
```

Players withdraw manually:

```solidity
withdrawReward()
```

---

### 9. Rollover System

Unused funds:

* no winners in a tier
* empty round

➡️ added to:

```solidity
rolloverPool
```

➡️ used in next round

---

### 10. New Round Starts Automatically

After settlement:

```solidity
_startNewRound();
```

* new round begins instantly
* rollover becomes starting pot

---

## 🔄 Continuous Loop

```text
Start Round
   ↓
Players Buy Tickets
   ↓
Round Ends
   ↓
Automation Triggers
   ↓
VRF Generates Numbers
   ↓
Winners Paid
   ↓
Rollover Calculated
   ↓
New Round Starts
   ↓
Repeat...
```

---

## ⚙️ Chainlink Components

### 🔮 VRF (Randomness)

* fair and verifiable randomness
* generates winning numbers

### ⚡ Automation

* monitors contract off-chain
* triggers:

  * round closing
  * VRF request

---

## 💡 Key Design Features

* ✅ Fully automated round lifecycle (via Chainlink)
* ✅ No duplicate numbers allowed
* ✅ Order-based matching system
* ✅ Gas-efficient pull payments
* ✅ Rollover jackpot support
* ✅ Upgradeable (UUPS)

---

If you want, I can also:

* generate a **diagram image (PNG)** for GitBook or slides
* or add a **“System Architecture” diagram (VRF + Automation + Users)** 🚀
