const { DEFAULT_NETWORK } = require('../../config');
const connect = require('../../utils/connect');
const inspectResponse = require('../../utils/inspect-response');
const bs58 = require('bs58');

module.exports = {
    command: 'tx-status <hash> <accountId>',
    desc: 'Lookup transaction status by hash',
    builder: (yargs) => yargs
        .option('hash', {
            desc: 'base58-encoded hash',
            type: 'string',
            required: true
        })
        .option('accountId', {
            desc: 'Account that signed the tx (used to determine which shard to query)',
            type: 'string',
        })
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet, custom',
            type: 'string',
            default: DEFAULT_NETWORK
        }),
    handler: txStatus
};

async function txStatus(options) {
    const near = await connect(options);

    const hashParts = options.hash.split(':');
    let hash, accountId;
    if (hashParts.length == 2) {
        [accountId, hash] = hashParts;
    } else if (hashParts.length == 1) {
        [hash] = hashParts;
    } else {
        throw new Error('Unexpected transaction hash format');
    }

    accountId = accountId || options.accountId || options.masterAccount;

    if (!accountId) {
        throw new Error('Please specify account id, either as part of transaction hash or using --accountId flag.');
    }

    const status = await near.connection.provider.txStatus(bs58.decode(hash), accountId);
    console.log(`Transaction ${null}:${hash}`);
    console.log(inspectResponse.formatResponse(status));
}