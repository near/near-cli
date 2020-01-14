const nearlib = require('nearlib');

module.exports = async function connect({ keyStore, ...options }) {
    // TODO: Avoid need to wrap in deps
    return await nearlib.connect({ ...options, deps: { keyStore }});
};
