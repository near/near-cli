const assert = require('assert');


module.exports.main = async function main({account, near, nearAPI, argv}) {
    assert(account, 'accountId should have been passed');
    assert(account.accountId === 'test.near');
    assert(near.config._[0] == 'repl');
    assert(nearAPI.keyStores);
    assert(argv.includes('arg'));
};
