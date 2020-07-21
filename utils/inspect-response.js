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

const prettyPrintError = (error, options) => {
    console.log(`An error occured`)
    console.log(formatResponse(error));
    const txnId = getTxnIdFromError(error);
    if (txnId) {
        console.log(`We attempted to send a transaction with id ${txnId} to NEAR, but something went wrong.`);
        explorer.printTransactionUrl(txnId, options);
    }
};

const formatResponse = (response) => {
    return util.inspect(response, { showHidden: true, depth: null, colors: true, maxArrayLength: null });
};

const getTxnIdFromError = (error) => {
    // Currently supported error format: 
    // TypedError: Exceeded 10 status check attempts for transaction GRPWi935e8Cm2PmPqrcrAyBuM9N13h5kHJNqhfVcY33q.
    // at Account.retryTxResult (C:\Users\janed\near\near-api-js\lib\account.js:97:15)
    // at Account.signAndSendTransaction (C:\Users\janed\near\near-api-js\lib\account.js:119:22)
    // at Object. (C:\Users\janed\near\near-api-js\test\account.test.js:38:5) {
    // type: 'RetriesExceeded',
    // transactionHash: 'GRPWi935e8Cm2PmPqrcrAyBuM9N13h5kHJNqhfVcY33q'
    // } 
    
    if (!error) return null;
    return error.transactionHash;
}

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
    prettyPrintError,
    formatResponse,
    getTxnId,
};