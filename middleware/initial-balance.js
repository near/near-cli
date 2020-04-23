
const { utils } = require('near-api-js');

module.exports = async function parseInitialBalance(options) {
    options.initialBalance = utils.format.parseNearAmount(options.initialBalance);
};