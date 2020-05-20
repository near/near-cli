const { connect: nearConnect } = require('near-api-js');

module.exports = async function connect({ keyStore, ...options }) {
    // TODO: Avoid need to wrap in deps
    return await nearConnect({ ...options, deps: { keyStore }});
};
