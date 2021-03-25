const homedir = require('os').homedir();
const credentials_dir = homedir + '/.near-credentials';

module.exports = async function checkCredentials(options) {
  if(!(await options.keyStore.getKey(options.networkId, options.accountId))) {
    console.log(`Unable to find ${options.networkId} credentials for ${options.accountId}`);
    const hasInDefault = await options.keyStore.getKey('default', options.accountId);
    if(hasInDefault) {
        const answer = await askYesNoQuestion('Key found in deprecated \'default\' folder. Would you like to move key to \'testnet\' folder? (y/n): ', false);
        if(answer) {
            console.log('Moving files...');
            await fs.copyFile(`${credentials_dir}/default/${option.accountId}`, `${credentials_dir}/testnet/${options.accountId}`)
        } else {
            console.log('Please relocate credentials found in \'default\' directory to \'testnet\'.');
            return;
        }
    }
  }
}