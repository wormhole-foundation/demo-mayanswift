# Mayan Swift Demo 

This guide explains how to integrate the Wormhole Mayan Swift Route from the Wormhole SDK into your application. This Route abstracts the complexity of cross-chain token swaps, handling route discovery, fee estimation, and transaction construction.

> [!IMPORTANT]
> Mayan Swap only works on **Mainnet**. Testing on testnet environments will fail.

## Prerequisites

Ensure you have the following installed:

- [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed on your machine
- A wallet with a private key, funded with native tokens on Mainnet for gas fees

## Setup and Usage

Follow these steps to clone the repository, set up environment variables, and perform token transfers.

**1. Clone the Repository**

```bash
git clone https://github.com/wormhole-foundation/demo-mayanswift.git
cd demo-mayanswift
```

**2. Install Dependencies**

```bash
npm install
```

**3. Set Up Environment Variables**

Create a `.env` file in the root directory and add your private keys:

```bash
ETH_PRIVATE_KEY="INSERT_PRIVATE_KEY"
SOL_PRIVATE_KEY="INSERT_PRIVATE_KEY"
```

- **ETH_PRIVATE_KEY** - private key for an Ethereum-compatible wallet
- **SOL_PRIVATE_KEY** - private key for a Solana wallet

## Mayan Swift Swap

To initiate a token transfer across chains, using the Mayan Swift Route run:

```bash
npm run swap
```

## Configuration

You can customize the following options within the scripts:

- **Source and Destination Chains** - modify `sendChain` and `destChain` in `swap.ts`
- **Amount and Transfer Settings** - adjust `amount` to suit your needs

## Troubleshooting

- **Missing environment variables** - ensure `.env` is correctly set up and keys are valid
- **Unsupported platform error** - verify that the chains are compatible and supported by the Wormhole SDK