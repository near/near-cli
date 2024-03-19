# Changelog

## [unreleased]
- ...

## `4.0.12` [03-19-2024]
- New: Added back Ledger support, please notice that the `--useLedger` does not set the path anymore, use `--ledgerPath` for this.
- New: Added back all `validator` commands.
- New: Added `add-credentials` command to add credentials to the `near-cli` config file.
- Fixes: Multitude of small fixes, see each release note for more details.

## `4.0.0` [01-23-2024]
- Reorganized code to simplify its maintenance.
- New: Fixed `create-account` can now create `TLA`, `sub-accounts` and `.testnet/.near` accounts.
- New: Added `--useFaucet` option to `create-account` command, allowing to fund the account using a faucet.
- Fix: Default wallet is now `MyNearWallet` install of `NearWallet`
- Fix: Removed unnecessary options from commands, e.g. `view` now does not take an `--accountId` or `--masterAccount`.
- Fix: Fixed `--networkId` flag, now it works in all relevant commands.
- Breaking: removed `x-api` option.
- Breaking: removed `stake` command.
- Breaking: removed all `evm` commands.
- Breaking: Removed all `Ledger` support.
- Breaking: removed all `validator` commands.
- Breaking: removed `dev-deploy` command. Users must now create an account (can fund it with a faucet) and deploy to it.
- Breaking: changed `generate-key` command. Now it needs the `--saveImplicit` flag to save the key.
- Breaking: removed `walletUrl`, `nodeUrl` and `helperUrl` options.

## `3.0.0` [11-30-2021]
- Breaking change: added prompts to `delete-key` command. [PR](https://github.com/near/near-cli/pull/890)
- Breaking change: added prompts to `deploy` command. [PR](https://github.com/near/near-cli/pull/883)
- Added `--force`/`-f` flag, that can be used to bypass prompts. Useful in scripting. [PR](https://github.com/near/near-cli/pull/883)