# Lottery System — Dev Log

> Document every step taken in this project, in order.

---

## [1] Installed Chainlink Contracts

**Commands:**
```bash
npm install -g pnpm
pnpm add @chainlink/contracts
```

**Why:**
The contract imports `VRFConsumerBaseV2Plus` and `VRFV2PlusClient` from `@chainlink/contracts`. Without this package installed, Hardhat cannot resolve those imports and throws an `Invalid import: library not installed` error. This package gives us access to Chainlink VRF, which is used to generate the 7 random winning numbers each round. We used `pnpm` instead of `npm` because it is significantly faster at installing packages.

---

## [2] Set Up Environment Variables

Create a `.env` file in the root of `Lottery-System/` with the following values:

```env
PRIVATE_KEY=<your_wallet_private_key>
RPC_URL=<your_rpc_url>
VRF_COORDINATOR=<chainlink_vrf_coordinator_address>
SUBSCRIPTION_ID=<your_chainlink_vrf_subscription_id>
KEY_HASH=<your_chainlink_key_hash>
```

**Why:**
- `PRIVATE_KEY` — used by Hardhat to sign and deploy transactions from your wallet
- `RPC_URL` — the network endpoint (e.g. Sepolia via Alchemy or Infura) Hardhat connects to
- `VRF_COORDINATOR` — the Chainlink VRF coordinator contract address for the network you're deploying on
- `SUBSCRIPTION_ID` — your Chainlink VRF subscription ID, needed to fund and authorize VRF requests
- `KEY_HASH` — identifies the Chainlink oracle and gas lane to use for the VRF request

> ⚠️ Never commit your `.env` file to Git. Make sure `.env` is listed in `.gitignore`.

---

## [3] Created Deploy Script `scripts/test.js`

**Why:**
We created `test.js` to deploy the `LotteryRandomTest` contract to the Sepolia testnet. The script reads `VRF_COORDINATOR`, `SUBSCRIPTION_ID`, and `KEY_HASH` from the `.env` file and passes them as constructor arguments. It then waits for the deployment to confirm and logs the deployed contract address.

---

## [4] Upgraded ethers to v6

**Command:**
```bash
pnpm add ethers@6
```

**Why:**
`@nomicfoundation/hardhat-ethers@3.x` requires ethers v6. The project had ethers v5 installed, which caused a crash when running the deploy script because `getAddress` — a function that only exists in ethers v6 — was being called inside the hardhat-ethers plugin itself. Since the crash was inside the plugin's source code and not our script, switching to v5 syntax was not an option. Upgrading to v6 was the only clean fix.

---

# Testing

## [T1] Deployed Contract & Registered as Chainlink Consumer

- Ran `test.js` to deploy `LotteryRandomTest` to Sepolia
- Copied the deployed contract address from the terminal output
- Went to [vrf.chain.link](https://vrf.chain.link) and added the contract address as a **consumer** on our Chainlink VRF subscription
- This is required — Chainlink will reject VRF requests from any contract that is not registered as a consumer on the subscription

## [T2] Created `numbers.js` to Request & Fetch Random Numbers

- Created `scripts/numbers.js` to interact with the deployed contract
- The script calls `requestRandomWords()` to trigger a VRF request, then fetches the 7 random numbers returned by Chainlink once the request is fulfilled

## [T3] Converted Hex Numbers & Made Contract Upgradeable

- Successfully received 7 random numbers from Chainlink VRF in hex format
- Updated the contract to convert the raw hex values into numbers in the range **1–49** using modulo: `(hexValue % 49) + 1`
- Added logic to ensure the 7 numbers are **unique** (no duplicates)
- Numbers are then **sorted in ascending order** and saved into `winningNumbers[7]`
- Made the contract **upgradeable** using OpenZeppelin's upgradeable proxy pattern so future improvements can be made without redeploying from scratch

---

## [5] Implemented Winning Numbers with UUPS Upgradeable Pattern

**What Changed:**
- Refactored `WinningNumbers.sol` to use **UUPS (Universal Upgradeable Proxy Standard)** pattern with OpenZeppelin's upgradeable contracts
- Removed `VRFConsumerBaseV2Plus` inheritance to avoid ownership conflicts between Chainlink's `ConfirmedOwner` and OpenZeppelin's `OwnableUpgradeable`
- Implemented VRF callback directly using `rawFulfillRandomWords()` which the Chainlink coordinator calls after fulfilling the randomness request
- Added `_generateWinningNumbers()` logic to convert raw random words into 7 unique numbers between 1-49, sorted in ascending order

**Why Upgradeable:**
Making the contract upgradeable means we only need to add the **proxy address** as a consumer on Chainlink VRF once. When we upgrade the implementation contract in the future, the proxy address stays the same, so we don't have to re-register consumers on Chainlink every time we deploy a new version. This saves gas and simplifies the workflow.

**Environment Setup:**
- Added `PROXY_ADDRESS` to `.env` after deploying the proxy
- This allows `numbers.js` to interact with the deployed proxy without hardcoding addresses

**Scripts:**
- `scripts/proxy.js` — deploys the UUPS proxy with `WinningNumbers` as the implementation, passing `vrfCoordinator`, `subscriptionId`, and `keyHash` to the `initialize()` function
- `scripts/numbers.js` — refactored to:
  - Load `PROXY_ADDRESS` from `.env`
  - Call `requestRandomWords(false)` on the proxy
  - Wait 60 seconds for Chainlink VRF fulfillment
  - Fetch and print the 7 winning numbers using `getWinningNumbers()`

**Output Format:**
```
🎰 Winning Numbers: 3 - 12 - 18 - 27 - 35 - 41 - 48
```

**Key Benefits:**
- Single consumer registration on Chainlink (proxy address never changes)
- Future upgrades don't require re-registering with Chainlink
- Clean separation between proxy (storage) and implementation (logic)
- Owner is properly set via `OwnableUpgradeable` in the proxy's storage during `initialize()`

---

## [6] Deployed Full Lottery Logic — `Lottery1.sol`

**What Changed:**
- Created `Lottery1.sol` as the first full upgrade over `WinningNumbers.sol`
- Added complete lottery logic: rounds, tickets, reward tiers, rollover pool, owner fees
- Integrated `AutomationCompatibleInterface` for Chainlink Automation support
- Used `reinitializer(2)` since `WinningNumbers` already consumed version 1
- Renamed initializer to `initialize2()` with no args — VRF config already stored in proxy from V1
- Used `__Ownable_init_unchained()` to avoid re-initializing ownership already set in V1
- Removed `_startNewRound()` from `initialize2` — a round was already active from `WinningNumbers`
- Added `startRound()` owner function to manually kick off the first `Lottery1` round
- Fixed storage layout: moved `entryFee`, `roundDuration`, `automationNativePayment` after all V1 variables so they consume gap slots correctly
- Set `__gap[39]` to account for 11 new storage variables added in this upgrade

**Round Logic:**
- `buyTicket(uint8[7])` — player submits 7 numbers (1–49, no duplicates) and pays `entryFee`
- `checkUpkeep()` — Chainlink Automation polls this; returns true when round has expired
- `performUpkeep()` — called by Automation; skips empty rounds or requests VRF randomness
- `rawFulfillRandomWords()` — called by VRF coordinator; generates winning numbers and settles round
- `_settleRound()` — calculates matches, splits pot, assigns rewards, starts next round
- `_rollEmptyRoundForward()` — skips round with no players, rolls pot to next round

**Reward Tiers (of 90% prize pool):**
| Matches | Share |
|---------|-------|
| 2       | 5%    |
| 3       | 10%   |
| 4       | 15%   |
| 5       | 20%   |
| 6       | 20%   |
| 7       | 30%   |

- 10% of pot goes to owner
- Unclaimed tiers roll over to next round

**Scripts:**
- `scripts/upgrade.js` — upgrades proxy to `Lottery1`, calls `initialize2`, starts first round if none active
- `scripts/players.js` — buys tickets, polls for round result, prints winning numbers and rewards

---

## [7] Set Up Chainlink Automation

**Why:**
Without Automation, rounds expire but nothing happens — someone would have to manually call `performUpkeep` every time. Automation makes the lottery fully self-running.

**Setup Steps:**
1. Go to [automation.chain.link](https://automation.chain.link)
2. Connect wallet
3. Click **Register new Upkeep** → **Custom Logic**
4. Enter proxy address as the contract address
5. Fund with testnet LINK
6. Register

**Why proxy address:**
Since the contract is upgradeable, the proxy address never changes. Automation only needs to be registered once — it works across all future upgrades automatically.

**Contract interface:**
`Lottery1` implements `AutomationCompatibleInterface` which requires:
- `checkUpkeep()` — Chainlink simulates this off-chain to check if work is needed
- `performUpkeep()` — Chainlink calls this on-chain when `checkUpkeep` returns true

---

## [T4] End-to-End Test — Lottery1 on Sepolia

- Deployed fresh proxy with `proxy.js`
- Added proxy address as consumer on VRF subscription at [vrf.chain.link](https://vrf.chain.link)
- Added proxy address as upkeep contract on Automation at [automation.chain.link](https://automation.chain.link)
- Ran `upgrade.js` → upgraded to `Lottery1`, started round 1
- Ran `players.js` → bought 2 tickets, waited for round to expire
- Chainlink Automation triggered `performUpkeep` ✅
- Chainlink VRF fulfilled randomness ✅
- Winning numbers generated and round settled ✅
- Rollover correctly carried into next round pot ✅

**Sample output:**
```
🎰 Winning Numbers: 4 - 13 - 16 - 27 - 40 - 44 - 47

--- Results ---
Player 1 numbers : 3 - 12 - 18 - 27 - 35 - 41 - 48
Player 1 matches : 0
Player 1 reward  : 0.0 ETH
Player 2 numbers : 5 - 11 - 19 - 22 - 33 - 40 - 47
Player 2 matches : 0
Player 2 reward  : 0.0 ETH

Round pot        : 0.000704 ETH
Owner fee (10%)  : 0.0000704 ETH
Next round pot   : 0.0006336 ETH (includes rollover)
```

---

## [8] Upgraded to `Lottery2.sol` — One Entry Per Round

**What Changed:**
- Created `Lottery2.sol` as the next upgrade over `Lottery1`
- Added `hasEntered[roundId][player]` mapping to restrict each wallet to one ticket per round
- `buyTicket()` now reverts with `"Already entered this round"` if the same wallet tries to enter twice
- Used `reinitializer(3)` since `Lottery1` consumed version 2
- `__gap` reduced from `[38]` to `[37]` to account for the new `hasEntered` mapping
- Storage layout carefully ordered to match deployed `Lottery1` slots exactly

**Why a new contract instead of modifying Lottery1:**
`Lottery1` is already deployed and tested. Creating `Lottery2` keeps each upgrade as a clean, auditable step — `Lottery1` remains unchanged as a reference point.

**Scripts:**
- `scripts/upgrade2.js` — upgrades proxy to `Lottery2`, calls `initialize3`, starts round if none active
- `scripts/players.js` — updated to use `Lottery2`, tests one-entry restriction, polls for results

---


## [9] Updated `Lottery3.sol` — Pause / Unpause Logic

**What Changed:**

- Added `bool public paused` state variable after `hasEntered` mapping
- Reduced `__gap` from `[38]` to `[37]` to account for the new `paused` bool slot
- Added two new events: `GamePaused(address indexed by)` and `GameUnpaused(address indexed by)`
- Added `whenNotPaused` modifier that reverts with `"Game is paused"` when `paused` is true
- Added `pauseGame()` — `onlyOwner`, reverts if already paused, sets `paused = true`
- Added `unpauseGame()` — `onlyOwner`, reverts if not paused, sets `paused = false`
- `initialize3()` explicitly sets `paused = false` so state is clean after upgrade

**Functions updated with `whenNotPaused`:**
| Function | Reason |
|---|---|
| `buyTicket` | Prevents ticket sales while game is paused |
| `performUpkeep` | Prevents automation from closing rounds while paused |
| `startRound` | Prevents owner from accidentally starting a round while paused |

**`checkUpkeep` updated:**
- Added `!paused &&` as the first condition so Chainlink Automation naturally returns `upkeepNeeded = false` while paused — stops automation polling without reverting

**`rawFulfillRandomWords` intentionally NOT gated:**
- If a VRF request was already sent before pausing, the Chainlink callback must be allowed to land
- Blocking it would leave the round stuck in `drawRequested = true` with no way to settle, locking player funds permanently

**Why `__gap` went from `[38]` to `[37]`:**
- `bool` values in Solidity pack into a 32-byte slot
- `paused` shares a slot with `automationNativePayment` (already declared before it) due to bool packing
- However, to be safe with the upgradeable storage layout, one gap slot is consumed to guarantee no collision with future upgrades

**Post-upgrade flow:**
1. Deploy upgraded `Lottery3` implementation
2. Call `upgradeTo` on the proxy
3. Call `initialize3()` — sets owner, sets `paused = false`
4. Call `startRound()` to begin the first round under Lottery3
5. Call `pauseGame()` at any time to halt the game
6. Call `unpauseGame()` then `startRound()` to resume


---

## [10] Deployed Lottery3 to Sepolia — Upgrade Script & Config

### upgrade3.js

Created `scripts/upgrade3.js` to upgrade the proxy from Lottery2 → Lottery3.

**What it does:**
- Calls `upgrades.upgradeProxy` with `initialize4` as the post-upgrade initializer call
- Logs the pause state after upgrade to confirm `paused = false`
- Sets round duration to 5 minutes via `setRoundDuration(300)`
- Pauses the game immediately via `pauseGame()`
- Prints full contract state: entry fee, round duration, round ID, active status, pause state

**Errors encountered and fixed:**

| Error | Cause | Fix |
|---|---|---|
| `Invalid account: #1 for network: sepolia` | `PLAYER1_PRIVATE_KEY` and `PLAYER2_PRIVATE_KEY` not in `.env` | Added `.filter(Boolean)` to accounts array in `hardhat.config.js` |
| `Cannot read properties of undefined (reading 'getAddress')` | `PROXY_ADDRESS` missing from `.env` | Added `PROXY_ADDRESS=0x09Db62f499eC80Cf668512307D5640Abbb0f8a8b` to `.env` (found in `.openzeppelin/sepolia.json`) |
| `Initializable: contract is already initialized` (first time) | `initialize3` used `reinitializer(3)` but Lottery2 already consumed version 3 | Renamed to `initialize4` with `reinitializer(4)` |
| `Missing initializer calls for one or more parent contracts: OwnableUpgradeable` | OZ upgrades plugin validation requires parent initializer calls | Added `/// @custom:oz-upgrades-validate-as-initializer` annotation and kept `__Ownable_init_unchained()` |
| `execution reverted` on `contract.paused()` after successful upgrade | Artifacts were stale from before recompile | Ran `npx hardhat clean && npx hardhat compile` |
| `Initializable: contract is already initialized` (second time) | Proxy was already on Lottery3 from the previous run, script tried to upgrade again | Split post-upgrade config into a separate `config3.js` script |

---

### config3.js

Created `scripts/config3.js` to run post-upgrade configuration separately from the upgrade itself. This is needed because once the proxy is upgraded, re-running `upgrade3.js` fails since `initialize4` has already been called.

**What it does:**
1. Calls `setRoundDuration(300)` — sets all future rounds to 5 minutes
2. Calls `pauseGame()` — pauses the game so no rounds start automatically after upgrade
3. Prints contract state to confirm everything applied correctly

**Run with:**
```bash
npx hardhat run scripts/config3.js --network sepolia
```

---

## [11] Frontend Updated for Lottery3

### `frontend/lib/abi.js`
- Added `paused` ABI entry so the frontend can read the pause state from the contract:
```js
{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}
```

### `frontend/pages/index.js`

| Change | Detail |
|---|---|
| Added `paused` state | `const [paused, setPaused] = useState(false)` |
| Reset on disconnect | `setPaused(false)` added to `disconnect()` |
| Fetched in `load()` | `const isPaused = await contract.paused()` called every 15 seconds alongside other contract reads |
| Updated `roundStatus` | `"PAUSED"` is now the first check — takes priority over `OPEN`, `DRAW IN PROGRESS`, `CLOSED` |
| Updated `statusColor` | `"PAUSED"` renders in orange `#e67e22` |
| Added paused banner | When `paused === true`, the ticket entry area shows `⏸ GAME PAUSED` with a message instead of the number grid — prevents players from attempting transactions that would revert |

**Paused UI banner:**
```
⏸ GAME PAUSED
The game is temporarily paused. Check back soon.
```

### `frontend/.env.local`
- `NEXT_PUBLIC_CONTRACT_ADDRESS` was already correctly set to the proxy address `0x09Db62f499eC80Cf668512307D5640Abbb0f8a8b` — no change needed


---

## [12] Operational Scripts & Bug Fixes

### New Scripts

**`scripts/pause.js`**
- Checks if game is already paused before calling `pauseGame()` — exits early if already paused to avoid wasting gas on a revert
- Prints contract state after pausing: round ID, active status, ticket count

**`scripts/unpause.js`**
- Checks if game is actually paused before calling `unpauseGame()` — exits early if not paused
- Only calls `startRound()` if no round is currently active — fixed after initial revert caused by trying to start a round when one was already running
- Prints full contract state after unpausing

**`scripts/setduration.js`**
- Sets `roundDuration` to any value via `setRoundDuration()`
- Configure `NEW_DURATION_SECONDS` at the top of the script
- Includes common values as comments:
  ```
  5 minutes  = 300
  10 minutes = 600
  30 minutes = 1800
  1 hour     = 3600
  6 hours    = 21600
  12 hours   = 43200
  24 hours   = 86400
  ```
- Warns that the change only affects future rounds, not the currently active one

**`scripts/rollround.js`**
- Manually triggers `performUpkeep` to force-close an expired round
- Used when Chainlink Automation is not triggering (e.g. out of LINK)
- Encodes `currentRoundId` as `performData` to match what `checkUpkeep` returns
- If round has 0 tickets → calls `_rollEmptyRoundForward` → starts next round
- If round has tickets → requests VRF → settles round

**`scripts/check.js`**
- Read-only script to inspect current contract state
- Prints: pause state, round ID, active/drawRequested/drawn flags, end time, ticket count, entry fee, round duration, rollover pool

**`scripts/checktime.js`**
- Prints raw `endTime` unix timestamp vs current system time
- Shows exact diff in seconds and whether the round is expired on-chain
- Used to debug "Round expired" reverts on `buyTicket`

**`scripts/blocktime.js`**
- Compares Sepolia `block.timestamp` against local system clock
- Used to confirm timestamps are in sync and rule out clock skew as a cause of issues

---

### Bugs Found & Fixed

**Bug: `unpause.js` reverted on `startRound()`**
- Cause: a round was already active when `unpauseGame()` was called, so `startRound()` hit the `"Current round still active"` revert
- Fix: added a check — only call `startRound()` if `!round.active`

**Bug: Frontend always showed "Draw pending..." for TIME LEFT**
- Cause: `round.endTime` is a BigInt from ethers. `Number(bigInt)` silently loses precision on large values, making `diff` come out negative
- Fix: changed `Number(round.endTime)` to `Number(round.endTime.toString())` in the countdown `useEffect`

**Bug: `buyTicket` reverted with "Round expired" on frontend**
- Cause: round 1867 had an `endTime` already in the past — it was started under Lottery1/Lottery2 with a misconfigured `roundDuration` that resulted in an end time that had since passed
- Fix: ran `rollround.js` to manually trigger `performUpkeep`, rolling the expired round forward and starting a fresh round with the correct 5-minute duration

**Bug: TIME LEFT countdown still showed while game was paused**
- Cause: pausing the game does not change `round.endTime` on-chain — the frontend timer kept counting regardless
- Fix: updated TIME LEFT `StatBox` to show `"—"` when `paused === true` instead of the countdown

---

### Why VRF Was Draining LINK With No Active Players

Lottery1 and Lottery2 had no pause mechanism — `_startNewRound()` was called automatically at the end of every round, chaining rounds non-stop. With 1867 rounds accumulated, Chainlink Automation was calling `performUpkeep` every 5 minutes (or whatever the duration was) even with 0 players, burning LINK on every call.

Lottery3's pause logic solves this — when paused, `checkUpkeep` returns `false` so Automation stops polling entirely. The recommended flow going forward:

```
pause → setduration (if needed) → unpause → players enter → round settles → pause again
```

This keeps LINK usage minimal and gives full control over when rounds run.

---

### Owner Control Scripts Summary

| Script | Command | What it does |
|---|---|---|
| `pause.js` | `npx hardhat run scripts/pause.js --network sepolia` | Pauses the game |
| `unpause.js` | `npx hardhat run scripts/unpause.js --network sepolia` | Unpauses and starts a round if none active |
| `setduration.js` | `npx hardhat run scripts/setduration.js --network sepolia` | Changes round duration |
| `rollround.js` | `npx hardhat run scripts/rollround.js --network sepolia` | Manually triggers performUpkeep on expired round |
| `check.js` | `npx hardhat run scripts/check.js --network sepolia` | Reads current contract state |
