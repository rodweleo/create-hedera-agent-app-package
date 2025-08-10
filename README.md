# create-hedera-agent-app

A command-line tool to scaffold conversational **Hedera agent dApps** using `Next.js`, `LangChain`, and selected **Hedera services** such as HTS, HCS, and more.

This CLI bootstraps your dApp with:

- A chat interface to talk to Hedera via natural language
- Integrated Hedera service tools
- Optional testnet account creation
- Environment variables ready to go

---

## Features

1. Interactive CLI prompts
2. HTS, HCS, and other Hedera tools via LangChain
3. Prebuilt conversational agent for Hedera ops
4. Optional testnet account creation
5. Auto-generates `.env` with keys
6. Clean folder structure with modular services
7. Easily extendable with new tools

---

## Installation

Install globally via npm:

```bash
npm install -g create-hedera-agent-app
```

You'll be prompted for:

1. App name
2. Selected Hedera services (HTS, HCS, HSCS, etc)
3. Whether to create a Hedera Testnet Account

## How to use (Example)

```bash
$ create-hedera-agent-app

? Enter your app name: my-agent-dapp
? Select the Hedera services to include: HTS, HCS
? Create a Hedera Testnet account for the DApp? No (Default)

✔ Creating base application (my-agent-dapp)...
✔ Adding HTS and HCS tools...
✔ Creating Hedera Testnet account...
✔ Generating .env file...
Project "my-agent-dapp" ready!

```

# Demo
## Part 1: Installing & bootstrapping an Hedera agent dApp
https://www.loom.com/share/f638a9ca991b482f8bebf0d558f0ffa0?sid=76d1b79a-6c5f-4f8b-bc53-ba0213f2d5df

## Part 2: Using the prebuilt conversational agent to interact with Hedera
[https://www.loom.com/share/f638a9ca991b482f8bebf0d558f0ffa0?sid=76d1b79a-6c5f-4f8b-bc53-ba0213f2d5df](https://www.loom.com/share/5f8c211d598346f8a75e335c40010d33?sid=f707575b-de0f-40e5-8dcf-e9ebd6ff5aa9)

---

## Supported Services

1. HTS (Hedera Token Service)
2. HCS (Hedera Consensus Service)

## Future plans
1. Add more Hedera Service
     - HSCS (Hedera Smart Contract Service)
     - HAS (Hedera Account Service)
