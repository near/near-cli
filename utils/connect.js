const { connect: nearConnect } = require('near-api-js');
const { getConfig } = require('../config');

module.exports = async function connect({ keyStore, ...options }) {
    // TODO: Avoid need to wrap in deps
    const config = getConfig(options.networkId);
    return await nearConnect({ ...options, ...config, deps: { keyStore } });
};
