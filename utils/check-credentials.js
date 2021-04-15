const chalk = require('chalk');
const { askYesNoQuestion } = require('./readline');

module.exports = async function checkCredentials(
    accountId,
    networkId,
    keyStore
) {
    if(networkId !== 'testnet' && networkId !== 'default') return;
    if (!(await keyStore.getKey(networkId, accountId))) {
        console.log(
            chalk`{bold.white Unable to find [ ${networkId} ] credentials for [ ${accountId} ]}`
        );
        const testnetKeys = await keyStore.getKey('testnet', accountId);
        const defaultKeys = await keyStore.getKey('default', accountId);
        if (defaultKeys && networkId === 'testnet') {
            const answer = await askYesNoQuestion(
                chalk`{bold.white Key found in {bold.yellow deprecated} [ default ] folder. Would you like to copy your key to [ testnet ] folder? (y/n)}`,
                false
            );
            if (answer) {
                console.log(chalk`{bold.white Copying key and attempting transaction...}`);
                await keyStore.setKey('testnet', accountId, defaultKeys);
            } else {
                throw console.log(
                    chalk`{bold.white Please relocate credentials found in [ default ] directory to [ testnet ] directory.}`
                );
            }
        } else if (testnetKeys && networkId === 'default') {
            console.log(
                chalk`{bold.white Key found in [ testnet ] folder but your command is configured to use {bold.yellow deprecated} [ default ] network. Please upgrade near-cli or change your project\'s config file. }`
            );
        }
    }
};
