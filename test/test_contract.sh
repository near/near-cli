#!/bin/bash
set -ex
rm  -rf tmp-project
yarn create near-app --vanilla tmp-project
cd tmp-project
echo Building contract
yarn install
yarn build
echo Creating account
timestamp=$(date +%s)
testaccount=testaccount$timestamp
../bin/near create_account --masterAccount $testaccount
echo Deploying contract
../bin/near deploy --accountId=$testaccount --wasmFile=out/main.wasm
echo Calling functions
RESULT=$(../bin/near call $testaccount welcome '{"name":"TEST"}' --accountId=test.near)
TEXT=$RESULT.text
EXPECTED='Welcome, TEST. Welcome to NEAR Protocol chain'
if [[ ! "$TEXT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near call
    exit 1
fi
echo Viewing functions
RESULT2=$(../bin/near view $testaccount welcome '{"name":"TEST"}' --accountId=test.near)
echo $RESULT2

