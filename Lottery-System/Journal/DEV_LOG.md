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
