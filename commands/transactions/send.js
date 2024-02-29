const chalk = require('chalk');
const connect = require('../../utils/connect');
const inspectResponse = require('../../utils/inspect-response');
const { assertCredentials } = require('../../utils/credentials');
const { utils } = require('near-api-js');
const { DEFAULT_NETWORK } = require('../../config');

module.exports = {
    command: 'send-near <sender> <receiver> <amount>',
    aliases: ['send'],
    desc: 'Send tokens to given receiver',
    builder: (yargs) => yargs
        .option('amount', {
            desc: 'Amount of NEAR tokens to send',
            type: 'string',
        })
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
        }),
    handler: sendMoney
};

async function sendMoney(options) {
    await assertCredentials(options.sender, options.networkId, options.keyStore, options.useLedgerKey);

    const near = await connect(options);
    const account = await near.account(options.sender);

    try {
        console.log(`Sending ${options.amount} NEAR to ${options.receiver} from ${options.sender}`);
        const result = await account.sendMoney(options.receiver, utils.format.parseNearAmount(options.amount));
        inspectResponse.prettyPrintResponse(result, options);
    } catch (error) {
        switch (error.type) {
        case 'AccountDoesNotExist':
            console.log(chalk`\nAccount {bold.white ${options.receiver}} does {bold.red not exist} on {bold.white ${options.networkId}}.\n`);
            process.exit(1);
            break;
        case 'NotEnoughBalance':
            console.log(chalk`\nAccount {bold.white ${options.sender}} does {bold.red not have enough balance} to send {bold.white ${options.amount} NEAR} to {bold.white ${options.receiver}}.\n`);
            process.exit(1);
            break;
        default:
            throw error;
        }
    }
}