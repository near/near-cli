#!/bin/bash
set -ex
rm  -rf tmp-project

yarn create near-app tmp-project

cd tmp-project

timestamp=$(date +%s)
testaccount=testaccount$timestamp.test.near
../bin/near create_account $testaccount

echo Building contract
yarn install
yarn build

echo Deploying contract
../bin/near deploy --accountId=$testaccount --wasmFile=out/main.wasm

echo Deploying contract to temporary accountId
# TODO: Specify helperUrl in project template
../bin/near dev-deploy

echo Calling functions
../bin/near call $testaccount setGreeting '{"message":"TEST"}' --accountId=test.near

RESULT=$(../bin/near view $testaccount getGreeting '{"account_id":"test.near"}' --accountId=test.near)
TEXT=$RESULT
EXPECTED='TEST test.near'
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi
