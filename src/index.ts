#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import prompts from "prompts";
import chalk from "chalk";
import { simpleGit } from "simple-git";
import os from "os";
import { createHederaTestnetAccount } from "./hedera";
import cliProgress from "cli-progress";

const SERVICE_OPTIONS = [
  {
    title: "HTS - Hedera Token Service",
    value: "Hts",
    description: "For creating and managing tokens on Hedera",
  },
  {
    title: "HCS - Hedera Consensus Service",
    value: "Hcs",
    description: "For message ordering using the Hedera consensus mechanism",
  },
];

// BASE APP GITHUB DEFINITION
const BASE_APP_REPO_URL =
  "https://github.com/rodweleo/create-hedera-agent-starter-app.git";
const baseAppTmpDir = path.join(
  os.tmpdir(),
  `base-app-cloned-repo-${Date.now()}`
);

const HEDERA_TOOLS_REPO_URL = "https://github.com/rodweleo/hedera-tools.git";
const SPARSE_FOLDER = "src/langchain/tools";

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
      message: "Select the Hedera services to include:",
      choices: SERVICE_OPTIONS,
      min: 1,
    },
    {
      type: "confirm",
      name: "createTestnetAccount",
      message: "Create an Hedera Testnet account for the DApp ?",
      initial: false,
    },
  ]);

  const { appName, services, createTestnetAccount } = response;
  const targetDir = path.join(process.cwd(), appName);
  const git = simpleGit();

  console.log(`Creating base application (${appName})...`);
  const baseCloneBar = new cliProgress.SingleBar(
    { format: "Generating Base App | {bar} | {percentage}% " },
    cliProgress.Presets.shades_classic
  );
  baseCloneBar.start(1, 0);
  await git.clone(BASE_APP_REPO_URL, baseAppTmpDir, ["--depth=1"]);
  baseCloneBar.update(1);
  baseCloneBar.stop();
  console.log(`Base application (${appName}) created!`);

  if (fs.existsSync(targetDir)) {
    console.error(chalk.red("Error: Directory already exists."));
    process.exit(1);
  }

  fs.mkdirSync(targetDir);
  const copyBar = new cliProgress.SingleBar(
    { format: "Loading base app files | {bar} | {percentage}%" },
    cliProgress.Presets.shades_classic
  );
  copyBar.start(1, 0);
  await fs.copy(baseAppTmpDir, targetDir);
  copyBar.update(1);
  copyBar.stop();

  const hederaToolsTmpDir = path.join(
    os.tmpdir(),
    `hedera-tools-${Date.now()}`
  );

  console.log(chalk.blue(`Adding Hedera services...`));

  const toolsCloneBar = new cliProgress.SingleBar(
    { format: "Loading Hedera services | {bar} | {percentage}% " },
    cliProgress.Presets.shades_classic
  );
  toolsCloneBar.start(1, 0);
  await git.clone(HEDERA_TOOLS_REPO_URL, hederaToolsTmpDir, [
    "--depth=1",
    "--filter=blob:none",
    "--sparse",
  ]);
  toolsCloneBar.update(1);
  toolsCloneBar.stop();

  const hederaToolsRepoGit = simpleGit(hederaToolsTmpDir);
  await hederaToolsRepoGit.raw(["sparse-checkout", "init", "--cone"]);
  await hederaToolsRepoGit.raw(["sparse-checkout", "set", SPARSE_FOLDER]);

  // The tools index file path
  const indexDestinationFolderPath = path.join(
    `${targetDir}/src/hedera/langchain/tools`,
    "index.ts"
  );

  await fs.ensureDir(path.dirname(indexDestinationFolderPath));

  const exportStatements: string[] = [];
  const serviceProgress = new cliProgress.SingleBar(
    {
      format:
        "Loading Hedera services | {bar} | {percentage}% || {value}/{total} services",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );
  serviceProgress.start(services.length, 0);
  await Promise.all(
    services.map(async (service: string) => {
      const sourceFolder = path.join(hederaToolsTmpDir, SPARSE_FOLDER, service);
      const serviceDestinationFolder = path.join(
        `${targetDir}/src/hedera/langchain/tools`,
        service.toLowerCase()
      );
      if (await fs.pathExists(sourceFolder)) {
        await fs.copy(sourceFolder, serviceDestinationFolder);
        console.log(
          chalk.green(`\nSUCCESS: Added ${service.toUpperCase()} services.`)
        );
        exportStatements.push(`export * from './${service.toLowerCase()}'`);
      } else {
        console.warn(
          chalk.yellow(`WARN: Folder for ${service.toUpperCase()} not found.`)
        );
      }

      serviceProgress.increment();
    })
  );
  serviceProgress.stop();

  // All export statements written once
  await fs.writeFile(
    indexDestinationFolderPath,
    exportStatements.join("\n") + "\n"
  );

  await fs.ensureFile(`${targetDir}/src/hedera/langchain/index.ts`);
  const langchainIndexFilePath = path.join(
    `${targetDir}/src/hedera/langchain`,
    "index.ts"
  );
  const finalToolImports = services
    .map((s: string) => `createHedera${s}Tools`)
    .join(", ");
  const finalToolCreation = services
    .map((s: string) => `...createHedera${s}Tools(hederaKit)`)
    .join(", ");
  const langchainIndexFileContent = `
    import { Tool } from "@langchain/core/tools";
    import HederaAgentKit from "../agent";
    import * as dotenv from "dotenv";
    import { ${finalToolImports} } from "./tools"

    dotenv.config();

    export function createHederaTools(hederaKit: HederaAgentKit): Tool[] {
      return [${finalToolCreation}];
    }
  `;
  await fs.writeFile(langchainIndexFilePath, langchainIndexFileContent);

  // Cleaning up temporary directory
  await fs.remove(baseAppTmpDir);

  let createHederaTestnetAccountReceipt;

  if (createTestnetAccount) {
    console.log("--- Creating Hedera testnet account ---");
    createHederaTestnetAccountReceipt = await createHederaTestnetAccount();

    if (createHederaTestnetAccountReceipt) {
      console.log(
        chalk.green("SUCCESS: Hedera account created successfully! \n")
      );

      console.log(
        chalk.green(`
        ------------ HEDERA ACCOUNT DETAILS ------------
        Account Creation Status: ${createHederaTestnetAccountReceipt.status} \n
        Account ID : ${createHederaTestnetAccountReceipt.accountId} \n
        Private Key: ${createHederaTestnetAccountReceipt.privateKey} \n
        Public Key: ${createHederaTestnetAccountReceipt.publicKey}
        `)
      );
    }
  }

  const env = `
NEXT_PUBLIC_HASHCONNECT_PROJECT_ID = ''
ACCOUNT_ID = '${
    createHederaTestnetAccountReceipt
      ? createHederaTestnetAccountReceipt.accountId
      : ""
  }'
PRIVATE_KEY = '${
    createHederaTestnetAccountReceipt
      ? createHederaTestnetAccountReceipt.privateKey
      : ""
  }'
HEDERA_NETWORK= 'testnet'
GOOGLE_API_KEY= 'your-google-api-key'
  `.trim();

  fs.writeFileSync(path.join(targetDir, ".env"), env);

  console.log(
    chalk.green(
      `\nProject "${appName}" created with Hedera services: ${services.join(
        ", "
      )}`
    )
  );
  console.log(
    chalk.blue(`\n
    Now, let's set up the application and run it: 
    1. cd ${appName}
    2. Set up the environment variables (Hedera Account ID, Hedera Account Private Key, Wallet connet Project ID & Google Gemini API Key).
    2. run 'npm install' to install all the dependencies
    3. run 'npm run dev' to start the application in DEV mode
    `)
  );
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
