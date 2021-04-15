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
            chalk`{bold.white Unable to find [ {bold.blue ${networkId}} ] credentials for [ {bold.blue ${accountId}} ]...}`
        );
        const testnetKeys = await keyStore.getKey('testnet', accountId);
        const defaultKeys = await keyStore.getKey('default', accountId);
        if (defaultKeys && networkId === 'testnet') {
            const answer = await askYesNoQuestion(
                chalk`{bold.white Key found in {bold.yellow deprecated} [ {bold.blue default} ]  folder. Would you like to copy your key to [ {bold.blue testnet} ] folder? {bold.green (y/n)}}`,
                false
            );
            if (answer) {
                console.log(chalk`{bold.white Copying key and attempting transaction...}`);
                await keyStore.setKey('testnet', accountId, defaultKeys);
            } else {
                throw console.log(
                    chalk`{bold.white Please relocate credentials found in [ {bold.blue default} ] directory to [ {bold.blue testnet} ] directory using {bold.yellow near login}.}`
                );
            }
        } else if (testnetKeys && networkId === 'default') {
            console.log(
                chalk`{bold.white Key found in [ testnet ] folder but your command is configured to use {bold.yellow deprecated} [ default ] network. Please upgrade near-cli or change your project\'s config file. }`
            );
        }
    }
};
