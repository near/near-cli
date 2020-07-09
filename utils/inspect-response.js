
const util = require('util');
const prettyPrintResponse = (response) => {
    return util.inspect(response, { showHidden: true, depth: null, colors: true, maxArrayLength: null });
};

const getTxnId = (response) => {
    // Currently supported response format: 
    //{
    //   ...
    //   transaction: {
    //     ...
    //     hash: 'BF1iyVWTkagisho3JKKUXiPQu2sMuuLsEbvQBDYHHoKE'
    //   },
    if (!response || !response.transaction) {
        return null;
    }
    return response.transaction.hash;
};

module.exports = {
    prettyPrintResponse,
    getTxnId,
};