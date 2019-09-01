const nearlib = require('nearlib');
const UnencryptedFileSystemKeyStore = nearlib.keyStores.UnencryptedFileSystemKeyStore;

module.exports = async function connect(options) {
    if (options.keyPath === undefined && options.helperUrl === undefined) {
        const homeDir = options.homeDir || `${process.env.HOME}/.near`;
        options.keyPath = `${homeDir}/validator_key.json`;
    }
    // TODO: search for key store.
    const keyStore = new UnencryptedFileSystemKeyStore('./neardev');
    options.deps = {
        keyStore,
    };
    return await nearlib.connect(options);
}