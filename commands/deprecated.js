const chalk = require('chalk');

module.exports = [
    {
        command: ['clean', 'repl', 'stake', 'evm-call', 'evm-view', 'set-api-key', 'js', 'validators', 'proposals'],
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
    console.log(chalk`\nThis command has been {bold.red deprecated}. Consider using {bold.blue near-cli-rs} instead\n`);
}

async function deprecatedDevDeploy() {
    console.log(chalk`\nThis command has been {bold.red deprecated}`);
    console.log(chalk`Please use: {bold.white near create-account <accId> --useFaucet} to create a pre-funded account, and then {bold.white near deploy} to deploy the contract\n`);
}