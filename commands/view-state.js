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
        }),
    handler: exitOnError(viewState)
};

async function viewState(options) {
    const { accountId, prefix, finality, blockId, utf8 } = options;
    const near = await connect(options);
    const account = await near.account(accountId);
    if (finality && blockId) {
        console.error('Only one of --finality and --blockId can be provided');
        process.exit(1);
    } else if (!finality && !blockId) {
        console.error('Must provide either --finality or --blockId');
        process.exit(1);
    }
    // near-api-js takes block_id instead of blockId
    let block_id = blockId;
    if (blockId && !isNaN(Number(blockId))) {
        // If block id is a number (still string as command line args), it must be convert to JavaScript Number
        // for near-api-js.
        block_id = Number(blockId);
    }
    let state = await account.viewState(prefix, { block_id, finality });
    if (utf8) {
        state = state.map(({ key, value}) => ({ key: key.toString('utf-8'), value: value.toString('utf-8') }));
    } else {
        state = state.map(({ key, value}) => ({ key: key.toString('base64'), value: value.toString('base64') }));
    }
    console.log(formatResponse(state, options));
}
