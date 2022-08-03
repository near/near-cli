#!/bin/bash
set -e

timestamp=$(date +%s)
testaccount=testaccount$timestamp$RANDOM.test.near

echo Creating account
./bin/near create-account $testaccount > /dev/null

echo Deploying contract without init method
./bin/near deploy --accountId $testaccount --wasmFile ./test/res/fungible_token.wasm > /dev/null
ERROR=$(./bin/near view $testaccount get_balance '{"owner_id": "test.near"}' -v 2>&1 >/dev/null | ./node_modules/.bin/strip-ansi)
EXPECTED_ERROR=".+Fun token should be initialized before usage+"
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Expected message requiring initialization of contract
    exit 1
else
    echo Received expected error requiring initialization
fi

# Delete account, remake, redeploy
echo Deleting account: $testaccount
printf 'y\n' | ./bin/near delete $testaccount test.near > /dev/null
echo Recreating account: $testaccount
./bin/near create-account $testaccount > /dev/null
./bin/near deploy --accountId $testaccount --wasmFile ./test/res/fungible_token.wasm --initFunction new --initArgs '{"owner_id": "test.near", "total_supply": "1000000"}' > /dev/null
RESULT=$(./bin/near view $testaccount get_balance '{"owner_id": "test.near"}' -v | ./node_modules/.bin/strip-ansi)
if [[ $RESULT -ne 1000000 ]]; then
    echo FAILURE Expected balance sent in initialization args
    exit 1
else
    echo Received proper balance sent by deploy and initialization args
fi

# Clean up by deleting account, sending back to test.near
./bin/near delete $testaccount test.near > /dev/null
