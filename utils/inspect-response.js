const explorer = require('./explorer');

const util = require('util');
const prettyPrintResponse = (response, options) => {
    if (options.verbose) {
        console.log(formatResponse(response));
    }
    const txnId = getTxnId(response);
    console.log(`Transaction Id ${txnId}`);
    explorer.printTransactionUrl(txnId, options);
};

const formatResponse = (response) => {
    return util.inspect(response, { showHidden: true, depth: null, colors: true, maxArrayLength: null });

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