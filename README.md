# NEAR command line interface

The [NEAR](https://near.ai/npm) protocol library as CLI tool.
More documentation [here](https://near.ai/readme)

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

```bash
  near create_account <accountId>              # create a developer account
  near state <accountId>                       # view account
  near tx-status <hash>                        # lookup transaction status by hash
  near build                                   # build your smart contract
  near deploy                                  # deploy your smart contract
  near call <contractName> <methodName>        # schedule smart contract call which
  [args]                                       # can modify state
  near view <contractName> <methodName>        # make smart contract call which can
  [args]                                       # view state
  near state <accountId>                       # view account
  near send <receiver> <amount>                # send tokens to given receiver
  near clean                                   # clean the build environment
  near new_project [projectDir]                # create a new blank project
  near stake [accountId] [publicKey] [amount]  # create staking transaction
  near login                                   # create a developer account

```

### Options

| Option                    | Description                                   | Type      | Default               |
| --------------------------|:---------------------------------------------:| :---------|:----------------------|
| --help                    | Show help                                     | [boolean] |                       |
| --version                 | Show version number                           | [boolean] |                       |
| --nodeUrl, --node_url     | NEAR node URL                                 | [string]  |"http://localhost:3030"|
| --networkId, --network_id | NEAR network ID for different keys by network | [string]  |"default"              |
| --helperUrl               | NEAR contract helper URL                      | [string]  |                       |
| --keyPath                 | Path to master account key                    | [string]  |                       |
| --homeDir                 | Where to look for master account              | [string]  |"~/.near"              |
| --accountId, --account_id | Unique identifier for the account             | [string]  |                       |
