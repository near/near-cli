const util = require('util');

const prettyPrintResponse = (response, options) => {
    if (options.verbose) {
        console.log(formatResponse(response));
    }
    const txnId = getTxnId(response);
    if (txnId) {
        const prefix = options.networkId === 'mainnet' ? 'www' : 'testnet';
        console.log(`Transaction Id ${txnId}`);
        console.log(`Open the explorer for more info: https://${prefix}.nearblocks.io/txns/${txnId}`);
    }
};

const formatResponse = (response) => {
    return util.inspect(response, {
        // showHidden: true,
        depth: null,
        colors: Boolean(process.stdout.isTTY && process.stdout.hasColors()),
        maxArrayLength: null
    });
};

const getTxnId = (response) => {
    // Currently supported response format: 
    //{
    //   ...
    //   transaction: {
    //     ...
    //     hash: 'BF1iyVWTkagisho3JKKUXiPQu2sMuuLsEbvQBDYHHoKE'
    //   },
    if (!response || !response.transaction) {
        return null;
    }
    return response.transaction.hash;
};

module.exports = {
    prettyPrintResponse,
    formatResponse,
    getTxnId,
};