const homedir = require('os').homedir();
const credentials_dir = homedir + '/.near-credentials';
const fs = require('fs').promises;
const { askYesNoQuestion } = require('./readline');

module.exports = async function checkCredentials(accountId, networkId, keyStore) {
  console.log('networkId', networkId);
  console.log('accountId', accountId);
  if(!(await keyStore.getKey(networkId, accountId))) {
    console.log(`Unable to find ${networkId} credentials for ${accountId}`);
    const hasInDefault = await keyStore.getKey('default', accountId);
    if(hasInDefault) {
        const answer = await askYesNoQuestion('Key found in deprecated \'default\' folder. Would you like to move key to \'testnet\' folder? (y/n): ', false);
        if(answer) {
            console.log('Moving files...');
            await fs.copyFile(`${credentials_dir}/default/${accountId}.json`, `${credentials_dir}/testnet/${accountId}.json`)
            throw ('Please run command again.')
        } else {
            throw ('Please relocate credentials found in \'default\' directory to \'testnet\'.');
        }
    } else throw ('error')
  }
}