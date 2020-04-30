const nearlib = require('near-api-js');
const homedir = require('os').homedir();
const path = require('path');
const MergeKeyStore = nearlib.keyStores.MergeKeyStore;
const UnencryptedFileSystemKeyStore = nearlib.keyStores.UnencryptedFileSystemKeyStore;

const CREDENTIALS_DIR = '.near-credentials';

module.exports = async function createKeyStore() {
    // ./neardev is an old way of storing keys under project folder. We want to fallback there for backwards compatibility
    // TODO: use system keystores.
    // TODO: setting in config for which keystore to use
    const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
    const keyStores = [
        new UnencryptedFileSystemKeyStore(credentialsPath),
        new UnencryptedFileSystemKeyStore('./neardev')
    ];
    return { keyStore: new MergeKeyStore(keyStores) };
};
