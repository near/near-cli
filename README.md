# NEAR command line interface

The [NEAR](https://near.ai/npm) protocol library as CLI tool.
More documentation [here](https://near.ai/readme)

## Installation
```
npm install -g near-shell
```

## Usage
In command line, from directory with your project:
```Bash
near <command>
```
### Commands:
```Bash
  near create_account  <account_id>            # create a developer account
  near state <account_id>                      # view account
  near new_project [dir]                       # generate a new project from template
  near deploy                                  # deploy your smart contract
  near call <contractName> <methodName> [args] # submits transaction, can change state, account required
  near view <contractName> <methodName> [args] # cannot change state, account is contract name
```
### Options:
| Option        | Description         | Type      |
| ------------- |:-------------------:| :---------|
| --help        | Show help           | [boolean] |
| --version     | Show version number | [boolean] |
