const nearlib = require('nearlib');
const UnencryptedFileSystemKeyStore = nearlib.keyStores.UnencryptedFileSystemKeyStore;

module.exports = async function connect(options) {
    // TODO: search for key store.
    const keyStore = new UnencryptedFileSystemKeyStore('./neardev');
    options.deps = {
        keyStore,
    };
    return await nearlib.connect(options);
}