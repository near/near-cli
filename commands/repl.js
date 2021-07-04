const eventtracking = require('../utils/eventtracking');

module.exports = {
    command: 'repl',
    desc: 'launch interactive Node.js shell with NEAR connection available to use. The repl\'s initial context contains `nearAPI`, `near`and `account` if an accountId cli argument is provided. ' +
           'To load a script into the repl use  ".load script.js".\n\n' + 
           'USAGE:\n' +
           '    near repl --accountId bob\n    > console.log(account)\n    > .load script.js',
    builder: (yargs) => yargs,
    handler: async (argv) => {
        await eventtracking.askForConsentIfNeeded(argv);
        const repl = require('repl');
        const context = repl.start('> ').context;
        context.nearAPI = require('near-api-js');
        context.near = await require('../utils/connect')(argv);
        if (argv.accountId) {
            context.account = await context.near.account(argv.accountId);
        }
    }
};
