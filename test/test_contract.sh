#!/bin/bash
set -ex
rm  -rf tmp-project

yarn create near-app tmp-project

cd tmp-project

timestamp=$(date +%s)
testaccount=testaccount$timestamp.test.near
../bin/near create-account $testaccount

echo Building contract
yarn install
yarn build:contract

echo Deploying contract
../bin/near deploy --accountId=$testaccount --wasmFile=out/main.wasm

echo Deploying contract to temporary accountId
# TODO: Specify helperUrl in project template
# dev-deploy is supported only on testnet, that is why we are temporary changing NEAR_ENV
export ENV_STORAGE=$(echo $NEAR_ENV)
export NEAR_ENV=testnet
yes | ../bin/near dev-deploy
export NEAR_ENV=$(echo $ENV_STORAGE)

echo Calling functions
../bin/near call $testaccount setGreeting '{"message":"TEST"}' --accountId=test.near

RESULT=$(../bin/near view $testaccount getGreeting '{"accountId":"test.near"}' --accountId=test.near -v)
TEXT=$RESULT
EXPECTED='TEST'
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi

# base64-encoded '{"message":"BASE64ROCKS"}'
../bin/near call $testaccount setGreeting --base64 'eyJtZXNzYWdlIjoiQkFTRTY0Uk9DS1MifQ==' --accountId=test.near

RESULT=$(../bin/near view $testaccount getGreeting '{"accountId":"test.near"}' --accountId=test.near -v)
# TODO: Refactor asserts
TEXT=$RESULT
EXPECTED='BASE64ROCKS'
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi
