const nearlib = require('nearlib');
const UnencryptedFileSystemKeyStore = nearlib.keyStores.UnencryptedFileSystemKeyStore;

module.exports = async function createKeyStore(options) {
    // TODO: Search for key store in multiple locations
    // TODO: Use system key store if possible
    return { keyStore: new UnencryptedFileSystemKeyStore('./neardev') };
};