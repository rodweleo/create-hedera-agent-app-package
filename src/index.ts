#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import prompts from "prompts";
import chalk from "chalk";
import { execSync } from "child_process";

const SERVICE_OPTIONS = [
  {
    title: "HAM - Hedera Account Service",
    value: "Ham",
    description: "For creating and managing accounts on Hedera",
  },
  {
    title: "HTS - Hedera Token Service",
    value: "Hts",
    description: "For creating and managing tokens on Hedera",
  },
  {
    title: "HSCS - Hedera Smart Contract Service",
    value: "Hscs",
    description: "For deploying and interacting with smart contracts",
  },
  {
    title: "HCS - Hedera Consensus Service",
    value: "Hcs",
    description: "For message ordering using the Hedera consensus mechanism",
  },
];

const STARTER_APP_PATH = path.join(
  __dirname,
  "..",
  "..",
  "create-hedera-agent-starter-app"
);

const generateEnvContent = (services: string[]) => {
  const baseEnv = `# Hedera Network Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=your-account-id-here
HEDERA_PRIVATE_KEY=your-private-key-here
HEDERA_PUBLIC_KEY=your-public-key-here

# Hedera Node Configuration
HEDERA_NODE_ID=0.0.3
HEDERA_NODE_ACCOUNT=0.0.3

# AI/LLM Configuration
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# LangChain Configuration
LANGCHAIN_API_KEY=your-langchain-api-key-here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com

# Database Configuration (if needed)
DATABASE_URL=your-database-url-here

# Optional: External Services
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=your-pinecone-environment-here

# Web3 Configuration
WEB3_PROVIDER_URL=your-web3-provider-url-here

# Application Configuration
NODE_ENV=development
PORT=3000
`;

  // Add service-specific environment variables
  const serviceSpecificEnv = services
    .map((service) => {
      switch (service) {
        case "Hts":
          return `
# Hedera Token Service Configuration
TOKEN_ID=your-token-id-here
TOKEN_TREASURY_ACCOUNT=your-treasury-account-here
TOKEN_SUPPLY_KEY=your-supply-key-here
TOKEN_ADMIN_KEY=your-admin-key-here
TOKEN_FREEZE_KEY=your-freeze-key-here
TOKEN_KYC_KEY=your-kyc-key-here
TOKEN_WIPE_KEY=your-wipe-key-here`;
        case "Hcs":
          return `
# Hedera Consensus Service Configuration
HCS_TOPIC_ID=your-topic-id-here
HCS_SUBMIT_KEY=your-submit-key-here
HCS_ADMIN_KEY=your-admin-key-here`;
        case "Hscs":
          return `
# Hedera Smart Contract Service Configuration
CONTRACT_ID=your-contract-id-here
CONTRACT_BYTECODE=your-contract-bytecode-here
CONTRACT_GAS_LIMIT=300000
CONTRACT_INITIAL_BALANCE=0`;
        case "Ham":
          return `
# Hedera Account Management Configuration
ACCOUNT_CREATOR_ID=your-creator-account-id-here
ACCOUNT_CREATOR_KEY=your-creator-private-key-here
INITIAL_BALANCE=1000000000`;
        default:
          return "";
      }
    })
    .join("");

  return baseEnv + serviceSpecificEnv;
};

const createServiceDirectories = (targetDir: string, services: string[]) => {
  services.forEach((service: string) => {
    const servicePath = path.join(
      targetDir,
      "src",
      "services",
      service.toLowerCase()
    );
    fs.mkdirSync(servicePath, { recursive: true });

    // Create service-specific files
    const serviceContent = `// ${service} Service Implementation
export class ${service}Service {
  constructor() {
    // Initialize ${service} service
  }
  
  // Add your ${service} methods here
}`;

    fs.writeFileSync(
      path.join(servicePath, `${service.toLowerCase()}.service.ts`),
      serviceContent
    );

    // Create index file for easy imports
    fs.writeFileSync(
      path.join(servicePath, "index.ts"),
      `export * from './${service.toLowerCase()}.service';`
    );
  });
};

