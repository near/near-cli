const exitOnError = require('../utils/exit-on-error');
const chalk = require('chalk');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const checkCredentials = require('../utils/check-credentials');
const { askYesNoQuestion } = require('../utils/readline');

module.exports = {
    command: 'delete-key <account-id> <access-key>',
    desc: 'delete access key',
    builder: (yargs) => yargs
        .option('access-key', {
            desc: 'Public key to delete (base58 encoded)',
            type: 'string',
            required: true,
        }),
    handler: exitOnError(deleteAccessKey)
};

async function deleteAccessKey(options) {
    await checkCredentials(options.accountId, options.networkId, options.keyStore);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    if (options.force || await isAllApprovalsGranted(account, options.accessKey)) {
        console.log(chalk`{bold.white Deleting key {bold.blue ${options.accessKey}} on {bold.blue ${options.accountId}.}}`);
        const result = await account.deleteKey(options.accessKey);
        inspectResponse.prettyPrintResponse(result, options);
    } else {
        console.log(chalk`{bold.white Deletion of {bold.blue  ${options.accessKey} } key on {bold.blue ${options.accountId}}. was {bold.red canceled}}`);
    }
}

async function isAllApprovalsGranted(account, accessKey) {
    let accessKeys = await account.getAccessKeys();
    let fullAccessKeys = accessKeys.filter(accessKey => accessKey.access_key.permission === 'FullAccess');

    // asks for approval if user is deleting Full Access Key
    if (fullAccessKeys.find(key => key.public_key === accessKey)) {
        if (!await askYesNoQuestion(
            chalk`{bold.white Key {bold.blue ${accessKey}} is a Full Access key. Make sure it's not your recovery method. Do you want to proceed? {bold.green (y/n) }}`,
            false)
        ) { return false; }
        // ask additional questions if it's the last Full Access Key
        if (fullAccessKeys.length === 1 && !await askYesNoQuestion(
            chalk`{bold.white Key {bold.blue ${accessKey}} is the last Full Access key on your account. In case of deleting you will not be able to restore access to the account {bold.blue ${account.accountId}}. Do you want to proceed? {bold.green (y/n) }}`,
            false)
        ) { return false; }
    }
    return true;
}
