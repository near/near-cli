const { askYesNoQuestion } = require('./readline');

module.exports = async function checkCredentials(
    accountId,
    networkId,
    keyStore
) {
    if(networkId != 'testnet' || networkId != 'default') return;
    if (!(await keyStore.getKey(networkId, accountId))) {
        console.log(
            `Unable to find [ ${networkId} ] credentials for [ ${accountId} ]`
        );
        const defaultKeyPair = await keyStore.getKey('default', accountId);
        if (defaultKeyPair) {
            const answer = await askYesNoQuestion(
                'Key found in deprecated [ default ] folder. Would you like to copy your key to [ testnet ] folder? (y/n): ',
                false
            );
            if (answer) {
                console.log('Copying key and retrying transaction...');
                await keyStore.setKey('testnet', accountId, defaultKeyPair);
            } else {
                throw 'Please relocate credentials found in [ default ] directory to [ testnet ] directory.';
            }
        } else throw 'error';
    }
};
