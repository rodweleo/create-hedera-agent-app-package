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

  // Now copy only folders that match the selected service names
  for (const service of services) {
    const sourceFolder = path.join(tmpDir, SPARSE_FOLDER, service);
    const serviceDestinationFolder = path.join(
      `${targetDir}/src/hedera/langchain/tools`,
      service
    );

    if (fs.existsSync(sourceFolder)) {
      fs.copySync(sourceFolder, serviceDestinationFolder);
      console.log(
        chalk.green(`SUCCESS: Added ${service.toUpperCase()} tools.`)
      );
    } else {
      console.warn(chalk.yellow(`WARN: Folder for ${service} not found.`));
    }

    fs.ensureFile(`${targetDir}/src/hedera/langchain/tools/index.ts`);

    const indexDestinationFolderPath = path.join(
      `${targetDir}/src/hedera/langchain/tools`,
      "index.ts"
    );

    const exportStatement = `export * from './${service}'`;
    await fs.appendFile(indexDestinationFolderPath, `${exportStatement}\n`);

    //working on the index file in the langchain root folder
    fs.ensureFile(`${targetDir}/src/hedera/langchain/index.ts`);

    const langchainIndexFilePath = path.join(
      `${targetDir}/src/hedera/langchain`,
      "index.ts"
    );

    const finalToolImports = services
      .map((s: string) => {
        return `createHedera${s}Tools`;
      })
      .join(", ");

    const finalToolCreation = services
      .map((s: string) => {
        return `...createHedera${s}Tools(hederaKit)`;
      })
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
  }

  fs.removeSync(tmpDir);
  console.log(chalk.gray("SUCCESS: Cleaned up temporary files"));

  setTimeout(() => {}, 2000);

  let createHederaTestnetAccountReceipt;

  if (createTestnetAccount) {
    console.log("---Creating Hedera testnet account...---");
    createHederaTestnetAccountReceipt = await createHederaTestnetAccount(
      hederaClient
    );

    if (createHederaTestnetAccountReceipt) {
      console.log(
        chalk.green("SUCCESS: Hedera account created successfully! \n\n\n")
      );

      console.log(
        chalk.green(`
        ------------ HEDERA ACCOUNT DETAILS ------------
        Account ID : ${createHederaTestnetAccountReceipt.accountId} \n
        Private Key: ${createHederaTestnetAccountReceipt.privateKey.toString()}
        `)
      );
    }
  }

  const env = `
HEDERA_ACCOUNT_ID = '${createHederaTestnetAccountReceipt?.accountId}'
HEDERA_PRIVATE_KEY = '${createHederaTestnetAccountReceipt?.privateKey}'
HEDERA_NETWORK=testnet
GOOGLE_API=your-google-api-key
  `.trim();

  fs.writeFileSync(path.join(targetDir, ".env"), env);

  console.log(
    chalk.green(`\n"${appName}" created with services: ${services.join(", ")}`)
  );
  console.log(chalk.blue(`\ncd ${appName} && start building your dApp!`));
};

run();
