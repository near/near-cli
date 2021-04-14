const { askYesNoQuestion } = require('./readline');

module.exports = async function checkCredentials(
    accountId,
    networkId,
    keyStore
) {
    if(networkId !== 'testnet' || networkId !== 'default') return;
    if (!(await keyStore.getKey(networkId, accountId))) {
        console.log(
            `Unable to find [ ${networkId} ] credentials for [ ${accountId} ]`
        );
        const testnetKeys = await keyStore.getKey('testnet', accountId);
        const defaultKeys = await keyStore.getKey('default', accountId);
        if (defaultKeys && networkId === 'testnet') {
            const answer = await askYesNoQuestion(
                'Key found in deprecated [ default ] folder. Would you like to copy your key to [ testnet ] folder? (y/n): ',
                false
            );
            if (answer) {
                console.log('Copying key and retrying transaction...');
                await keyStore.setKey('testnet', accountId);
            } else {
                throw 'Please relocate credentials found in [ default ] directory to [ testnet ] directory.';
            }
        } else if (testnetKeys && networkId === 'default') {
            console.log(
                'Key found in [ testnet ] folder but your command is configured to use deprecated [ default ] network. Please upgrade near-cli or change your project\'s config file. '
            );
        }
    }
};
