const chalk = require('chalk');
const connect = require('../../utils/connect');
const inspectResponse = require('../../utils/inspect-response');
const { assertCredentials } = require('../../utils/credentials');
const { askYesNoQuestion } = require('../../utils/readline');
const { DEFAULT_NETWORK } = require('../../config');

module.exports = {
    command: 'delete-account <account-id> <beneficiary-id>',
    aliases: ['delete'],
    desc: 'Delete account, sending remaining NEAR to a beneficiary',
    builder: (yargs) => yargs
        .option('signWithLedger', {
            alias: ['useLedgerKey'],
            desc: 'Use Ledger for signing',
            type: 'boolean',
            default: false
        })
        .option('ledgerPath', {
            desc: 'HD key path',
            type: 'string',
            default: "44'/397'/0'/0'/1'"
        })
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet, custom',
            type: 'string',
            default: DEFAULT_NETWORK
        })
        .option('force', {
            desc: 'Forcefully delete account even if it is unsafe to do so',
            type: 'boolean',
            default: false,
        }),
    handler: deleteAccount
};

const confirmDelete = function (accountId, beneficiaryId) {
    return askYesNoQuestion(
        chalk`This will {bold.red delete ${accountId}}, transferring {bold.white the remaining NEAR tokens} to the {bold.green beneficiary ${beneficiaryId}}. This action will {bold.red NOT transfer} {bold.white FTs, NFTs} or other assets the account holds, make sure you to {bold.white manually transfer} them before deleting or they will be {bold.red lost}. Do you want to proceed? {bold.green (y/n)} `,
        false);
};

async function deleteAccount(options) {
    await assertCredentials(options.accountId, options.networkId, options.keyStore, options.useLedgerKey);
    const near = await connect(options);
    const beneficiaryAccount = await near.account(options.beneficiaryId);

    try {
        await beneficiaryAccount.state();
    } catch (e) {
        // beneficiary account does not exist if there is no state
        if (e.type === 'AccountDoesNotExist') {
            console.error(`Beneficiary account ${options.beneficiaryId} does not exist. Please create it before proceeding.`);
            return;
        } else {
            throw e;
        }
    }

    if (!options.force && !(await confirmDelete(options.accountId, options.beneficiaryId))) {
        return console.log(chalk`{bold.white Deletion of account {bold.blue  ${options.accountId}} was {bold.red cancelled}}`);
    }

    const account = await near.account(options.accountId);
    console.log(`Deleting account ${options.accountId}, beneficiary: ${options.beneficiaryId}`);

    try {
        const result = await account.deleteAccount(options.beneficiaryId);
        console.log(`Account ${options.accountId} for network "${options.networkId}" was deleted.`);
        inspectResponse.prettyPrintResponse(result, options);
    } catch (error) {
        switch (error.type) {
        case 'KeyNotFound':
            console.log(chalk`\n{bold.white ${options.accountId}} was not found in the network ${options.networkId}\n`);
            process.exit(1);
            break;
        case 'SignerDoesNotExist':
            // On re-sending a transaction, the signer might have been deleted already
            console.log('RPC returned an error, please check if the account is deleted and try again');
            process.exit(0);
            break;
        default:
            throw error;
        }
    }
}