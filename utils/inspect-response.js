const explorer = require('./explorer');
const config = require('../get-config')();
const chalk = require('chalk');  // colorize output
const util = require('util');


const checkForAccDoesNotExist = (error, options) => {
    if(!String(error).includes('does not exist while viewing')) return false;

    const suffixesToNetworks = {near:'mainnet', testnet:'testnet', betanet:'betanet'};

    const currentNetwork = config.helperAccount;
    console.log(chalk`\n{bold.red Account {bold.white ${options.accountId}} is not found in {bold.white ${suffixesToNetworks[currentNetwork]}}\n}`);
    
    const accSuffix = String(options.accountId).match('[^.]*$')[0];
    const accNetwork = suffixesToNetworks[accSuffix];
    if (currentNetwork != accSuffix && accNetwork) {
        console.log(chalk`{bold.white Use export NEAR_ENV=${accNetwork} to use ${accNetwork} accounts. \n}`);
    }

    return true;
};

const prettyPrintResponse = (response, options) => {
    if (options.verbose) {
        console.log(formatResponse(response));
    }
    const txnId = getTxnId(response);
    if (txnId) {
        console.log(`Transaction Id ${txnId}`);
        explorer.printTransactionUrl(txnId, options);
    }
};

const prettyPrintError = (error, options) => {
    if (checkForAccDoesNotExist(error, options)) return;

    console.error('An error occured');
    console.error(error.stack);
    console.error(formatResponse(error));
    const txnId = getTxnIdFromError(error);
    if (txnId) {
        console.log(`We attempted to send transaction ${txnId} to NEAR, but something went wrong.`);
        explorer.printTransactionUrl(txnId, options);
        console.log('Note: if the transaction was invalid (e.g. not enough balance), it will show as "Not started" or "Finalizing"');
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
