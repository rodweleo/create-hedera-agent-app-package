import {
  AccountCreateTransaction,
  AccountId,
  Client,
  Hbar,
  PrivateKey,
  TransactionReceipt,
} from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

const MY_ACCOUNT_ID = AccountId.fromString(process.env.MY_ACCOUNT_ID!);
const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(
  process.env.MY_PRIVATE_KEY!
);

export const hederaClient = Client.forTestnet();
hederaClient.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

interface AccountCreationResult {
  accountId: AccountId | null;
  privateKey: PrivateKey;
  status: any;
}

export const createHederaTestnetAccount = async (
  hederaClient: Client
): Promise<AccountCreationResult | null> => {
  try {
    const ed25519PrivateKey = PrivateKey.generateED25519();
    const ed25519PublicKey = ed25519PrivateKey.publicKey;

    const transaction = new AccountCreateTransaction()
      .setKeyWithoutAlias(ed25519PublicKey)
      .setInitialBalance(new Hbar(1000));

    //Sign the transaction with the client operator private key and submit to a Hedera network
    const txResponse = await transaction.execute(hederaClient);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(hederaClient);

    //Get the account ID
    const newAccountId = receipt.accountId;

    console.log("The new account ID is " + newAccountId);

    return {
      accountId: receipt.accountId,
      privateKey: ed25519PrivateKey,
      status: receipt.status,
    };
  } catch (e: any) {
    console.log(`Failed to create Hedera wallet: ${e.message}`);
    return null;
  }
};
