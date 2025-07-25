#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import prompts from "prompts";
import chalk from "chalk";
import { execSync } from "child_process";

const SERVICE_OPTIONS = [
  {
    title: "HTS - Hedera Token Service",
    value: "hts",
    description: "For creating and managing tokens on Hedera",
  },
  {
    title: "HSCS - Hedera Smart Contract Service",
    value: "hscs",
    description: "For deploying and interacting with smart contracts",
  },
  {
    title: "HCS - Hedera Consensus Service",
    value: "hcs",
    description: "For message ordering using the Hedera consensus mechanism",
  },
];

const run = async () => {
  const response = await prompts([
    {
      type: "text",
      name: "appName",
      message: "Enter your app name:",
      validate: (name) => (name ? true : "App name is required"),
    },
    {
      type: "multiselect",
      name: "services",
      message: "Select the Hedera services to include in your dapp:",
      choices: SERVICE_OPTIONS,
      min: 1,
      hint: "- SPACE to select. ENTER to submit",
    },
  ]);

  const { appName, services } = response;

  const targetDir = path.join(process.cwd(), appName);
  if (fs.existsSync(targetDir)) {
    console.error(chalk.red("❌ Directory already exists."));
    process.exit(1);
  }

  // Create project folder and copy base files
  fs.mkdirSync(targetDir);
  fs.writeFileSync(
    path.join(targetDir, "README.md"),
    `# ${appName}\n\nGenerated with selected Hedera services: ${services.join(
      ", "
    )}`
  );

  // Optional: Create folders or configs based on selected services
  services.forEach((service: string) => {
    const servicePath = path.join(targetDir, service.toUpperCase());
    fs.mkdirSync(servicePath);
    fs.writeFileSync(
      path.join(servicePath, "README.md"),
      `# ${service.toUpperCase()} Module`
    );
  });

  const envContent = `
    # Hedera Account Info
    HEDERA_ACCOUNT_ID=your-account-id
    HEDERA_PRIVATE_KEY=your-private-key
    HEDERA_NETWORK=testnet

    # Langchain/OpenAI
    GOOGLE_API=your-api-key
    `;

  fs.writeFileSync(`${targetDir}/.env`, envContent.trim());

  console.log(
    chalk.green(
      `✅ Project "${appName}" created with: ${services
        .join(", ")
        .toUpperCase()}`
    )
  );

  // Optional: Initialize NPM
  console.log(chalk.yellow("📦 Initializing npm project..."));
  execSync("npm init -y", { cwd: targetDir, stdio: "inherit" });

  console.log(chalk.green("🎉 Done! Your Hedera AI agent dapp is ready."));
};

run();
