const explorer = require('./explorer');

const util = require('util');
const prettyPrintResponse = (response, options) => {
    if (options.verbose) {
        console.log(formatResponse(response));
    }
    const txnId = getTxnId(response);
    if (txnId) {
        console.log(`Transaction Id ${txnId}`);
        explorer.printTransactionUrl(txnId, options);
    }
    console.log();
};

const prettyPrintError = (error, options) => {
    console.log('An error occured');
    console.log(formatResponse(error));
    const txnId = getTxnIdFromError(error);
    if (txnId) {
        console.log(`We attempted to send transaction ${txnId} to NEAR, but something went wrong.`);
        explorer.printTransactionUrl(txnId, options);
        console.log('Note: if the transaction was invalid (e.g. not enough balance), it will show as "Not started" or "Finalizing"');
    }
};

const formatResponse = (response) => {
    return util.inspect(response, { showHidden: true, depth: null, colors: true, maxArrayLength: null });
};

const getTxnIdFromError = (error) => {
    // Currently supported error format: 
    // {
    //     [stack]: 'Error: Sender jane.betanet does not have enough balance 45000000521675913419670000 for operation costing 1000000000002265303009375000\n' +
    //     ...
    //     [message]: 'Sender jane.betanet does not have enough balance 45000000521675913419670000 for operation costing 1000000000002265303009375000',
    //     type: 'NotEnoughBalance',
    //     context: ErrorContext {
    //       transactionHash: 'FyavUCyvZ5G1JLTdnXSZd3VoaFEaGRXnmDFwhmNeaVC6'
    //     },
    //     balance: '45000000521675913419670000',
    //     cost: '1000000000002265303009375000',
    //     signer_id: 'jane.betanet'
    //   }
    
    if (!error || !error.context) return null;
    return error.context.transactionHash;
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
    prettyPrintError,
    formatResponse,
    getTxnId,
};
