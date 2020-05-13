const { keyStores } = require('near-api-js');
const homedir = require('os').homedir();
const path = require('path');
const MergeKeyStore = keyStores.MergeKeyStore;
const UnencryptedFileSystemKeyStore = keyStores.UnencryptedFileSystemKeyStore;

const CREDENTIALS_DIR = '.near-credentials';
const PROJECT_KEY_DIR = './neardev';

module.exports = async function createKeyStore() {
    // ./neardev is an old way of storing keys under project folder. We want to fallback there for backwards compatibility
    // TODO: use system keystores.
    // TODO: setting in config for which keystore to use
    const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
    const keyStores = [
        new UnencryptedFileSystemKeyStore(credentialsPath),
        new UnencryptedFileSystemKeyStore(PROJECT_KEY_DIR)
    ];
    return { keyStore: new MergeKeyStore(keyStores) };
};

module.exports.PROJECT_KEY_DIR = PROJECT_KEY_DIR;