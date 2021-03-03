#!/bin/bash
set -ex
rm -rf tmp-project
# create-near-app only used to get access to test.near key file
yarn create near-app tmp-project
cd tmp-project
timestamp=$(date +%s)
testaccount=testaccount$timestamp.test.near
echo Creating account
../bin/near create-account $testaccount

echo Deploying contract without init method
../bin/near deploy --accountId $testaccount --wasmFile ../test/res/fungible_token.wasm
ERROR=$(../bin/near view $testaccount get_balance '{"owner_id": "test.near"}' -v 2>&1 >/dev/null | ../node_modules/.bin/strip-ansi)
echo $ERROR
EXPECTED_ERROR=".+Fun token should be initialized before usage+"
if [[ ! "$ERROR" =~ $EXPECTED_ERROR ]]; then
    echo FAILURE Expected message requiring initialization of contract
    exit 1
else
    echo Received expected error requiring initialization
fi

# Delete account, remake, redeploy
../bin/near delete $testaccount test.near
../bin/near create-account $testaccount
../bin/near deploy --accountId $testaccount --wasmFile ../test/res/fungible_token.wasm --initFunction new --initArgs '{"owner_id": "test.near", "total_supply": "1000000"}'
RESULT=$(../bin/near view $testaccount get_balance '{"owner_id": "test.near"}' -v | ../node_modules/.bin/strip-ansi)
echo $RESULT
if [[ $RESULT -ne 1000000 ]]; then
    echo FAILURE Expected balance sent in initialization args
    exit 1
else
    echo Received proper balance sent by deploy and initialization args
fi

# Clean up by deleting account, sending back to test.near
../bin/near delete $testaccount test.near
