const nearlib = require('nearlib');
const UnencryptedFileSystemKeyStore = nearlib.keyStores.UnencryptedFileSystemKeyStore;

module.exports = async function connect({ keyStore, ...options }) {
    // TODO: Avoid need to wrap in deps
    return await nearlib.connect({ ...options, deps: { keyStore }});
};