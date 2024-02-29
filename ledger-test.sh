# CREATE WITH FAUCET
yarn start create-account miralos-como-sonrien.testnet --useLedgerPK --useFaucet

# CREATE WITH ACCOUNT
yarn start create-account ya.miralos-como-sonrien.testnet --useLedgerPK --useAccount miralos-como-sonrien.testnet --useLedgerKey

# SEND-NEAR
yarn start send-near miralos-como-sonrien.testnet influencer.testnet 0.01 --useLedgerKey
yarn start send-near ya.miralos-como-sonrien.testnet influencer.testnet 0.01 --useLedgerKey

# CALL
yarn start call hello.near-examples.testnet set_greeting '{"greeting":"Hola"}' --accountId miralos-como-sonrien.testnet --useLedgerKey

# DEPLOY (not available yet, maybe in the future with the Ledger App update?)
# yarn start deploy miralos-como-sonrien.testnet ./contract.wasm --signWithLedger

## ADD KEY
yarn start add-key miralos-como-sonrien.testnet ed25519:GnsdHdSrhe8v3MMAQi2bnXR59xMDwdkSRAFZ961ydxWZ --signWithLedger

## DELETE KEY
yarn start delete-key miralos-como-sonrien.testnet ed25519:GnsdHdSrhe8v3MMAQi2bnXR59xMDwdkSRAFZ961ydxWZ --signWithLedger

## DELETE
yarn start delete miralos-como-sonrien.testnet influencer.testnet --useLedgerKey
yarn start delete ya.miralos-como-sonrien.testnet influencer.testnet --signWithLedger
