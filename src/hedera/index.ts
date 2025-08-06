// import {
//   AccountCreateTransaction,
//   AccountId,
//   Client,
//   Hbar,
//   PrivateKey,
//   PublicKey,
//   TransactionReceipt,
// } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

// export const hederaClient = Client.forTestnet();
// hederaClient.setOperator(
//   process.env.MY_ACCOUNT_ID!,
//   process.env.MY_PRIVATE_KEY!
// );
// hederaClient.setDefaultMaxTransactionFee(new Hbar(100));
// hederaClient.setDefaultMaxQueryPayment(new Hbar(50));

interface AccountCreationResult {
  accountId: null;
  privateKey: null;
  status: any;
  publicKey: null;
}

export const createHederaTestnetAccount =
  async (): Promise<AccountCreationResult | null> => {
    try {
      // const newAccountPrivateKey = PrivateKey.generateED25519();
      // const newAccountPublicKey = newAccountPrivateKey.publicKey;

      // const transaction = new AccountCreateTransaction()
      //   .setKeyWithoutAlias(newAccountPublicKey)
      //   .setInitialBalance(new Hbar(50));

      // //Sign the transaction with the client operator private key and submit to a Hedera network
      // const txResponse = await transaction.execute(hederaClient);

      // //Request the receipt of the transaction
      // const receipt = await txResponse.getReceipt(hederaClient);

      // //Get the account ID
      // const newAccountId = receipt.accountId;

      // console.log("The new Hedera account ID is " + newAccountId);

      return {
        accountId: null,
        privateKey: null,
        status: null,
        publicKey: null,
      };
    } catch (e: any) {
      console.log(`Failed to create Hedera wallet: ${e.message}`);
      return null;
    }
  };
