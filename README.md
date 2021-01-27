# NEAR CLI (command line interface)

[![Build Status](https://travis-ci.com/near/near-cli.svg?branch=master)](https://travis-ci.com/near/near-cli)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/near/near-cli) 

NEAR CLI is a Node.js application that relies on [`near-api-js`](https://github.com/near/near-api-js) to generate secure keys, connect to the NEAR platform and send transactions to the network on your behalf.

> note that **Node.js version 10+** is required to run NEAR CLI

## Installation

```bash
npm install -g near-cli
```

## Usage

In command line, from the directory with your project:

```bash
near <command>
```

### Commands

For a list of up-to-date commands, run `near` in your terminal with no arguments. If you need to find a command that isn't listed here, look in the `/commands` folder.  And add it here :)

#### For account:
```bash
  near login                                       # logging in through NEAR protocol wallet
  near create-account <accountId>                  # create a developer account with --masterAccount (required), publicKey and initialBalance
  near state <accountId>                           # view account state
  near keys <accountId>                            # view account public keys
  near add-key <accountId> <accessKey>             # Add an access key to given account
  near send <sender> <receiver> <amount>           # send tokens to given receiver
  near stake <accountId> <stakingKey> <amount>     # create staking transaction (stakingKey is base58 encoded)
  near delete <accountId> <beneficiaryId>          # delete an account and transfer funds to beneficiary account
  near delete-key [accessKey]                      # delete access key
```

#### For native smart contracts:
```bash
  near deploy [accountId] [wasmFile] [initFunction] [initArgs] [initGas] [initDeposit]  # deploy your smart contract
  near dev-deploy [wasmFile]                       # deploy your smart contract using temporary account (TestNet only)
  near call <contractName> <methodName> [args]     # schedule smart contract call which can modify state
  near view <contractName> <methodName> [args]     # make smart contract call which can view state
  near clean                                       # clean the smart contract build locally (remove ./out )
```

#### For NEAR EVM smart contracts:
```bash
  near evm-view <evmAccount> <contractName> <methodName> [args]     # make an EVM smart contract call which can view state
  near evm-call <evmAccount> <contractName> <methodName> [args]     # schedule an EVM smart contract call which can modify state
```

#### For transactions:
```bash
  near tx-status <hash>                            # lookup transaction status by hash
```

#### For validators:
```bash
  near validators <epoch>                          # lookup validating nodes by epoch(or "current", "next")
  near proposals                                   # lookup current proposals
```

#### REPL:

```
near repl
```

Launch interactive Node.js shell with NEAR connection available to use. The repl's initial context contains `nearAPI`, `near`and `account` if an accountId cli argument is provided. To load a script into the repl use  `.load script.js`.

##### Usage example:
```
near repl --acountId bob
> console.log(account)
> .load script.js
```

#### Misc:

```bash
  near repl                                        # launch interactive Node.js shell with NEAR connection available to use
  near generate-key <account-id>                   # generate key locally (Note: this does not create another access key automatically)
```

### Options

| Option                    | Description                                   | Type      | Default               |
| --------------------------|:----------------------------------------------| :---------|:----------------------|
| --help                    | Show help                                     | [boolean] |                       |
| --version                 | Show version number                           | [boolean] |                       |
| --nodeUrl                 | NEAR node URL                                 | [string]  |"https://rpc.testnet.near.org"|
| --networkId               | NEAR network ID for different keys by network | [string]  |"default"              |
| --helperUrl               | NEAR contract helper URL                      | [string]  |                       |
| --keyPath                 | Path to master account key                    | [string]  |                       |
| --accountId               | Unique identifier for the account             | [string]  [required]|             |
| --masterAccount           | Account used to create requested account.     | [string]  [required]|             |
| --publicKey               | Public key to initialize the account with     | [string]  [required]|             |
| --initialBalance          | Number of tokens to transfer to newly account | [string]  [required]|             |

#### Environments

Use `NEAR_ENV` to define which network these commands will target. Default is `testnet`.
```
export NEAR_ENV=mainnet
```

## License
This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).
See [LICENSE](LICENSE) and [LICENSE-APACHE](LICENSE-APACHE) for details.
