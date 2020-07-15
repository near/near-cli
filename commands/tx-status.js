const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const bs58 = require('bs58');

module.exports = {
    command: 'tx-status <hash>',
    desc: 'lookup transaction status by hash',
    builder: (yargs) => yargs
        .option('hash', {
            desc: 'base58-encoded hash',
            type: 'string',
            required: true
        }),
    handler: exitOnError(async (argv) => {
        const near = await connect(argv);

        const hashParts = argv.hash.split(':');
        let hash, accountId;
        if (hashParts.length == 2) {
            [accountId, hash] = hashParts;
        } else if (hashParts.length == 1) {
            [hash] = hashParts;
        } else {
            throw new Error('Unexpected transaction hash format');
        }
        accountId = accountId || argv.accountId || argv.masterAccount;

        if (!accountId) {
            throw new Error('Please specify account id, either as part of transaction hash or using --accountId flag.');
        }

        const status = await near.connection.provider.txStatus(bs58.decode(hash), accountId);
        console.log(`Transaction ${accountId}:${hash}`);
        console.log(inspectResponse.formatResponse(status));

    })
};
