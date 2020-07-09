// Handle functionality related to explorer

const generateTransactionUrl = (txnId, options) => {
    const explorerUrl = options.explorerUrl;

    return explorerUrl ? `${options.explorerUrl}/transactions/${txnId}` : null;
};

module.exports = {
    generateTransactionUrl,
};