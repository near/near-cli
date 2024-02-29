const qs = require('querystring');
const { utils } = require('near-api-js');

const connect = require('../../utils/connect');
const inspectResponse = require('../../utils/inspect-response');
const { assertCredentials } = require('../../utils/credentials');
const { DEFAULT_NETWORK } = require('../../config');

module.exports = {
    command: 'validator-stake accountId stakingKey amount',
    aliases: ['stake'],
    desc: 'Create a staking transaction (for **validators** only)',
    builder: (yargs) => yargs
        .option('accountId', {
            desc: 'Account that wants to become a network validator',
            type: 'string',
            required: true,
        })
        .option('stakingKey', {
            desc: 'Public key to stake with (base58 encoded)',
            type: 'string',
            required: true,
        })
        .option('amount', {
            desc: 'Amount to stake',
            type: 'string',
            required: true,
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
    handler: stake
};


async function stake(options) {
    await assertCredentials(options.accountId, options.networkId, options.keyStore, options.useLedgerKey);
    console.log(`Staking ${options.amount} (${utils.format.parseNearAmount(options.amount)}N) on ${options.accountId} with public key = ${qs.unescape(options.stakingKey)}.`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const result = await account.stake(qs.unescape(options.stakingKey), utils.format.parseNearAmount(options.amount));
    inspectResponse.prettyPrintResponse(result, options);
}