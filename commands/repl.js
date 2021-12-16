const eventtracking = require('../utils/eventtracking');
const resolve = require('path').resolve;

module.exports = {
    command: 'repl',
    desc: 'launch interactive Node.js shell with NEAR connection available to use. The repl\'s initial context contains `nearAPI`, `near`and `account` if an accountId cli argument is provided. ' +
           'To load a script into the repl use  ".load script.js".\n\n' + 
           'USAGE:\n' +
           '    near repl --accountId bob\n    > console.log(account)\n    > .load script.js',
    builder: (yargs) => yargs
        .option('script', {
            desc: 'Path to a JS file which exports a function `main`, which takes a `context` object\nwhich includes `nearAPI`, `near`, and `account` if `--accountId` is passed',
            type: 'string',
            alias: 's',
        }),
    handler: async (argv) => {
        const {script, accountId } = argv;
        await eventtracking.askForConsentIfNeeded(argv);
        const nearContext = {
          nearAPI: require('near-api-js'),
          near: await require('../utils/connect')(argv),
        };
        if (accountId) {
            nearContext.account = await nearContext.near.account(accountId);
        }
        if (script) {
          await require(resolve(process.cwd(), script)).main(nearContext);
        } else {
            const repl = require('repl');
            const replContext = repl.start('> ').context;
            const {near, nearAPI, account} = nearContext;
            replContext.nearAPI = nearAPI;
            replContext.near = near;
            if (account) {
              replContext.account = account;
            }
        }
    }
};