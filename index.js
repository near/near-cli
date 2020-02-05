const fs = require('fs');
const yargs = require('yargs');
const ncp = require('ncp').ncp;
ncp.limit = 16;
const rimraf = require('rimraf');
const readline = require('readline');
const URL = require('url').URL;
const stringWidth = require('string-width')

const { KeyPair, utils } = require('nearlib');

const connect = require('./utils/connect');
const inspectResponse = require('./utils/inspect-response');

// TODO: Fix promisified wrappers to handle error properly

// For smart contract:
exports.clean = async function() {
    const rmDirFn = () => {
        return new Promise(resolve => {
            rimraf(yargs.argv.outDir, response => resolve(response));
        });};
    await rmDirFn();
    console.log('Clean complete.');
};

exports.deploy = async function(options) {
    console.log(
        `Starting deployment. Account id: ${options.accountId}, node: ${options.nodeUrl}, helper: ${options.helperUrl}, file: ${options.wasmFile}`);
    const near = await connect(options);
    const contractData = [...fs.readFileSync(options.wasmFile)];
    const account = await near.account(options.accountId);
    await account.deployContract(contractData);
};

exports.callViewFunction = async function(options) {
    console.log(`View call: ${options.contractName}.${options.methodName}(${options.args || ''})`);
    const near = await connect(options);
    // TODO: Figure out how to run readonly calls without account
    const account = await near.account(options.accountId || options.masterAccount || 'register.near');
    console.log(inspectResponse(await account.viewFunction(options.contractName, options.methodName, JSON.parse(options.args || '{}'))));
};

// For account:

exports.login = async function(options) {
    if (!options.walletUrl) {
        console.log('Log in is not needed on this environment. Please use appropriate master account for shell operations.');
    } else {
        const newUrl = new URL(options.walletUrl + '/login/');
        const title = 'NEAR Shell';
        newUrl.searchParams.set('title', title);
        const keyPair = await KeyPair.fromRandom('ed25519');
        newUrl.searchParams.set('public_key', keyPair.getPublicKey());
        console.log(`Please navigate to this url and follow the instructions to log in: \n${newUrl.toString()}`);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Please enter the accountId that you logged in with:', async (accountId) => {
            try {
                // check that the key got added
                const near = await connect(options);
                let account = await near.account(accountId);
                let keys = await account.getAccessKeys();
                let publicKey = keyPair.getPublicKey().toString();
                let keyFound = keys.some(key => key.public_key == keyPair.getPublicKey().toString());
                if (keyFound) {
                    await options.keyStore.setKey(options.networkId, accountId, keyPair);
                    console.log(`Logged in as ${accountId} with public key ${publicKey} successfully`);
                } else {
                    console.log('Log in did not succeed. Please try again.');
                }
            } catch (e) {
                console.log(e);
            }
            rl.close();
        });
    }
};

exports.viewAccount = async function(options) {
    let near = await connect(options);
    let account = await near.account(options.accountId);
    let state = await account.state();
    if (state && state.amount) {
        state['formattedAmount'] = utils.format.formatNearAmount(state.amount);
    }
    console.log(`Account ${options.accountId}`);
    console.log(inspectResponse(state));
};

