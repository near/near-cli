const assert = require('assert');


async function main(context) {
    assert(context.account, "account Id should exist");
    assert(context.account.accountId === "test.near");
    assert(context.near.config._[0] == 'repl');
    assert(context.nearAPI.keyStores);
}

module.exports.main = main;