const eventtracking = require('../utils/eventtracking');
const {resolve } = require('path');

module.exports = {
    command: 'repl',
    desc: 'launch interactive Node.js shell with NEAR connection available to use.\n'+
           'The repl\'s initial context contains `nearAPI`, `near` and `account`\n'+
           'if an accountId cli argument is provided.\n' +
           'To load a script into the repl use  ".load script.js".\n\n' + 
           'Use the the \'script\' option to pass context to a provided\n' +
           'javascript/typescript file which exports a main function.\n' +
           'Arguments after "--" are passed to script \n\n' +
           'USAGE:\n' +
           '    near repl --accountId bob\n    > console.log(account)\n    > .load script.js\n\n' +
           '    near repl -s ./scripts/delpoyContracts.js\n' +
           '    near repl -s ./scripts/run.js -- test.near bob.test.near\n' + 
           '    near repl -s ./script.ts \n',
    builder: (yargs) => yargs
        .option('script', {
            desc: '\'repl\': Path to a JS/TS file which exports an async function `main`,\nwhich takes a `context` object.',
            type: 'string',
            alias: 's',
        }),
    handler: async (argv) => {
        const extraArgs = argv._.slice(1);
        const { script, accountId } = argv;
        await eventtracking.askForConsentIfNeeded(argv);
        const nearContext = {
            nearAPI: require('near-api-js'),
            near: await require('../utils/connect')(argv),
        };
        if (accountId) {
            nearContext.account = await nearContext.near.account(accountId);
        }
        if (extraArgs.length > 0) {
            nearContext.argv = extraArgs;
        }
        if (script) {
            const scriptModule = loadScript(script);
            try {
                await scriptModule.main(nearContext);
            } catch (error) {
                console.error(`${script} Failed\n`);
                throw error;
            }
        } else {
            const repl = require('repl');
            const replContext = repl.start('> ').context;
            const { near, nearAPI, account } = nearContext;
            replContext.nearAPI = nearAPI;
            replContext.near = near;
            if (account) {
                replContext.account = account;
            }
        }
    }
};

function loadScript(script) {
    const scriptPath = script.startsWith('.')
        ? resolve(process.cwd(), script)
        : script;
    try {
        if (scriptPath.endsWith('.ts')) {
            loadTs(scriptPath);
        }
        return require(scriptPath);
    } catch (error) {
        console.error(`Failed to load ${scriptPath}.\n`);
        throw error;
    }
}

function loadTs(scriptPath) {
    try {
        require('ts-node').register({ transpileOnly: true });
    } catch (error) {
        console.error(
            `Failed to load \`ts-node\` for typescript file ${scriptPath}. Probably need to install \`ts-node\` and \`typescript\`.\n`
        );
        throw error;
    }
}