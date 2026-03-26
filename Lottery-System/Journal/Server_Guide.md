# 🛠️ Guide: Implementing the Server for the Lottery Project

## 📌 Where You Are Now

At this point, the project already has:

- a working smart contract,
- a frontend built with React + Vite,
- onchain lottery logic already handled.

So the server is **not** being added to run the lottery logic itself.  
It is being added to support the application by:

- storing lottery round history,
- storing ticket and winner history,
- indexing contract events,
- exposing API endpoints for the frontend.

---

# 🎯 Goal of the Server

The backend server should help with these things:

1. **Listen to smart contract events**
2. **Save round history into a database**
3. **Save ticket history**
4. **Save winners and rewards**
5. **Provide API endpoints for the frontend**
6. **Optionally provide analytics or admin monitoring later**

---

# 🧠 Important Design Rule

The server should **not** be responsible for:

- choosing winning numbers,
- deciding winners,
- distributing rewards,
- ending rounds.

That should remain onchain.

The server should only act as:

- an **indexer**,
- a **database writer**,
- an **API provider**.

---

# 🏗️ Recommended Stack

Since your frontend is React + Vite and you are already using JavaScript tools, this is a good stack:

- **Node.js** → runtime
- **Express.js** → backend framework
- **Ethers.js** → interact with contract
- **PostgreSQL** → database
- **Prisma ORM** → database access
- **Railway / Render / VPS** → deployment
- **Supabase Postgres** → hosted database option

---

# 🗺️ High-Level Architecture

## Current Architecture
- Smart Contract
- React Frontend

## New Architecture
- Smart Contract
- React Frontend
- Express Backend
- PostgreSQL Database

## Flow
1. Contract emits events
2. Backend listens to events
3. Backend stores structured data in database
4. Frontend fetches history from backend API

---

# ✅ Step-by-Step Guide

---

## STEP 1: Decide What Data You Want to Save

Before writing the backend, define what "history" means for your lottery.

A good starting point is:

### Rounds
- round id
- start time
- end time
- status
- total pool
- rollover amount
- winning numbers
- request id
- transaction hash

### Tickets
- ticket id
- round id
- player address
- selected numbers
- timestamp
- transaction hash

### Rewards / Winners
- round id
- player address
- matched count
- reward amount

### Events Log
- event name
- round id
- block number
- tx hash
- raw payload

---

## STEP 2: Create the Backend Project

Create a separate folder for the backend.

```bash
mkdir backend
cd backend
npm init -y
````

Install the main packages:

```bash
npm install express ethers dotenv cors prisma @prisma/client
npm install -D nodemon
```

Initialize Prisma:

```bash
npx prisma init
```

---

## STEP 3: Create the Folder Structure

A clean starter structure:

```bash
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── contract.js
│   ├── db/
│   │   └── prisma.js
│   ├── listeners/
│   │   └── lotteryListener.js
│   ├── routes/
│   │   ├── rounds.routes.js
│   │   ├── tickets.routes.js
│   │   └── stats.routes.js
│   ├── services/
│   │   └── lottery.service.js
│   ├── app.js
│   └── server.js
├── .env
├── package.json
```

---

## STEP 4: Add Environment Variables

In `.env`:

```env
PORT=5000
RPC_URL=YOUR_RPC_URL
CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
DATABASE_URL=YOUR_DATABASE_URL
```

If later you also want admin actions or protected routes, you can add more env values.

---

## STEP 5: Set Up the Database Schema

Using Prisma, define the tables you need.

Example starter schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Round {
  id              Int       @id @default(autoincrement())
  roundId         BigInt    @unique
  startTime       DateTime?
  endTime         DateTime?
  status          String?
  prizePool       String?
  rolloverAmount  String?
  winningNumbers  Json?
  requestId       BigInt?
  txHash          String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  tickets         Ticket[]
  rewards         Reward[]
}

model Ticket {
  id              Int       @id @default(autoincrement())
  ticketId        BigInt?
  roundId         BigInt
  playerAddress   String
  selectedNumbers Json
  txHash          String?
  createdAt       DateTime  @default(now())

  round           Round     @relation(fields: [roundId], references: [roundId])
}

model Reward {
  id              Int       @id @default(autoincrement())
  roundId         BigInt
  playerAddress   String
  matchedCount    Int
  rewardAmount    String
  txHash          String?
  createdAt       DateTime  @default(now())

  round           Round     @relation(fields: [roundId], references: [roundId])
}

model EventLog {
  id              Int       @id @default(autoincrement())
  eventName       String
  roundId         BigInt?
  blockNumber     BigInt?
  txHash          String?
  payload         Json?
  createdAt       DateTime  @default(now())
}
```

