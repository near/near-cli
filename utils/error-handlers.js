const chalk = require('chalk');

module.exports = function handleExceededThePrepaidGasError(error, options) {
    console.log(chalk.bold(`\nTransaction ${error.transaction_outcome.id} had ${options.gas} of attached gas but used ${error.transaction_outcome.outcome.gas_burnt} of gas`));
    console.log('View this transaction in explorer:', chalk.blue(`https://explorer.${options.networkId}.near.org/transactions/${error.transaction_outcome.id}`));
};