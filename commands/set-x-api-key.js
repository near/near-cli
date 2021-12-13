const { setXApiKey, getXApiKey } = require('../utils/x-api-key-settings');
const chalk = require('chalk');
const exitOnError = require('../utils/exit-on-error');

module.exports = {
    command: 'set-api-key <rpc-server> <x-api-key>',
    desc: 'Add x-api-key for RPC Server',
    builder: (yargs) => yargs,
    handler: exitOnError(setApiKey)
};

async function setApiKey(options) {
    setXApiKey(options.rpcServer, options.xApiKey);
    console.log(chalk`x-api-key: {bold.white ${getXApiKey(options.rpcServer)}} is set for {bold.white ${options.rpcServer}} RPC Server`);
}
