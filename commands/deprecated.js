const chalk = require('chalk');

module.exports = [
    {
        command: ['clean', 'repl', 'stake', 'evm-call', 'evm-view', 'set-api-key', 'js'],
        desc: false,
        handler: deprecated
    },
    {
        command: 'dev-deploy [...]',
        desc: false,
        handler: deprecatedDevDeploy
    }
];

async function deprecated() {
    console.log(chalk`This command has been {bold.red deprecated}`);
    console.log(chalk`Consider using {bold.blue near-cli-rs} instead`);
}

async function deprecatedDevDeploy() {
    console.log(chalk`This command has been {bold.red deprecated}`);
    console.log(chalk`Please use: {bold.white near create-random-account} and {bold.white near deploy} instead`);
}