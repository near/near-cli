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
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet',
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

const confirmDelete = function () {
    return askYesNoQuestion(
        chalk`This will {bold.white delete your account}. The beneficiary account must {bold.white already exists}. This deleting action will {bold.red NOT} transfer {bold.white FTs, NFTs} or other assets the account holds. You need to {bold.white manually transfer all assets} prior to deleting the account since this action will {bold.white only transfer the available NEAR tokens}. Do you want to proceed? {bold.green (y/n)} `,
        false);
};

async function deleteAccount(options) {
    await assertCredentials(options.accountId, options.networkId, options.keyStore);
    const near = await connect(options);
    const beneficiaryAccount = await near.account(options.beneficiaryId);

    try {
        await beneficiaryAccount.state();
    } catch (e) {
        // beneficiary account does not exist if there is no state
        if (e.type === 'AccountDoesNotExist') {
            console.error(`Beneficiary account ${options.beneficiaryId} does not exist. Please create the account to transfer Near tokens.`);
            return;
        } else {
            throw e;
        }
    }

    if (options.force || await confirmDelete()) {
        const account = await near.account(options.accountId);
        console.log(`Deleting account ${options.accountId}, beneficiary: ${options.beneficiaryId}`);
        const result = await account.deleteAccount(options.beneficiaryId);
        console.log(`Account ${options.accountId} for network "${options.networkId}" was deleted.`);
        inspectResponse.prettyPrintResponse(result, options);
    } else {
        console.log(chalk`{bold.white Deletion of account {bold.blue  ${options.accountId}} was {bold.red cancelled}}`);
    }
}