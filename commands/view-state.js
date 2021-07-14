const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { formatResponse } = require('../utils/inspect-response');

module.exports = {
    command: 'view-state <account-id> [prefix]',
    desc: 'View contract storage state',
    builder: (yargs) => yargs
        .option('prefix', {
            desc: 'Return keys only with given prefix.',
            type: 'string',
            default: ''
        })
        .option('block-id', {
            desc: 'The block number OR the block hash (base58-encoded).',
            type: 'string',
            coerce: (blockId) => {
                if (blockId && !isNaN(blockId)) {
                    return Number(blockId);
                }
                return blockId;
            }
            
        })
        .option('finality', {
            desc: '`optimistic` uses the latest block recorded on the node that responded to your query,\n' + 
                '`final` is for a block that has been validated on at least 66% of the nodes in the network',
            type: 'string',
            choices: ['optimistic', 'final'],
        })
        .option('utf8', {
            desc: 'Decode keys and values as UTF-8 strings',
            type: 'boolean',
            default: false
        })
        .conflicts('block-id', 'finality')
        .check((argv) => {
            if (!argv.finality && !argv.blockId) {
                throw new Error('Must provide either --finality or --blockId');
            }
            return true;
        }),
    handler: exitOnError(viewState)
};

async function viewState(options) {
    const { accountId, prefix, finality, blockId, utf8 } = options;
    const near = await connect(options);
    const account = await near.account(accountId);

    // near-api-js takes block_id instead of blockId
    let state = await account.viewState(prefix, { block_id: blockId, finality });
    if (utf8) {
        state = state.map(({ key, value}) => ({ key: key.toString('utf-8'), value: value.toString('utf-8') }));
    } else {
        state = state.map(({ key, value}) => ({ key: key.toString('base64'), value: value.toString('base64') }));
    }
    console.log(formatResponse(state, options));
}
