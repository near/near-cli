#!/bin/bash

timestamp=$(date +%s)
contract=test-deploy-$timestamp.testnet

echo Creating account
./bin/near create $contract --useFaucet

echo Deploying contract without init method
./bin/near deploy $contract ./test/res/fungible_token.wasm

ERROR=$(./bin/near view $contract get_balance '{"owner_id":"something.testnet"}' 2>&1 >/dev/null)
EXPECTED_ERROR=".+Fun token should be initialized before usage.+"

if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Expected message requiring initialization of contract
    echo Got: $ERROR
    echo Expected: $EXPECTED_ERROR
    exit 1
fi

# Delete account, remake, redeploy
echo Deleting account: $contract
printf 'y\n' | ./bin/near delete $contract influencer.testnet

# echo Recreating account: $contract
./bin/near create $contract --useFaucet
./bin/near deploy $contract ./test/res/fungible_token.wasm --initFunction new --initArgs "{\"owner_id\":\"$contract\",\"total_supply\":\"1000000\"}"
RESULT=$(./bin/near view $contract get_balance "{\"owner_id\":\"$contract\"}" )
EXPECTED="View call: $contract.get_balance({\"owner_id\":\"$contract\"})
'1000000'"
if [[ ! $RESULT == $EXPECTED ]]; then
    echo FAILURE Expected balance sent in initialization args
    echo Got: $RESULT
    echo Exp: $EXPECTED
    exit 1
fi

# Clean up by deleting account, sending back to test.near
./bin/near delete $contract influencer.testnet --force > /dev/null