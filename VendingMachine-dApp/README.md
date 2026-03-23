# Vending Machine dApp

This is a decentralized application (dApp) built to explore how smart contracts talk to a web frontend. I built this to understand the "bridge" that connects blockchain logic to a user-friendly interface.

## Project Goals
The main purpose of this project was to master three core concepts:

1.  **Understanding ABIs**: Learning that an **ABI (Application Binary Interface)** is the essential "instruction manual." It tells our JavaScript exactly which functions exist on the blockchain and what data they need.
2.  **Working with ethers.js**: Using this library as the engine to connect to **MetaMask**, sign transactions, and handle the math for sending ETH.
3.  **Real-World Interaction**: Moving beyond just reading data to actually sending "payable" transactions (sending 2 ETH per coke) to the network.

## How It's Built
* **The Smart Contract**: This is an **ABC project**. The Vending Machine logic was sourced from the **ABC official Gitbook**. It manages inventory and handles the purchase math.
* **The Frontend**: A clean, simple HTML/JS setup that doesn't require complex frameworks, making it easier to see the underlying logic.
* **The Connection**: We use `ethers.js` to create a "Contract Object" in the browser, which lets us trigger the `purchase` function with a button click.

## Smart Contract

The `VendingMachine` contract manages a coke inventory:

- **`getVendingMachineBalance()`** — returns current stock
- **`restock(uint amount)`** — owner-only, adds to inventory
- **`purchase(uint amount)`** — payable, costs `0.00001 ETH` per unit

Deployed on Sepolia at `0xB266590c076742C52D790786D16aAED5F1665685`.

## Key Takeaways
* **The Bridge**: Without the ABI, the website is "blind" to the contract.
* **Wallet Integration**: Learned how to request account access and use a "Signer" to authorize blockchain actions.
* **Wei vs ETH**: Gained experience using utility functions to convert human-readable ETH into the "Wei" units that the blockchain requires.

## Screenshot

![Vending Machine dApp](./Screenshot%20from%202026-03-22%2021-20-22.png)
