# NEAR CLI (command line interface)

[![Build Status](https://travis-ci.com/near/near-cli.svg?branch=master)](https://travis-ci.com/near/near-cli)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/near/near-cli)

NEAR CLI is a Node.js application that relies on [`near-api-js`](https://github.com/near/near-api-js) to connect to and interact with the NEAR blockchain. Create accounts, access keys, sign & send transactions with this versatile command line interface tool.

**Note:** Node.js version 10+ is required to run NEAR CLI.

## Overview

_Click on a command for more information and examples._

| Command                                               | Description                                                                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **ACCESS KEYS**                                       |                                                                                                                                        |
| [`near login`](#near-login)                           | stores a full access key locally using [NEAR Wallet](https://wallet.testnet.near.org/)                                                 |
| [`near keys`](#near-keys)                             | displays all access keys and their details for a given account                                                                         |
| [`near generate-key`](#near-generate-key)             | generates a local key pair **or** shows public key & [implicit account](http://docs.near.org/docs/roles/integrator/implicit-accounts)  |
| [`near add-key`](#near-add-key)                       | adds a new access key to an account                                                                                                    |
| [`near delete-key`](#near-delete-key)                 | deletes an access key from an account                                                                                                  |
| **ACCOUNTS**                                          |                                                                                                                                        |
| [`near create-account`](#near-create-account)         | creates an account                                                                                                                     |
| [`near state`](#near-state)                           | shows general details of an account                                                                                                    |
| [`near keys`](#near-keys)                             | displays all access keys for a given account                                                                                           |
| [`near send`](#near-send)                             | sends tokens from one account to another                                                                                               |
| [`near delete`](#near-delete)                         | deletes an account and transfers remaining balance to a beneficiary account                                                            |
| **CONTRACTS**                                         |                                                                                                                                        |
| [`near deploy`](#near-deploy)                         | deploys a smart contract to the NEAR blockchain                                                                                        |
| [`near dev-deploy`](#near-dev-deploy)                 | creates a development account and deploys a contract to it _(`testnet` only)_                                                          |
| [`near call`](#near-call)                             | makes a contract call which can invoke `change` _or_ `view` methods                                                                    |
| [`near view`](#near-view)                             | makes a contract call which can **only** invoke a `view` method                                                                        |
| **TRANSACTIONS**                                      |                                                                                                                                        |
| [`near tx-status`](#near-tx-status)                   | queries a transaction's status by `txHash`                                                                                             |
| **VALIDATORS**                                        |                                                                                                                                        |
| [`near validators current`](#near-validators-current) | displays current [epoch](http://docs.near.org/docs/concepts/epoch) validator pool details                                              |
| [`near validators next`](#near-validators-next)       | displays validator details for the next [epoch](http://docs.near.org/docs/concepts/epoch)                                              |
| [`near proposals`](#near-proposals)                   | displays validator proposals for the [epoch](http://docs.near.org/docs/concepts/epoch) _after_ next                                    |
| **REPL**                                              |                                                                                                                                        |
| [`near repl`](#near-repl)                             | launches an interactive connection to the NEAR blockchain ([REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop)) |

[ [**OPTIONS**](#options) ]

> For EVM support see [Project Aurora's](https://aurora.dev) [`aurora-cli`](https://github.com/aurora-is-near/aurora-cli).

---

## Setup

### Installation

> Make sure you have a current version of `npm` and `NodeJS` installed.

#### Mac and Linux

1. Install `npm` and `node` using a package manager like `nvm` as sometimes there are issues using Ledger due to how OS X handles node packages related to USB devices. [[click here]](https://nodejs.org/en/download/package-manager/)
2. Ensure you have installed Node version 12 or above.
3. Install `near-cli` globally by running:

```bash
npm install -g near-cli
```

#### Windows

> For Windows users, we recommend using Windows Subsystem for Linux (`WSL`).

1. Install `WSL` [[click here]](https://docs.microsoft.com/en-us/windows/wsl/install-manual#downloading-distros)
2. Install `npm` [[click here]](https://www.npmjs.com/get-npm)
3. Install ` Node.js` [ [ click here ]](https://nodejs.org/en/download/package-manager/)
4. Change `npm` default directory [ [ click here ] ](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally#manually-change-npms-default-directory)
    - This is to avoid any permission issues with `WSL`
5. Open `WSL` and install `near-cli` globally by running:

```bash
npm install -g near-cli
```

---

### Network selection

> The default network for `near-cli` is `testnet`.

-   You can change the network by prepending an environment variable to your command.

```bash
NEAR_ENV=betanet near send ...
```

-   Alternatively, you can set up a global environment variable by running:

```bash
export NEAR_ENV=mainnet
```

---

## Access Keys

### `near login`

> locally stores a full access key of an account you created with [NEAR Wallet](https://wallet.testnet.near.org/).

-   arguments: `none`
-   options: `default`

**Example:**

```bash
near login
```

#### Access Key Location:

-   Once complete you will now have your Access Key stored locally in a hidden directory called `.near-credentials`

    -   This directory is located at the root of your `HOME` directory:
        -   `~/.near-credentials` _(MAC / Linux)_
        -   `C:\Users\YOUR_ACCOUNT\.near-credentials` _(Windows)_

-   Inside `.near-credentials`, access keys are organized in network subdirectories:
    -   `default` _for `testnet`_
    -   `betanet`
    -   `mainnet`
-   These network subdirectories contain `.JSON` objects with an:
    -   `account_id`
    -   `private_key`
    -   `public_key`

**Example:**

```json
{
    "account_id": "example-acct.testnet",
    "public_key": "ed25519:7ns2AZVaG8XZrFrgRw7g8qhgddNTN64Zkz7Eo8JBnV5g",
    "private_key": "ed25519:4Ijd3vNUmdWJ4L922BxcsGN1aDrdpvUHEgqLQAUSLmL7S2qE9tYR9fqL6DqabGGDxCSHkKwdaAGNcHJ2Sfd"
}
```

---

### `near keys`

> Displays all access keys for a given account.

-   arguments: `accountId`
-   options: `default`

**Example:**

```bash
near keys client.chainlink.testnet
```

<details>
<summary> <strong>Example Response</strong> </summary>
<p>

```
Keys for account client.chainlink.testnet
[
  {
    public_key: 'ed25519:4wrVrZbHrurMYgkcyusfvSJGLburmaw7m3gmCApxgvY4',
    access_key: { nonce: 97, permission: 'FullAccess' }
  },
  {
    public_key: 'ed25519:H9k5eiU4xXS3M4z8HzKJSLaZdqGdGwBG49o7orNC4eZW',
    access_key: {
      nonce: 88,
      permission: {
        FunctionCall: {
          allowance: '18483247987345065500000000',
          receiver_id: 'client.chainlink.testnet',
          method_names: [ 'get_token_price', [length]: 1 ]
        }
      }
    }
  },
  [length]: 2
]
```

</p>
</details>

---

### `near generate-key`

> Creates a key pair locally in `.near-credentials` **or** displays public key from Ledger or seed phrase.

-   arguments: `accountId` or `none`
-   options: `--useLedgerKey`, `--seedPhrase`, or `--seedPath`

**Note:** There are several ways to use `generate-key` that return very different results. Please reference the examples below for further details.

---

#### 1) `near generate-key`

> Creates a key pair locally in `.near-credentials` with an [implicit account](http://docs.near.org/docs/roles/integrator/implicit-accounts) as the accountId. _(hash representation of the public key)_

```bash
near generate-key
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

```bash
Key pair with ed25519:33Vn9VtNEtWQPPd1f4jf5HzJ5weLcvGHU8oz7o5UnPqy public key for an account "1e5b1346bdb4fc5ccd465f6757a9082a84bcacfd396e7d80b0c726252fe8b3e8"
```

</p>
</details>

---

#### 2) `near generate-key accountId`

> Creates a key pair locally in `.near-credentials` with an `accountId` that you specify.

**Note:** This does NOT create an account with this name, and will overwrite an existing `.json` file with the same name.

```bash
near generate-key example.testnet
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

```bash
Key pair with ed25519:CcH3oMEFg8tpJLekyvF7Wp49G81K3QLhGbaWEFwtCjht public key for an account "example.testnet"
```

</p>
</details>

---

#### 3a) `near generate-key --useLedgerKey`

> Uses a connected Ledger device to display a public key and [implicit account](http://docs.near.org/docs/roles/integrator/implicit-accounts) using the default HD path (`"44'/397'/0'/0'/1'"`)

```bash
near generate-key --useLedgerKey
```

You should then see the following prompt to confirm this request on your Ledger device:

    Make sure to connect your Ledger and open NEAR app
    Waiting for confirmation on Ledger...

After confirming the request on your Ledger device, a public key and implicit accountId will be displayed.

<details>
<summary><strong>Example Response</strong></summary>
<p>

```bash
Using public key: ed25519:B22RP10g695wyeRvKIWv61NjmQZEkWTMzAYgdfx6oSeB2
Implicit account: 42c320xc20739fd9a6bqf2f89z61rd14efe5d3de234199bc771235a4bb8b0e1
```

</p>
</details>

---

#### 3b) `near generate-key --useLedgerKey="HD path you specify"`

> Uses a connected Ledger device to display a public key and [implicit account](http://docs.near.org/docs/roles/integrator/implicit-accounts) using a custom HD path.

```bash
near generate-key --useLedgerKey="44'/397'/0'/0'/2'"
```

You should then see the following prompt to confirm this request on your Ledger device:

    Make sure to connect your Ledger and open NEAR app
    Waiting for confirmation on Ledger...

After confirming the request on your Ledger device, a public key and implicit accountId will be displayed.

<details>
<summary><strong>Example Response</strong></summary>
<p>

```bash
Using public key: ed25519:B22RP10g695wye3dfa32rDjmQZEkWTMzAYgCX6oSeB2
Implicit account: 42c320xc20739ASD9a6bqf2Dsaf289z61rd14efe5d3de23213789009afDsd5bb8b0e1
```

</p>
</details>

---

#### 4a) `near generate-key --seedPhrase="your seed phrase"`

> Uses a seed phrase to display a public key and [implicit account](http://docs.near.org/docs/roles/integrator/implicit-accounts)

```bash
near generate-key --seedPhrase="cow moon right send now cool dense quark pretty see light after"
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Key pair with ed25519:GkMNfc92fwM1AmwH1MTjF4b7UZuceamsq96XPkHsQ9vi public key for an account "e9fa50ac20522987a87e566fcd6febdc97bd35c8c489999ca8aff465c56969c3"

</p>
</details>

---

#### 4b) `near generate-key accountId --seedPhrase="your seed phrase"`

> Uses a seed phrase to display a public key **without** the [implicit account](http://docs.near.org/docs/roles/integrator/implicit-accounts).

```bash
near generate-key example.testnet --seedPhrase="cow moon right send now cool dense quark pretty see light after"
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Key pair with ed25519:GkMNfc92fwM1AmwH1MTjF4b7UZuceamsq96XPkHsQ9vi public key for an account "example.testnet"

</p>
</details>

---

### `near add-key`

> Adds an either a **full access** or **function access** key to a given account.

**Note:** You will use an _existing_ full access key for the account you would like to add a _new_ key to. ([`near login`](http://docs.near.org/docs/tools/near-cli#near-login))

#### 1) add a `full access` key

-   arguments: `accountId` `publicKey`

**Example:**

```bash
near add-key example-acct.testnet Cxg2wgFYrdLTEkMu6j5D6aEZqTb3kXbmJygS48ZKbo1S
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Adding full access key = Cxg2wgFYrdLTEkMu6j5D6aEZqTb3kXbmJygS48ZKbo1S to example-acct.testnet.
    Transaction Id EwU1ooEvkR42HvGoJHu5ou3xLYT3JcgQwFV3fAwevGJg
    To see the transaction in the transaction explorer, please open this url in your browser
    https://explorer.testnet.near.org/transactions/EwU1ooEvkR42HvGoJHu5ou3xLYT3JcgQwFV3fAwevGJg

</p>
</details>

#### 2) add a `function access` key

-   arguments: `accountId` `publicKey` `--contract-id`
-   options: `--method-names` `--allowance`

> `accountId` is the account you are adding the key to
>
> `--contract-id` is the contract you are allowing methods to be called on
>
> `--method-names` are optional and if omitted, all methods of the `--contract-id` can be called.
>
> `--allowance` is the amount of Ⓝ the key is allowed to spend on gas fees _only_. If omitted then key will only be able to call view methods.

**Note:** Each transaction made with this key will have gas fees deducted from the initial allowance and once it runs out a new key must be issued.

**Example:**

```bash
near add-key example-acct.testnet GkMNfc92fwM1AmwH1MTjF4b7UZuceamsq96XPkHsQ9vi --contract-id example-contract.testnet --method-names example_method --allowance 30000000000
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Adding function call access key = GkMNfc92fwM1AmwH1MTjF4b7UZuceamsq96XPkHsQ9vi to example-acct.testnet.
    Transaction Id H2BQL9fXVmdTbwkXcMFfZ7qhZqC8fFhsA8KDHFdT9q2r
    To see the transaction in the transaction explorer, please open this url in your browser
    https://explorer.testnet.near.org/transactions/H2BQL9fXVmdTbwkXcMFfZ7qhZqC8fFhsA8KDHFdT9q2r

</p>
</details>

---

### `near delete-key`

> Deletes an existing key for a given account.

-   arguments: `accountId` `publicKey`
-   options: `default`

**Note:** You will need separate full access key for the account you would like to delete a key from. ([`near login`](http://docs.near.org/docs/tools/near-cli#near-login))

**Example:**

```bash
near delete-key example-acct.testnet Cxg2wgFYrdLTEkMu6j5D6aEZqTb3kXbmJygS48ZKbo1S
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Transaction Id 4PwW7vjzTCno7W433nu4ieA6FvsAjp7zNFwicNLKjQFT
    To see the transaction in the transaction explorer, please open this url in your browser
    https://explorer.testnet.near.org/transactions/4PwW7vjzTCno7W433nu4ieA6FvsAjp7zNFwicNLKjQFT

</p>
</details>

---

## Accounts

### `near create-account`

> Creates an account using a `--masterAccount` that will pay for the account's creation and any initial balance.

-   arguments: `accountId` `--masterAccount`
-   options: `--initialBalance`

**Note:** You will only be able to create subaccounts of the `--masterAccount` unless the name of the new account is ≥ 32 characters.

**Example**:

```bash
near create-account 12345678901234567890123456789012 --masterAccount example-acct.testnet
```

**Subaccount example:**

```bash
near create-account sub-acct.example-acct.testnet --masterAccount example-acct.testnet
```

**Example using `--initialBalance`:**

```bash
near create-account sub-acct2.example-acct.testnet --masterAccount example-acct.testnet --initialBalance 10
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Saving key to '/HOME_DIR/.near-credentials/default/sub-acct2.example-acct.testnet.json'
    Account sub-acct2.example-acct.testnet for network "default" was created.

</p>
</details>

---

### `near state`

> Shows details of an account's state.

-   arguments: `accountId`
-   options: `default`

**Example:**

```bash
near state example.testnet
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

```json
{
    "amount": "99999999303364037168535000",
    "locked": "0",
    "code_hash": "G1PCjeQbvbUsJ8piXNb7Yg6dn3mfivDQN7QkvsVuMt4e",
    "storage_usage": 53528,
    "storage_paid_at": 0,
    "block_height": 21577354,
    "block_hash": "AWu1mrT3eMJLjqyhNHvMKrrbahN6DqcNxXanB5UH1RjB",
    "formattedAmount": "99.999999303364037168535"
}
```

</p>
</details>

---

### `near send`

> Sends NEAR tokens (Ⓝ) from one account to another.

-   arguments: `senderId` `receiverId` `amount`
-   options: `default`

**Note:** You will need a full access key for the sending account. ([`near login`](http://docs.near.org/docs/tools/near-cli#near-login))

**Example:**

```bash
near send sender.testnet receiver.testnet 10
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Sending 10 NEAR to receiver.testnet from sender.testnet
    Transaction Id BYTr6WNyaEy2ykAiQB9P5VvTyrJcFk6Yw95HPhXC6KfN
    To see the transaction in the transaction explorer, please open this url in your browser
    https://explorer.testnet.near.org/transactions/BYTr6WNyaEy2ykAiQB9P5VvTyrJcFk6Yw95HPhXC6KfN

</p>
</details>

---

### `near delete`

> Deletes an account and transfers remaining balance to a beneficiary account.

-   arguments: `accountId` `beneficiaryId`
-   options: `default`

**Example:**

```bash
near delete sub-acct2.example-acct.testnet example-acct.testnet
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Deleting account. Account id: sub-acct2.example-acct.testnet, node: https://rpc.testnet.near.org, helper: https://helper.testnet.near.org, beneficiary: example-acct.testnet
    Transaction Id 4x8xohER1E3yxeYdXPfG8GvXin1ShiaroqE5GdCd5YxX
    To see the transaction in the transaction explorer, please open this url in your browser
    https://explorer.testnet.near.org/transactions/4x8xohER1E3yxeYdXPfG8GvXin1ShiaroqE5GdCd5YxX
    Account sub-acct2.example-acct.testnet for network "default" was deleted.

</p>
</details>

---

## Contracts

### `near deploy`

> Deploys a smart contract to a given accountId.

-   arguments: `accountId` `.wasmFile`
-   options: `initFunction` `initArgs` `initGas` `initDeposit`

**Note:** You will need a full access key for the account you are deploying the contract to. ([`near login`](http://docs.near.org/docs/tools/near-cli#near-login))

**Example:**

```bash
near deploy --accountId example-contract.testnet --wasmFile out/example.wasm
```

**Initialize Example:**

```bash
near deploy --accountId example-contract.testnet --wasmFile out/example.wasm --initFunction new --initArgs '{"owner_id": "example-contract.testnet", "total_supply": "10000000"}'
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Starting deployment. Account id: example-contract.testnet, node: https://rpc.testnet.near.org, helper: https://helper.testnet.near.org, file: main.wasm
    Transaction Id G8GhhPuujMHTRnwursPXE1Lv5iUZ8WUecwiST1PcKWMt
    To see the transaction in the transaction explorer, please open this url in your browser
    https://explorer.testnet.near.org/transactions/G8GhhPuujMHTRnwursPXE1Lv5iUZ8WUecwiST1PcKWMt
    Done deploying to example-contract.testnet

</p>
</details>

### `near dev-deploy`

> Creates a development account and deploys a smart contract to it. No access keys needed. **_(`testnet` only)_**

-   arguments: `.wasmFile`
-   options: `default`

**Example:**

```bash
near dev-deploy out/main.wasm
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Starting deployment. Account id: dev-1603749005325-6432576, node: https://rpc.testnet.near.org, helper: https://helper.testnet.near.org, file: out/main.wasm
    Transaction Id 5nixQT87KeN3eZFX7zwBLUAKSY4nyjhwzLF27SWWKkAp
    To see the transaction in the transaction explorer, please open this url in your browser
    https://explorer.testnet.near.org/transactions/5nixQT87KeN3eZFX7zwBLUAKSY4nyjhwzLF27SWWKkAp
    Done deploying to dev-1603749005325-6432576

</p>
</details>

---

### `near call`

> makes a contract call which can modify _or_ view state.

**Note:** Contract calls require a transaction fee (gas) so you will need an access key for the `--accountId` that will be charged. ([`near login`](http://docs.near.org/docs/tools/near-cli#near-login))

-   arguments: `contractName` `method_name` `{ args }` `--accountId`
-   options: `--gas` `--deposit`

**Example:**

```bash
near call guest-book.testnet addMessage '{"text": "Aloha"}' --account-id example-acct.testnet
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Scheduling a call: guest-book.testnet.addMessage({"text": "Aloha"})
    Transaction Id FY8hBam2iyQfdHkdR1dp6w5XEPJzJSosX1wUeVPyUvVK
    To see the transaction in the transaction explorer, please open this url in your browser
    https://explorer.testnet.near.org/transactions/FY8hBam2iyQfdHkdR1dp6w5XEPJzJSosX1wUeVPyUvVK
    ''

</p>
</details>

---

### `near view`

> Makes a contract call which can **only** view state. _(Call is free of charge)_

-   arguments: `contractName` `method_name` `{ args }`
-   options: `default`

**Example:**

```bash
near view guest-book.testnet getMessages '{}'
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    View call: guest-book.testnet.getMessages({})
    [
      { premium: false, sender: 'waverlymaven.testnet', text: 'TGIF' },
      {
        premium: true,
        sender: 'waverlymaven.testnet',
        text: 'Hello from New York 🌈'
      },
      { premium: false, sender: 'fhr.testnet', text: 'Hi' },
      { premium: true, sender: 'eugenethedream', text: 'test' },
      { premium: false, sender: 'dongri.testnet', text: 'test' },
      { premium: false, sender: 'dongri.testnet', text: 'hello' },
      { premium: true, sender: 'dongri.testnet', text: 'hey' },
      { premium: false, sender: 'hirokihori.testnet', text: 'hello' },
      { premium: true, sender: 'eugenethedream', text: 'hello' },
      { premium: false, sender: 'example-acct.testnet', text: 'Aloha' },
      [length]: 10
    ]

</p>
</details>

---

## NEAR EVM Contracts

### `near evm-view`

> Makes an EVM contract call which can **only** view state. _(Call is free of charge)_

-   arguments: `evmAccount` `contractName` `methodName` `[arguments]` `--abi` `--accountId`
-   options: `default`

**Example:**

```bash
near evm-view evm 0x89dfB1Cd61F05ad3971EC1f83056Fd9793c2D521 getAdopters '[]' --abi /path/to/contract/abi/Adoption.json --accountId test.near
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

```json
[
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0xCBdA96B3F2B8eb962f97AE50C3852CA976740e2B",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000"
]
```

</p>
</details>

---

### `near evm-call (deprecated)`

> makes an EVM contract call which can modify _or_ view state.

**Note:** Contract calls require a transaction fee (gas) so you will need an access key for the `--accountId` that will be charged. ([`near login`](http://docs.near.org/docs/tools/near-cli#near-login))

-   arguments: `evmAccount` `contractName` `methodName` `[arguments]` `--abi` `--accountId`
-   options: `default` (`--gas` and `--deposit` coming soon…)

**Example:**

```bash
near evm-call evm 0x89dfB1Cd61F05ad3971EC1f83056Fd9793c2D521 adopt '["6"]' --abi /path/to/contract/abi/Adoption.json --accountId test.near
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

    Scheduling a call inside evm EVM:
    0x89dfB1Cd61F05ad3971EC1f83056Fd9793c2D521.adopt()
      with args [ '6' ]

</p>
</details>

---

### `near evm-dev-init`

> Used for running EVM tests — creates a given number of test accounts on the desired network using a master NEAR account

-   arguments: `accountId`
-   options: `numAccounts`

```bash
NEAR_ENV=betanet near evm-dev-init you.betanet 3
```

The above will create 3 subaccounts of `you.betanet`. This is useful for tests that require multiple accounts, for instance, sending fungible tokens back and forth. If the `3` value were to be omitted, it would use the default of 5.

---

## Transactions

### `near tx-status`

> Queries transaction status by hash and accountId.

-   arguments: `txHash` `--accountId`
-   options: `default`

**Example:**

```bash
near tx-status FY8hBam2iyQfdHkdR1dp6w5XEPJzJSosX1wUeVPyUvVK --accountId guest-book.testnet
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

```json
Transaction guest-book.testnet:FY8hBam2iyQfdHkdR1dp6w5XEPJzJSosX1wUeVPyUvVK
{
  status: { SuccessValue: '' },
  transaction: {
    signer_id: 'example-acct.testnet',
    public_key: 'ed25519:AXZZKnp6ZcWXyRNdy8FztYrniKf1qt6YZw6mCCReXrDB',
    nonce: 20,
    receiver_id: 'guest-book.testnet',
    actions: [
      {
        FunctionCall: {
          method_name: 'addMessage',
          args: 'eyJ0ZXh0IjoiQWxvaGEifQ==',
          gas: 300000000000000,
          deposit: '0'
        }
      },
      [length]: 1
    ],
    signature: 'ed25519:5S6nZXPU72nzgAsTQLmAFfdVSykdKHWhtPMb5U7duacfPdUjrj8ipJxuRiWkZ4yDodvDNt92wcHLJxGLsyNEsZNB',
    hash: 'FY8hBam2iyQfdHkdR1dp6w5XEPJzJSosX1wUeVPyUvVK'
  },
  transaction_outcome: {
    proof: [ [length]: 0 ],
    block_hash: '6nsjvzt6C52SSuJ8UvfaXTsdrUwcx8JtHfnUj8XjdKy1',
    id: 'FY8hBam2iyQfdHkdR1dp6w5XEPJzJSosX1wUeVPyUvVK',
    outcome: {
      logs: [ [length]: 0 ],
      receipt_ids: [ '7n6wjMgpoBTp22ScLHxeMLzcCvN8Vf5FUuC9PMmCX6yU', [length]: 1 ],
      gas_burnt: 2427979134284,
      tokens_burnt: '242797913428400000000',
      executor_id: 'example-acct.testnet',
      status: {
        SuccessReceiptId: '7n6wjMgpoBTp22ScLHxeMLzcCvN8Vf5FUuC9PMmCX6yU'
      }
    }
  },
  receipts_outcome: [
    {
      proof: [ [length]: 0 ],
      block_hash: 'At6QMrBuFQYgEPAh6fuRBmrTAe9hXTY1NzAB5VxTH1J2',
      id: '7n6wjMgpoBTp22ScLHxeMLzcCvN8Vf5FUuC9PMmCX6yU',
      outcome: {
        logs: [ [length]: 0 ],
        receipt_ids: [ 'FUttfoM2odAhKNQrJ8F4tiBpQJPYu66NzFbxRKii294e', [length]: 1 ],
        gas_burnt: 3559403233496,
        tokens_burnt: '355940323349600000000',
        executor_id: 'guest-book.testnet',
        status: { SuccessValue: '' }
      }
    },
    {
      proof: [ [length]: 0 ],
      block_hash: 'J7KjpMPzAqE7iX82FAQT3qERDs6UR1EAqBLPJXBzoLCk',
      id: 'FUttfoM2odAhKNQrJ8F4tiBpQJPYu66NzFbxRKii294e',
      outcome: {
        logs: [ [length]: 0 ],
        receipt_ids: [ [length]: 0 ],
        gas_burnt: 0,
        tokens_burnt: '0',
        executor_id: 'example-acct.testnet',
        status: { SuccessValue: '' }
      }
    },
    [length]: 2
  ]
}
```

</p>
</details>

---

## Validators

### `near validators current`

> Displays details of current validators.
>
> -   amount staked
> -   number of seats
> -   percentage of uptime
> -   expected block production
> -   blocks actually produced

-   arguments: `current`
-   options: `default`

**Example:**

```bash
near validators current
```

**Example for `mainnet`:**

```bash
NEAR_ENV=mainnet near validators current
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

```bash
Validators (total: 49, seat price: 1,976,588):
.--------------------------------------------------------------------------------------------------------------------.
|                 Validator Id                 |   Stake    |  Seats  | % Online | Blocks produced | Blocks expected |
|----------------------------------------------|------------|---------|----------|-----------------|-----------------|
| cryptium.poolv1.near                         | 13,945,727 | 7       | 100%     |            1143 |            1143 |
| astro-stakers.poolv1.near                    | 11,660,189 | 5       | 100%     |             817 |             817 |
| blockdaemon.poolv1.near                      | 11,542,867 | 5       | 76.74%   |             627 |             817 |
| zavodil.poolv1.near                          | 11,183,187 | 5       | 100%     |             818 |             818 |
| bisontrails.poolv1.near                      | 10,291,696 | 5       | 99.38%   |             810 |             815 |
| dokiacapital.poolv1.near                     | 7,906,352  | 3       | 99.54%   |             650 |             653 |
| chorusone.poolv1.near                        | 7,480,508  | 3       | 100%     |             490 |             490 |
| figment.poolv1.near                          | 6,931,070  | 3       | 100%     |             489 |             489 |
| stardust.poolv1.near                         | 6,401,678  | 3       | 100%     |             491 |             491 |
| anonymous.poolv1.near                        | 6,291,821  | 3       | 97.55%   |             479 |             491 |
| d1.poolv1.near                               | 6,265,109  | 3       | 100%     |             491 |             491 |
| near8888.poolv1.near                         | 6,202,968  | 3       | 99.38%   |             486 |             489 |
| rekt.poolv1.near                             | 5,950,212  | 3       | 100%     |             490 |             490 |
| epic.poolv1.near                             | 5,639,256  | 2       | 100%     |             326 |             326 |
| fresh.poolv1.near                            | 5,460,410  | 2       | 100%     |             327 |             327 |
| buildlinks.poolv1.near                       | 4,838,398  | 2       | 99.38%   |             325 |             327 |
| jubi.poolv1.near                             | 4,805,921  | 2       | 100%     |             326 |             326 |
| openshards.poolv1.near                       | 4,644,553  | 2       | 100%     |             326 |             326 |
| jazza.poolv1.near                            | 4,563,432  | 2       | 100%     |             327 |             327 |
| northernlights.poolv1.near                   | 4,467,978  | 2       | 99.39%   |             326 |             328 |
| inotel.poolv1.near                           | 4,427,152  | 2       | 100%     |             327 |             327 |
| baziliknear.poolv1.near                      | 4,261,142  | 2       | 100%     |             328 |             328 |
| stakesabai.poolv1.near                       | 4,242,618  | 2       | 100%     |             326 |             326 |
| everstake.poolv1.near                        | 4,234,552  | 2       | 100%     |             327 |             327 |
| stakin.poolv1.near                           | 4,071,704  | 2       | 100%     |             327 |             327 |
| certusone.poolv1.near                        | 3,734,505  | 1       | 100%     |             164 |             164 |
| lux.poolv1.near                              | 3,705,394  | 1       | 100%     |             163 |             163 |
| staked.poolv1.near                           | 3,683,365  | 1       | 100%     |             164 |             164 |
| lunanova.poolv1.near                         | 3,597,231  | 1       | 100%     |             163 |             163 |
| appload.poolv1.near                          | 3,133,163  | 1       | 100%     |             163 |             163 |
| smart-stake.poolv1.near                      | 3,095,711  | 1       | 100%     |             164 |             164 |
| artemis.poolv1.near                          | 3,009,462  | 1       | 99.39%   |             163 |             164 |
| moonlet.poolv1.near                          | 2,790,296  | 1       | 100%     |             163 |             163 |
| nearfans.poolv1.near                         | 2,771,137  | 1       | 100%     |             163 |             163 |
| nodeasy.poolv1.near                          | 2,692,745  | 1       | 99.39%   |             163 |             164 |
| erm.poolv1.near                              | 2,653,524  | 1       | 100%     |             164 |             164 |
| zkv_staketosupportprivacy.poolv1.near        | 2,548,343  | 1       | 99.39%   |             163 |             164 |
| dsrvlabs.poolv1.near                         | 2,542,925  | 1       | 100%     |             164 |             164 |
| 08investinwomen_runbybisontrails.poolv1.near | 2,493,123  | 1       | 100%     |             163 |             163 |
| electric.poolv1.near                         | 2,400,532  | 1       | 99.39%   |             163 |             164 |
| sparkpool.poolv1.near                        | 2,378,191  | 1       | 100%     |             163 |             163 |
| hashquark.poolv1.near                        | 2,376,424  | 1       | 100%     |             164 |             164 |
| masternode24.poolv1.near                     | 2,355,634  | 1       | 100%     |             164 |             164 |
| sharpdarts.poolv1.near                       | 2,332,398  | 1       | 99.38%   |             162 |             163 |
| fish.poolv1.near                             | 2,315,249  | 1       | 100%     |             163 |             163 |
| ashert.poolv1.near                           | 2,103,327  | 1       | 97.56%   |             160 |             164 |
| 01node.poolv1.near                           | 2,058,200  | 1       | 100%     |             163 |             163 |
| finoa.poolv1.near                            | 2,012,304  | 1       | 100%     |             163 |             163 |
| majlovesreg.poolv1.near                      | 2,005,032  | 1       | 100%     |             164 |             164 |
'--------------------------------------------------------------------------------------------------------------------'
```

</p>
</details>

---

### `near validators next`

> Displays details for the next round of validators.
>
> -   total number of seats available
> -   seat price
> -   amount staked
> -   number of seats assigned per validator

-   arguments: `next`
-   options: `default`

**Example:**

```bash
near validators next
```

**Example for `mainnet`:**

```bash
NEAR_ENV=mainnet near validators next
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

```bash
Next validators (total: 49, seat price: 1,983,932):
.----------------------------------------------------------------------------------------------.
|  Status  |                  Validator                   |          Stake           |  Seats  |
|----------|----------------------------------------------|--------------------------|---------|
| Rewarded | cryptium.poolv1.near                         | 13,945,727 -> 14,048,816 | 7       |
| Rewarded | astro-stakers.poolv1.near                    | 11,660,189 -> 11,704,904 | 5       |
| Rewarded | blockdaemon.poolv1.near                      | 11,542,867 -> 11,545,942 | 5       |
| Rewarded | zavodil.poolv1.near                          | 11,183,187 -> 11,204,123 | 5       |
| Rewarded | bisontrails.poolv1.near                      | 10,291,696 -> 10,297,923 | 5       |
| Rewarded | dokiacapital.poolv1.near                     | 7,906,352 -> 8,097,275   | 4       |
| Rewarded | chorusone.poolv1.near                        | 7,480,508 -> 7,500,576   | 3       |
| Rewarded | figment.poolv1.near                          | 6,931,070 -> 6,932,916   | 3       |
| Rewarded | stardust.poolv1.near                         | 6,401,678 -> 6,449,363   | 3       |
| Rewarded | anonymous.poolv1.near                        | 6,291,821 -> 6,293,497   | 3       |
| Rewarded | d1.poolv1.near                               | 6,265,109 -> 6,266,777   | 3       |
| Rewarded | near8888.poolv1.near                         | 6,202,968 -> 6,204,620   | 3       |
| Rewarded | rekt.poolv1.near                             | 5,950,212 -> 5,951,797   | 2       |
| Rewarded | epic.poolv1.near                             | 5,639,256 -> 5,640,758   | 2       |
| Rewarded | fresh.poolv1.near                            | 5,460,410 -> 5,461,811   | 2       |
| Rewarded | buildlinks.poolv1.near                       | 4,838,398 -> 4,839,686   | 2       |
| Rewarded | jubi.poolv1.near                             | 4,805,921 -> 4,807,201   | 2       |
| Rewarded | openshards.poolv1.near                       | 4,644,553 -> 4,776,692   | 2       |
| Rewarded | jazza.poolv1.near                            | 4,563,432 -> 4,564,648   | 2       |
| Rewarded | northernlights.poolv1.near                   | 4,467,978 -> 4,469,168   | 2       |
| Rewarded | inotel.poolv1.near                           | 4,427,152 -> 4,428,331   | 2       |
| Rewarded | baziliknear.poolv1.near                      | 4,261,142 -> 4,290,338   | 2       |
| Rewarded | stakesabai.poolv1.near                       | 4,242,618 -> 4,243,748   | 2       |
| Rewarded | everstake.poolv1.near                        | 4,234,552 -> 4,235,679   | 2       |
| Rewarded | stakin.poolv1.near                           | 4,071,704 -> 4,072,773   | 2       |
| Rewarded | certusone.poolv1.near                        | 3,734,505 -> 3,735,500   | 1       |
| Rewarded | lux.poolv1.near                              | 3,705,394 -> 3,716,381   | 1       |
| Rewarded | staked.poolv1.near                           | 3,683,365 -> 3,684,346   | 1       |
| Rewarded | lunanova.poolv1.near                         | 3,597,231 -> 3,597,836   | 1       |
| Rewarded | appload.poolv1.near                          | 3,133,163 -> 3,152,302   | 1       |
| Rewarded | smart-stake.poolv1.near                      | 3,095,711 -> 3,096,509   | 1       |
| Rewarded | artemis.poolv1.near                          | 3,009,462 -> 3,010,265   | 1       |
| Rewarded | moonlet.poolv1.near                          | 2,790,296 -> 2,948,565   | 1       |
| Rewarded | nearfans.poolv1.near                         | 2,771,137 -> 2,771,875   | 1       |
| Rewarded | nodeasy.poolv1.near                          | 2,692,745 -> 2,693,463   | 1       |
| Rewarded | erm.poolv1.near                              | 2,653,524 -> 2,654,231   | 1       |
| Rewarded | dsrvlabs.poolv1.near                         | 2,542,925 -> 2,571,865   | 1       |
| Rewarded | zkv_staketosupportprivacy.poolv1.near        | 2,548,343 -> 2,549,022   | 1       |
| Rewarded | 08investinwomen_runbybisontrails.poolv1.near | 2,493,123 -> 2,493,787   | 1       |
| Rewarded | masternode24.poolv1.near                     | 2,355,634 -> 2,456,226   | 1       |
| Rewarded | fish.poolv1.near                             | 2,315,249 -> 2,415,831   | 1       |
| Rewarded | electric.poolv1.near                         | 2,400,532 -> 2,401,172   | 1       |
| Rewarded | sparkpool.poolv1.near                        | 2,378,191 -> 2,378,824   | 1       |
| Rewarded | hashquark.poolv1.near                        | 2,376,424 -> 2,377,057   | 1       |
| Rewarded | sharpdarts.poolv1.near                       | 2,332,398 -> 2,332,948   | 1       |
| Rewarded | ashert.poolv1.near                           | 2,103,327 -> 2,103,887   | 1       |
| Rewarded | 01node.poolv1.near                           | 2,058,200 -> 2,058,760   | 1       |
| Rewarded | finoa.poolv1.near                            | 2,012,304 -> 2,015,808   | 1       |
| Rewarded | majlovesreg.poolv1.near                      | 2,005,032 -> 2,005,566   | 1       |
'----------------------------------------------------------------------------------------------'
```

</p>
</details>

---

### `near proposals`

> Displays validator proposals for [epoch](http://docs.near.org/docs/concepts/epoch) after next.
>
> -   expected seat price
> -   status of proposals
> -   previous amount staked and new amount that _will_ be staked
> -   amount of seats assigned per validator

-   arguments: `none`
-   options: `default`

**Example:**

```bash
near proposals
```

**Example for `mainnet`:**

```bash
NEAR_ENV=mainnet near proposals
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

```bash
Proposals for the epoch after next (new: 51, passing: 49, expected seat price = 1,983,932)
.--------------------------------------------------------------------------------------------------------.
|       Status       |                  Validator                   |    Stake => New Stake    |  Seats  |
|--------------------|----------------------------------------------|--------------------------|---------|
| Proposal(Accepted) | cryptium.poolv1.near                         | 13,945,727 => 14,041,766 | 7       |
| Proposal(Accepted) | astro-stakers.poolv1.near                    | 11,660,189 => 11,705,673 | 5       |
| Proposal(Accepted) | blockdaemon.poolv1.near                      | 11,542,867 => 11,545,942 | 5       |
| Proposal(Accepted) | zavodil.poolv1.near                          | 11,183,187 => 11,207,805 | 5       |
| Proposal(Accepted) | bisontrails.poolv1.near                      | 10,291,696 => 10,300,978 | 5       |
| Proposal(Accepted) | dokiacapital.poolv1.near                     | 7,906,352 => 8,097,275   | 4       |
| Proposal(Accepted) | chorusone.poolv1.near                        | 7,480,508 => 7,568,268   | 3       |
| Proposal(Accepted) | figment.poolv1.near                          | 6,931,070 => 6,932,916   | 3       |
| Proposal(Accepted) | stardust.poolv1.near                         | 6,401,678 => 6,449,363   | 3       |
| Proposal(Accepted) | anonymous.poolv1.near                        | 6,291,821 => 6,293,497   | 3       |
| Proposal(Accepted) | d1.poolv1.near                               | 6,265,109 => 6,266,777   | 3       |
| Proposal(Accepted) | near8888.poolv1.near                         | 6,202,968 => 6,204,620   | 3       |
| Proposal(Accepted) | rekt.poolv1.near                             | 5,950,212 => 5,951,797   | 2       |
| Proposal(Accepted) | epic.poolv1.near                             | 5,639,256 => 5,640,758   | 2       |
| Proposal(Accepted) | fresh.poolv1.near                            | 5,460,410 => 5,461,811   | 2       |
| Proposal(Accepted) | buildlinks.poolv1.near                       | 4,838,398 => 4,839,686   | 2       |
| Proposal(Accepted) | jubi.poolv1.near                             | 4,805,921 => 4,807,201   | 2       |
| Proposal(Accepted) | openshards.poolv1.near                       | 4,644,553 => 4,776,692   | 2       |
| Proposal(Accepted) | jazza.poolv1.near                            | 4,563,432 => 4,564,648   | 2       |
| Proposal(Accepted) | northernlights.poolv1.near                   | 4,467,978 => 4,469,168   | 2       |
| Proposal(Accepted) | inotel.poolv1.near                           | 4,427,152 => 4,428,331   | 2       |
| Proposal(Accepted) | baziliknear.poolv1.near                      | 4,261,142 => 4,290,891   | 2       |
| Proposal(Accepted) | stakesabai.poolv1.near                       | 4,242,618 => 4,243,748   | 2       |
| Proposal(Accepted) | everstake.poolv1.near                        | 4,234,552 => 4,235,679   | 2       |
| Proposal(Accepted) | stakin.poolv1.near                           | 4,071,704 => 4,072,773   | 2       |
| Proposal(Accepted) | certusone.poolv1.near                        | 3,734,505 => 3,735,500   | 1       |
| Proposal(Accepted) | lux.poolv1.near                              | 3,705,394 => 3,716,381   | 1       |
| Proposal(Accepted) | staked.poolv1.near                           | 3,683,365 => 3,684,346   | 1       |
| Proposal(Accepted) | lunanova.poolv1.near                         | 3,597,231 => 3,597,836   | 1       |
| Proposal(Accepted) | appload.poolv1.near                          | 3,133,163 => 3,152,302   | 1       |
| Proposal(Accepted) | smart-stake.poolv1.near                      | 3,095,711 => 3,096,509   | 1       |
| Proposal(Accepted) | artemis.poolv1.near                          | 3,009,462 => 3,010,265   | 1       |
| Proposal(Accepted) | moonlet.poolv1.near                          | 2,790,296 => 2,948,565   | 1       |
| Proposal(Accepted) | nearfans.poolv1.near                         | 2,771,137 => 2,771,875   | 1       |
| Proposal(Accepted) | nodeasy.poolv1.near                          | 2,692,745 => 2,693,463   | 1       |
| Proposal(Accepted) | erm.poolv1.near                              | 2,653,524 => 2,654,231   | 1       |
| Proposal(Accepted) | dsrvlabs.poolv1.near                         | 2,542,925 => 2,571,865   | 1       |
| Proposal(Accepted) | zkv_staketosupportprivacy.poolv1.near        | 2,548,343 => 2,549,022   | 1       |
| Proposal(Accepted) | 08investinwomen_runbybisontrails.poolv1.near | 2,493,123 => 2,493,787   | 1       |
| Proposal(Accepted) | masternode24.poolv1.near                     | 2,355,634 => 2,456,226   | 1       |
| Proposal(Accepted) | fish.poolv1.near                             | 2,315,249 => 2,415,831   | 1       |
| Proposal(Accepted) | electric.poolv1.near                         | 2,400,532 => 2,401,172   | 1       |
| Proposal(Accepted) | sparkpool.poolv1.near                        | 2,378,191 => 2,378,824   | 1       |
| Proposal(Accepted) | hashquark.poolv1.near                        | 2,376,424 => 2,377,057   | 1       |
| Proposal(Accepted) | sharpdarts.poolv1.near                       | 2,332,398 => 2,332,948   | 1       |
| Proposal(Accepted) | ashert.poolv1.near                           | 2,103,327 => 2,103,887   | 1       |
| Proposal(Accepted) | 01node.poolv1.near                           | 2,058,200 => 2,059,314   | 1       |
| Proposal(Accepted) | finoa.poolv1.near                            | 2,012,304 => 2,015,808   | 1       |
| Proposal(Accepted) | majlovesreg.poolv1.near                      | 2,005,032 => 2,005,566   | 1       |
| Proposal(Declined) | huobipool.poolv1.near                        | 1,666,976                | 0       |
| Proposal(Declined) | hb436_pool.poolv1.near                       | 500,030                  | 0       |
'--------------------------------------------------------------------------------------------------------'

```

</p>
</details>

---

## REPL

### `near repl`

> Launches NEAR [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) _(an interactive JavaScript programming invironment)_ connected to NEAR.

-   arguments: `none`
-   options: `--accountId`

To launch, run:

```bash
near repl
```

-   You will then be shown a prompt `>` and can begin interacting with NEAR.
-   Try typing the following into your prompt that converts NEAR (Ⓝ) into yoctoNEAR (10^-24):

```bash
nearAPI.utils.format.parseNearAmount('1000')
```

> You can also use an `--accountId` with `near repl`.

**Example:**

```bash
near repl --accountId example-acct.testnet
```

-   Then try console logging `account` after the `>` prompt.

```bash
console.log(account)
```

<details>
<summary><strong>Example Response</strong></summary>
<p>

```json
Account {
  accessKeyByPublicKeyCache: {},
  connection: Connection {
    networkId: 'default',
    provider: JsonRpcProvider { connection: [Object] },
    signer: InMemorySigner { keyStore: [MergeKeyStore] }
  },
  accountId: 'example-acct.testnet',
  _ready: Promise { undefined },
  _state: {
    amount: '98786165075093615800000000',
    locked: '0',
    code_hash: '11111111111111111111111111111111',
    storage_usage: 741,
    storage_paid_at: 0,
    block_height: 21661252,
    block_hash: 'HbAj25dTzP3ssYjNRHov9BQ72UxpHGVqZK1mZwGdGNbo'
  }
}
```

</p>
</details>

> You can also get a private key's public key.

-   First, declare a `privateKey` variable:

```js
const myPrivateKey =
    "3fKM9Rr7LHyzhhzmmedXLvc59rayfh1oUYS3VfUcxwpAFQZtdx1G9aTY6i8hG9mQtYoycTEFTBtatgNKHRtYamrS";
```

-   Then run:

```js
nearAPI.KeyPair.fromString(myPrivateKey).publicKey.toString();
```

With NEAR REPL you have complete access to [`near-api-js`](https://github.com/near/near-api-js) to help you develop on the NEAR platform.

---

## Options

| Option                     | Description                                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `--help`                   |  Show help  [boolean]                                                                                                                  |
| `--version`                |  Show version number  [boolean]                                                                                                        | 
| `--nodeUrl, --node_url`    |  NEAR node URL  [string] [default: "https://rpc.testnet.near.org"]                                                                     |
| `--networkId, --network_id`|  NEAR network ID, allows using different keys based on network  [string] [default: "testnet"]                                          |
| `--helperUrl`              |  NEAR contract helper URL  [string]                                                                                                    |
| `--keyPath`                |  Path to master account key  [string]                                                                                                  |
| `--accountId, --account_id`|  Unique identifier for the account  [string]                                                                                           |
| `--useLedgerKey`           |  Use Ledger for signing with given HD key path  [string] [default: "44'/397'/0'/0'/1'"]                                                |
| `--seedPhrase`             |  Seed phrase mnemonic  [string]                                                                                                        |
| `--seedPath`               |  HD path derivation  [string] [default: "m/44'/397'/0'"]                                                                               |
| `--walletUrl`              |  Website for NEAR Wallet  [string]                                                                                                     |
| `--contractName`           |  Account name of contract  [string]                                                                                                    |
| `--masterAccount`          |  Master account used when creating new accounts  [string]                                                                              |
| `--helperAccount`          |  Expected top-level account for a network  [string]                                                                                    |
| `-v, --verbose`            |  Prints out verbose output  [boolean] [default: false]                                                                                 |

> Got a question? <a href="https://stackoverflow.com/questions/tagged/nearprotocol"> <h8>Ask it on StackOverflow!</h8></a>

## License

This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).
See [LICENSE](LICENSE) and [LICENSE-APACHE](LICENSE-APACHE) for details.
