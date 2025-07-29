#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import prompts from "prompts";
import chalk from "chalk";
import { simpleGit } from "simple-git";
import os from "os";
import { createHederaTestnetAccount, hederaClient } from "./hedera";

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

const REPO_URL = "https://github.com/rodweleo/hedera-tools.git";
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
      initial: true,
    },
  ]);

  const { appName, services, createTestnetAccount } = response;
  const targetDir = path.join(process.cwd(), appName);

  if (fs.existsSync(targetDir)) {
    console.error(chalk.red("Error: Directory already exists."));
    process.exit(1);
  }

  fs.mkdirSync(targetDir);

  const tmpDir = path.join(os.tmpdir(), `hedera-tools-${Date.now()}`);
  const git = simpleGit();

  console.log(chalk.blue("Adding selected tools..."));

  await git.clone(REPO_URL, tmpDir, [
    "--depth=1",
    "--filter=blob:none",
    "--sparse",
  ]);

  const repoGit = simpleGit(tmpDir);
  await repoGit.raw(["sparse-checkout", "init", "--cone"]);
  await repoGit.raw(["sparse-checkout", "set", SPARSE_FOLDER]);

  // Prepare the tools index file path
  const indexDestinationFolderPath = path.join(
    `${targetDir}/src/hedera/langchain/tools`,
    "index.ts"
  );
  // Ensure the directory exists
  await fs.ensureDir(path.dirname(indexDestinationFolderPath));

  // Prepare export statements and copy folders in parallel
  const exportStatements: string[] = [];
  await Promise.all(
    services.map(async (service: string) => {
      const sourceFolder = path.join(tmpDir, SPARSE_FOLDER, service);
      const serviceDestinationFolder = path.join(
        `${targetDir}/src/hedera/langchain/tools`,
        service.toLowerCase()
      );
      if (await fs.pathExists(sourceFolder)) {
        await fs.copy(sourceFolder, serviceDestinationFolder);
        console.log(
          chalk.green(`SUCCESS: Added ${service.toUpperCase()} tools.`)
        );
        exportStatements.push(`export * from './${service.toLowerCase()}'`);
      } else {
        console.warn(chalk.yellow(`WARN: Folder for ${service} not found.`));
      }
    })
  );

  // Write all export statements at once
  await fs.writeFile(
    indexDestinationFolderPath,
    exportStatements.join("\n") + "\n"
  );

  // After the loop, generate the langchain index file ONCE
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

  // Clean up temporary directory asynchronously
  await fs.remove(tmpDir);
  console.log(chalk.gray("SUCCESS: Cleaned up temporary files"));

  let createHederaTestnetAccountReceipt;

  if (createTestnetAccount) {
    console.log("--- Creating Hedera testnet account ---");
    createHederaTestnetAccountReceipt = await createHederaTestnetAccount(
      hederaClient
    );

    if (createHederaTestnetAccountReceipt) {
      console.log(
        chalk.green("SUCCESS: Hedera account created successfully! \n")
      );

      console.log(
        chalk.green(`
        ------------ HEDERA ACCOUNT DETAILS ------------
        Account Creation Status: ${createHederaTestnetAccountReceipt.status} \n
        Account ID : ${createHederaTestnetAccountReceipt.accountId} \n
        Private Key: ${createHederaTestnetAccountReceipt.privateKey.toString()} \n
        Public Key: ${createHederaTestnetAccountReceipt.publicKey}
        `)
      );
    }
  }

  const env = `
HEDERA_ACCOUNT_ID = '${
    createHederaTestnetAccountReceipt
      ? createHederaTestnetAccountReceipt.accountId
      : ""
  }'
HEDERA_PRIVATE_KEY = '${
    createHederaTestnetAccountReceipt
      ? createHederaTestnetAccountReceipt.privateKey
      : ""
  }'
HEDERA_NETWORK=testnet
GOOGLE_API=your-google-api-key
  `.trim();

  fs.writeFileSync(path.join(targetDir, ".env"), env);

  console.log(
    chalk.green(
      `\nProject "${appName}" created with services: ${services.join(", ")}`
    )
  );
  console.log(
    chalk.blue(`\n
    Now, let's set up the application and run it: 
    1. cd ${appName}
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