const run = async () => {
  console.log(chalk.blue("🚀 Welcome to Hedera AI Agent Starter Kit!"));
  console.log(
    chalk.gray(
      "This will create a new AI agent project with Hedera integration.\n"
    )
  );

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
      message: "Select the Hedera services to include in your AI agent:",
      choices: SERVICE_OPTIONS,
      min: 1,
      hint: "- SPACE to select. ENTER to submit",
    },
  ]);

  const { appName, services } = response;

  if (!appName || !services || services.length === 0) {
    console.log(chalk.red("❌ Setup cancelled."));
    process.exit(0);
  }

  const targetDir = path.join(process.cwd(), appName);

  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`❌ Directory "${appName}" already exists.`));
    process.exit(1);
  }

  try {
    console.log(chalk.yellow("📥 Copying starter app template..."));

    // Copy the starter app directory
    fs.copySync(STARTER_APP_PATH, targetDir);

    // Remove .git directory to start fresh
    fs.removeSync(path.join(targetDir, ".git"));

    console.log(
      chalk.yellow("🔧 Customizing project for selected services...")
    );

    // Create services directory structure
    createServiceDirectories(targetDir, services);

    // Generate comprehensive environment file
    const envContent = generateEnvContent(services);
    fs.writeFileSync(path.join(targetDir, ".env.example"), envContent.trim());

    // Create actual .env file (same as example for now)
    fs.writeFileSync(path.join(targetDir, ".env"), envContent.trim());

    // Update package.json with project name
    const packageJsonPath = path.join(targetDir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.name = appName.toLowerCase().replace(/\s+/g, "-");
    packageJson.description = `AI Agent with Hedera integration - ${services.join(
      ", "
    )}`;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Update README with project-specific information
    const readmeContent = `# ${appName}

An AI agent built with Hedera integration using the following services:
${services.map((service) => `- ${service}`).join("\n")}

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure your environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your actual values
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Environment Variables

Make sure to configure all required environment variables in your \`.env\` file. See \`.env.example\` for all available options.

## Hedera Services

This project includes the following Hedera services:
${services
  .map(
    (service) =>
      `- **${service}**: ${
        SERVICE_OPTIONS.find((s) => s.value === service)?.description
      }`
  )
  .join("\n")}

## Getting Started with Hedera

1. Create a Hedera account at [portal.hedera.com](https://portal.hedera.com)
2. Get your account ID and private key
3. Update the \`.env\` file with your credentials
4. Start building your AI agent!

## Learn More

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera Portal](https://portal.hedera.com/)
- [Next.js Documentation](https://nextjs.org/docs)
`;

    fs.writeFileSync(path.join(targetDir, "README.md"), readmeContent);

    console.log(chalk.green(`✅ Project "${appName}" created successfully!`));
    console.log(chalk.blue("\n📁 Project structure:"));
    console.log(chalk.gray(`   ${targetDir}/`));
    console.log(
      chalk.gray("   ├── src/services/     # Hedera service implementations")
    );
    console.log(chalk.gray("   ├── .env              # Environment variables"));
    console.log(chalk.gray("   ├── .env.example      # Environment template"));
    console.log(chalk.gray("   └── README.md         # Project documentation"));

    console.log(chalk.yellow("\n📦 Installing dependencies..."));
    execSync("npm install", { cwd: targetDir, stdio: "inherit" });

    console.log(chalk.green("\n🎉 Your Hedera AI agent is ready!"));
    console.log(chalk.blue("\nNext steps:"));
    console.log(chalk.gray(`   1. cd ${appName}`));
    console.log(chalk.gray("   2. Edit .env with your Hedera credentials"));
    console.log(chalk.gray("   3. npm run dev"));
    console.log(chalk.gray("   4. Start building your AI agent!"));
  } catch (error) {
    console.error(chalk.red("❌ Error creating project:"), error);
    process.exit(1);
  }
};

run();
