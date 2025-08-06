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

---

## Supported Services

1. HTS (Hedera Token Service)
2. HCS (Hedera Consensus Service)
