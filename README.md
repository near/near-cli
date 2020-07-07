# NEAR Shell command line interface

[![Build Status](https://travis-ci.com/near/near-shell.svg?branch=master)](https://travis-ci.com/near/near-shell)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/near/near-shell) 

NEAR Shell is a Node.js application that relies on [`near-api-js`](https://github.com/near/near-api-js) to generate secure keys, connect to the NEAR platform and send transactions to the network on your behalf.

> note that **Node.js version 10+** is required to run NEAR Shell

## Installation

```bash
npm install -g near-shell
```

## Usage

In command line, from directory with your project:

```bash
near <command>
```

### Commands

#### For account:
```bash
  near login                                       # logging in through NEAR protocol wallet
  near create_account <accountId>                  # create a developer account with --masterAccount(required), publicKey and initialBalance
  near state <accountId>                           # view account state
  near keys <accountId>                            # view account public keys
  near send <sender> <receiver> <amount>           # send tokens to given receiver
  near stake <accountId> <stakingKey> <amount>     # create staking transaction (stakingKey is base58 encoded)
  near delete <accountId> <beneficiaryId>          # delete an account and transfer funds to beneficiary account
```

#### For smart contract:
```bash
  near build                                       # build your smart contract
  near deploy                                      # deploy your smart contract
  near call <contractName> <methodName> [args]     # schedule smart contract call which can modify state
  near view <contractName> <methodName> [args]     # make smart contract call which can view state
  near clean                                       # clean the smart contract build locally (remove ./out )
```

#### For transactions:
```bash
  near tx-status <hash>                            # lookup transaction status by hash
```

#### For validators:
```bash
  near validators <epoch>                          # lookup validating nodes by epoch(or "current", "next")
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
  near generate-key <account-id>                   # generate key
```

### Options

| Option                    | Description                                   | Type      | Default               |
| --------------------------|:----------------------------------------------| :---------|:----------------------|
| --help                    | Show help                                     | [boolean] |                       |
| --version                 | Show version number                           | [boolean] |                       |
| --nodeUrl                 | NEAR node URL                                 | [string]  |"http://localhost:3030"|
| --networkId               | NEAR network ID for different keys by network | [string]  |"default"              |
| --helperUrl               | NEAR contract helper URL                      | [string]  |                       |
| --keyPath                 | Path to master account key                    | [string]  |                       |
| --accountId               | Unique identifier for the account             | [string]  [required]|             |
| --masterAccount           | Account used to create requested account.     | [string]  [required]|             |
| --publicKey               | Public key to initialize the account with     | [string]  [required]|             |
| --initialBalance          | Number of tokens to transfer to newly account | [string]  [required]|             |

## License
This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).
See [LICENSE](LICENSE) and [LICENSE-APACHE](LICENSE-APACHE) for details.
