const { keyStores } = require('near-api-js');
const homedir = require('os').homedir();
const path = require('path');
const UnencryptedFileSystemKeyStore = keyStores.UnencryptedFileSystemKeyStore;

const CREDENTIALS_DIR = '.near-credentials';

module.exports = async function createKeyStore() {
    // TODO: use system keystores.
    const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
    return { keyStore: new UnencryptedFileSystemKeyStore(credentialsPath) };
};