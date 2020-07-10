// Handle functionality related to explorer

const generateTransactionUrl = (txnId, options) => {
    if (!txnId || !options) {
        return null;
    }
    const explorerUrl = options.explorerUrl;
    return explorerUrl ? `${explorerUrl}/transactions/${txnId}` : null;
};

const printTransactionUrl = (txnId, options) => {
    const txnUrl = generateTransactionUrl(txnId, options);
    if (txnUrl) {
        console.log('To see the transaction in the transaction explorer, please open this url in your browser');
        console.log(txnUrl);
    }
};

module.exports = {
    generateTransactionUrl,
    printTransactionUrl,
};