exports.deleteAccount = async function(options) {
    console.log(
        `Deleting account. Account id: ${options.accountId}, node: ${options.nodeUrl}, helper: ${options.helperUrl}, beneficiary: ${options.beneficiaryId}`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    await account.deleteAccount(options.beneficiaryId);
    console.log(`Account ${options.accountId} for network "${options.networkId}" was deleted.`);
};

exports.keys = async function(options) {
    let near = await connect(options);
    let account = await near.account(options.accountId);
    let accessKeys = await account.getAccessKeys();
    console.log(`Keys for account ${options.accountId}`);
    console.log(inspectResponse(accessKeys));
};

exports.sendMoney = async function(options) {
    console.log(`Sending ${options.amount} (${utils.format.parseNearAmount(options.amount)}) NEAR to ${options.receiver} from ${options.sender}`);
    const near = await connect(options);
    const account = await near.account(options.sender);
    console.log(inspectResponse(await account.sendMoney(options.receiver, utils.format.parseNearAmount(options.amount))));
};

exports.stake = async function(options) {
    console.log(`Staking ${options.amount} (${utils.format.parseNearAmount(options.amount)}) on ${options.accountId} with public key = ${options.stakingKey}.`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const result = await account.stake(options.stakingKey, utils.format.parseNearAmount(options.amount));
    console.log(inspectResponse(result));
};

exports.checkCommandsArgs = async function (argv, yargs, registeredCommandObjs, registeredCommands) {
    // logic borrowed from yargs/lib/usage.js
    function maxWidth (table, theWrap, modifier) {
        let width = 0
        if (!Array.isArray(table)) {
          table = Object.keys(table).map(key => [table[key]])
        }
        
        table.forEach((v) => {
          width = Math.max(
            stringWidth(modifier ? `${modifier} ${v['command']}` : v['command']),
            width
          )
        })
        
        if (theWrap) width = Math.min(width, parseInt(theWrap * 0.5, 10))
        
        return width
    }

    // find and inform user of invalid commands
    const invalidCommands = argv._.filter(command => !registeredCommands.includes(command))
    if (invalidCommands.length === 1) {
        console.log(`Invalid command '${invalidCommands}'`)
    } else if (invalidCommands.length > 1) {
        console.log(`Invalid commands '${invalidCommands.join(', ')}'`)
    }
    
    // valid arguments as understood by the yargs instance
    const activeArgs = Object.keys(argv)
    const validArgs = Object.keys(yargs.parsed.aliases)
    // add a handful of special keys for our use case
    validArgs.push(...['_', '$0', 'keyStore', 'contractName', 'walletUrl'])
    
    const invalidArguments = activeArgs.filter(arg => !validArgs.includes(arg))
    if (invalidArguments.length === 1) {
        console.error(`Invalid argument '${invalidArguments[0]}'`)
    } else if (invalidArguments.length > 1) {
        console.error(`Invalid argument(s) '${invalidArguments.join(', ')}'`)
    }    
    
    // exit yargs, otherwise it tries to continue throwing misleading errors
    if (invalidArguments.length !== 0 || invalidCommands.length !== 0) yargs.exit()
    
    // command 'near' with no invalid arguments or invalid commands displays --help
    // logic borrowed from yargs/lib/usage.js
    if (argv.hasOwnProperty('_') && argv._.length === 0 && invalidCommands.length === 0 && invalidArguments.length === 0) {
      const ui = require('cliui')({
        width: null,
        wrap: null
      })
      if (registeredCommandObjs.length) {
        ui.div('Commands:')
    
        const context = yargs.getContext()
        const parentCommands = context.commands.length ? `${context.commands.join(' ')} ` : ''
    
        if (yargs.getParserConfiguration()['sort-commands'] === true) {
          commands = registeredCommandObjs.sort((a, b) => a[0].localeCompare(b[0]))
        }
    
        registeredCommandObjs.forEach((command) => {
          const commandString = `near ${parentCommands}${command.command.replace(/^\$0 ?/, '')}` // drop $0 from default commands.
          ui.span(
            {
              text: commandString,
              padding: [0, 2, 0, 2],
              width: maxWidth(registeredCommandObjs, null, `near${parentCommands}`) + 4
            },
            { text: command['desc'] }
          )
          const hints = []
          if (command[2]) hints.push(`[${'default:'.slice(0, -1)}]`) // TODO hacking around i18n here
          if (command[3] && command[3].length) {
            hints.push(`[${'aliases:'} ${command[3].join(', ')}]`)
          }
          if (hints.length) {
            ui.div({ text: hints.join(' '), padding: [0, 0, 0, 2], align: 'right' })
          } else {
            ui.div()
          }
        })
    
        ui.div()
      }      
    
      console.log(ui.toString())
      yargs.showHelp()
    }
};