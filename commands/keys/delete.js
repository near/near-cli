const chalk = require('chalk');
const connect = require('../../utils/connect');
const inspectResponse = require('../../utils/inspect-response');
const { assertCredentials } = require('../../utils/credentials');
const { askYesNoQuestion } = require('../../utils/readline');
const { DEFAULT_NETWORK } = require('../../config');

module.exports = {
    command: 'delete-key <account-id> <access-key>',
    desc: 'Delete access key',
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
            desc: 'Forcefully delete key even if it is unsafe to do so',
            type: 'boolean',
            default: false,
        }),
    handler: deleteAccessKey
};

async function deleteAccessKey(options) {
    await assertCredentials(options.accountId, options.networkId, options.keyStore, options.useLedgerKey);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const approval = await isAllApprovalsGranted(account, options.accessKey);

    if (!options.force && !approval) {
        console.log(chalk`Deletion of {bold.white ${options.accessKey}} key on {bold.white ${options.accountId}} was {bold.red canceled}}`);
    }

    // forced or approved
    console.log(chalk`Deleting key {bold.white ${options.accessKey}} on {bold.white ${options.accountId}.}`);

    try {
        const result = await account.deleteKey(options.accessKey);
        inspectResponse.prettyPrintResponse(result, options);
    } catch (error) {
        if (error.type !== 'DeleteKeyDoesNotExist') throw error;
        console.log(chalk`\nKey {bold.white ${options.accessKey}} does {bold.red not exist} on account {bold.white ${options.accountId}}.`);
    }
}

function confirmDelete(accessKey) {
    return askYesNoQuestion(
        chalk`{bold.white Key {bold.blue ${accessKey}} is a Full Access key. Make sure it's not your recovery method. Do you want to proceed? {bold.green (y/n) }}`,
        false);
}

function confirmLock(accountId, accessKey) {
    return askYesNoQuestion(
        chalk`{bold.white Key {bold.blue ${accessKey}} is the last Full Access key on your account. In case of deleting you will not be able to restore access to the account {bold.blue ${accountId}}. Do you want to proceed? {bold.green (y/n) }}`,
        false);
}

async function isAllApprovalsGranted(account, accessKey) {
    let accessKeys = await account.getAccessKeys();
    let fullAccessKeys = accessKeys.filter(accessKey => accessKey.access_key.permission === 'FullAccess');

    if (fullAccessKeys.find(key => key.public_key === accessKey)) {
        // asks for approval if user is deleting Full Access Key
        if (!await confirmDelete(accessKey)) { return false; }

        // ask additional questions if it's the last Full Access Key
        if (fullAccessKeys.length === 1 && !await confirmLock(account.accountId, accessKey)) { return false; }
    }
    return true;
}
