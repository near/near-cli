const { connect: nearConnect } = require('near-api-js');
const { getConfig } = require('../config');
const { getPublicKeyForPath, signForPath } = require('./ledger');
const chalk = require('chalk');

module.exports = async function connect({ keyStore, ...options }) {
    // If using Ledger, override the signer so that it uses the Ledger device
    if (options.signWithLedger) { 
        console.log(chalk`\nUsing Ledger with path {blue ${options.ledgerPath}}, change path with {blue --ledgerPath}\n`);
        options.signer = {
            getPublicKey: () => getPublicKeyForPath(options.ledgerPath),
            signMessage: (m) => signForPath(m, options.ledgerPath)
        };
    }      

    // TODO: Avoid need to wrap in deps
    const config = getConfig(options.networkId);
    return await nearConnect({ ...options, ...config, deps: { keyStore } });
};