Run migration:

```bash
npx prisma migrate dev --name init
```

Generate client:

```bash
npx prisma generate
```

---

## STEP 6: Create the Express App

### `src/app.js`

```js
const express = require("express");
const cors = require("cors");

const roundsRoutes = require("./routes/rounds.routes");
const ticketsRoutes = require("./routes/tickets.routes");
const statsRoutes = require("./routes/stats.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/rounds", roundsRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/stats", statsRoutes);

module.exports = app;
```

### `src/server.js`

```js
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## STEP 7: Connect to the Contract

Create a reusable contract config.

### `src/config/contract.js`

```js
const { ethers } = require("ethers");
require("dotenv").config();

const abi = require("../abi/lotteryAbi.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  provider
);

module.exports = { provider, contract };
```

Make sure your ABI file is copied into the backend project.

---

## STEP 8: Connect Prisma

### `src/db/prisma.js`

```js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
```

---

## STEP 9: Implement Event Listening

This is the most important backend feature.

Your backend should listen to emitted contract events and store them in the database.

Example events you might already have:

* `RoundStarted`
* `TicketPurchased`
* `WinningNumbersRequested`
* `WinningNumbersDrawn`
* `RewardsDistributed`

### `src/listeners/lotteryListener.js`

```js
const prisma = require("../db/prisma");
const { contract } = require("../config/contract");

function startLotteryListener() {
  contract.on("RoundStarted", async (roundId, startTime, endTime, event) => {
    try {
      await prisma.round.upsert({
        where: { roundId: BigInt(roundId.toString()) },
        update: {
          startTime: new Date(Number(startTime) * 1000),
          endTime: new Date(Number(endTime) * 1000),
          status: "ACTIVE",
          txHash: event.log.transactionHash,
        },
        create: {
          roundId: BigInt(roundId.toString()),
          startTime: new Date(Number(startTime) * 1000),
          endTime: new Date(Number(endTime) * 1000),
          status: "ACTIVE",
          txHash: event.log.transactionHash,
        },
      });

      await prisma.eventLog.create({
        data: {
          eventName: "RoundStarted",
          roundId: BigInt(roundId.toString()),
          blockNumber: BigInt(event.log.blockNumber.toString()),
          txHash: event.log.transactionHash,
          payload: {
            startTime: startTime.toString(),
            endTime: endTime.toString(),
          },
        },
      });

      console.log(`RoundStarted saved: ${roundId}`);
    } catch (error) {
      console.error("Error saving RoundStarted:", error);
    }
  });

  contract.on("TicketPurchased", async (player, roundId, numbers, event) => {
    try {
      await prisma.ticket.create({
        data: {
          roundId: BigInt(roundId.toString()),
          playerAddress: player.toLowerCase(),
          selectedNumbers: numbers.map((n) => Number(n)),
          txHash: event.log.transactionHash,
        },
      });

      await prisma.eventLog.create({
        data: {
          eventName: "TicketPurchased",
          roundId: BigInt(roundId.toString()),
          blockNumber: BigInt(event.log.blockNumber.toString()),
          txHash: event.log.transactionHash,
          payload: {
            player,
            numbers: numbers.map((n) => Number(n)),
          },
        },
      });

      console.log(`TicketPurchased saved for round ${roundId}`);
    } catch (error) {
      console.error("Error saving TicketPurchased:", error);
    }
  });

  contract.on("WinningNumbersDrawn", async (roundId, winningNumbers, event) => {
    try {
      await prisma.round.update({
        where: { roundId: BigInt(roundId.toString()) },
        data: {
          winningNumbers: winningNumbers.map((n) => Number(n)),
          status: "DRAWN",
        },
      });

      await prisma.eventLog.create({
        data: {
          eventName: "WinningNumbersDrawn",
          roundId: BigInt(roundId.toString()),
          blockNumber: BigInt(event.log.blockNumber.toString()),
          txHash: event.log.transactionHash,
          payload: {
            winningNumbers: winningNumbers.map((n) => Number(n)),
          },
        },
      });

      console.log(`WinningNumbersDrawn saved for round ${roundId}`);
    } catch (error) {
      console.error("Error saving WinningNumbersDrawn:", error);
    }
  });
}

