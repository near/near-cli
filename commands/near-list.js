// // index.js
// const exitOnError = require('../utils/exit-on-error');
// const connect = require('../utils/connect');
// const inspectResponse = require('../utils/inspect-response');
// const { utils } = require('near-api-js');
// const checkCredentials = require('../utils/check-credentials');


// module.exports = {
//     command: 'list <networkId>',
//     desc: 'list accounts & keys stored in local',
//     builder: (yargs) => yargs
//         .option('networkId', {
//             desc: 'NEAR network ID, allows using different keys based on network',
//             type: 'string',
//             required: false
//         }),
//     handler: exitOnError(listKey)
// };

// async function listKey(options) {
//     const accountsId = await options.keyStore.getAccounts(options.networkId)
//     accountsId.forEach(function(accountId) {
//         keypair = await options.keyStore.getKey(options.networkId, accountId)
//         console.log(`Account ID: ${accountId}, Public Key: ${keypair}`);
//     });
// }


const homedir = require('os').homedir();
const path = require('path');
const fs = require('fs');
const CREDENTIALS_DIR = '.near-credentials';


module.exports = {
    command: 'list <networkId>',
    desc: 'list keys stored in local',
    builder: (yargs) => yargs
        .option('networkId', {
            desc: 'NEAR network ID, allows using different keys based on network',
            type: 'string',
            required: false
        }),
    handler: exitOnError(listKey)
};


function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function parseKey(content) {
    const obj = JSON.parse(content);
    console.log(`Account ID: ${obj.account_id}, Public Key: ${obj.public_key}, Private Key: ${obj.private_key}`);
}

// readFiles(credentialsPath)
async function listKey(options) {
    const credentialsPath = path.join(homedir, CREDENTIALS_DIR, '/', options.networkId);
    fs.readdir(credentialsPath, function(err, filenames) {
        if (err) throw err;
        filenames.forEach(function(filename) {
            if (filename.endsWith('.json')){
                fs.readFile(credentialsPath + '/' + filename, 'utf-8', function(err, content) {
                    if (err) throw err;
                    parseKey(content);
                });
            }
        });
    });
}