module.exports = startLotteryListener;
```

Then start the listener when the server boots.

Update `src/server.js`:

```js
require("dotenv").config();
const app = require("./app");
const startLotteryListener = require("./listeners/lotteryListener");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startLotteryListener();
});
```

---

## STEP 10: Add API Routes

Your frontend should not need to rebuild all data from chain every time.
It should be able to ask the backend.

### Example routes

#### `GET /api/rounds`

Returns all rounds

#### `GET /api/rounds/:roundId`

Returns one round with tickets and rewards

#### `GET /api/tickets/player/:address`

Returns all tickets for a player

#### `GET /api/stats`

Returns totals like:

* total rounds
* total tickets
* total players
* total rewards paid

---

## STEP 11: Example Route Implementation

### `src/routes/rounds.routes.js`

```js
const express = require("express");
const prisma = require("../db/prisma");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rounds = await prisma.round.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(rounds);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rounds" });
  }
});

router.get("/:roundId", async (req, res) => {
  try {
    const roundId = BigInt(req.params.roundId);

    const round = await prisma.round.findUnique({
      where: { roundId },
      include: {
        tickets: true,
        rewards: true,
      },
    });

    if (!round) {
      return res.status(404).json({ error: "Round not found" });
    }

    res.json(round);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch round" });
  }
});

module.exports = router;
```

---

## STEP 12: Connect Frontend to Backend

In your React frontend, instead of only reading all history directly from chain, use the backend API.

Example:

```js
const response = await fetch("http://localhost:5000/api/rounds");
const rounds = await response.json();
```

You can still read live trust-critical data from the contract, but history is much cleaner from the backend.

A good split is:

### Read from blockchain directly

* current active round
* current ticket price
* round countdown
* current prize pool

### Read from backend

* past rounds
* player history
* winner history
* analytics
* dashboard summaries

---

## STEP 13: Add Backfill Logic

One important thing: if your server goes offline, it can miss live events.

So you should also build a **backfill/sync script** that fetches old logs from the blockchain and repopulates the database.

This script should:

1. read contract logs from a starting block,
2. parse events,
3. write them into the database.

This makes your backend more reliable.

A simple approach:

* save the last processed block in the database,
* when the server starts, sync from that block to latest,
* then start live listeners.

This is much better than only relying on `contract.on(...)`.

---

## STEP 14: Make It Production Safer

For production, prefer this flow:

### Instead of only:

```js
contract.on(...)
```

### Use:

1. historical sync from last saved block,
2. then live event listener,
3. store processed tx hashes or event ids to avoid duplicates.

This helps with:

* restarts,
* downtime,
* provider disconnects,
* duplicate writes.

---

## STEP 15: Deploy the Backend

You have a few options:

### Easy options

* Railway
* Render

### More control

* DigitalOcean VPS
* Ubuntu server
* AWS EC2

For your stage, Railway or Render is easiest.

What you need in deployment:

* Node app running 24/7
* database connection string
* RPC URL
* contract address
* ABI bundled in project

---

## STEP 16: Final Backend Responsibilities

By the end, your server should be able to:

* listen to lottery contract events,
* save rounds,
* save tickets,
* save winning numbers,
* save rewards,
* provide round history to frontend,
* provide player history,
* recover missed events.

---

# ✅ Suggested Build Order

Follow this exact order:

## Phase 1

* create backend project
* connect Express
* connect database
* connect contract

## Phase 2

* create schema
* write listener for one event only
* test DB inserts

## Phase 3

* add remaining event listeners
* add routes
* test API with frontend

## Phase 4

* add historical backfill script
* add last processed block logic
* make event sync more reliable

## Phase 5

* deploy backend
* connect deployed frontend to backend API

---

# 📌 Best First Milestone

Do not try to build everything at once.

Your best first milestone is:

1. create Express server,
2. connect Prisma + Postgres,
3. listen only to `RoundStarted`,
4. save that event to database,
5. create `GET /api/rounds`.

Once that works, everything else becomes easier.

---

# 🚀 Final Summary

Your backend is there to support your lottery, not replace the blockchain.

### Onchain

* lottery rules
* randomness
* winner selection
* payouts

### Offchain backend

* event indexing
* round history
* player history
* fast API for frontend
