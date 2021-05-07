#!/bin/bash
set -e

timestamp=$(date +%s)
testaccount=testaccount$timestamp.test.near
./bin/near create-account $testaccount

echo Deploying contract
./bin/near deploy --accountId=$testaccount --wasmFile=./test/res/guest_book.wasm

echo Deploying contract to temporary accountId
# TODO: Specify helperUrl in project template
yes | ./bin/near dev-deploy ./test/res/guest_book.wasm > /dev/null

echo Calling functions
./bin/near call $testaccount addMessage '{"text":"TEST"}' --accountId=test.near > /dev/null

RESULT=$(./bin/near view $testaccount getMessages '{}' --accountId=test.near -v)
TEXT=$RESULT
EXPECTED='TEST'
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi

# base64-encoded '{"message":"BASE64ROCKS"}'
./bin/near call $testaccount addMessage --base64 'eyJ0ZXh0IjoiVEVTVCJ9' --accountId=test.near > /dev/null

RESULT=$(./bin/near view $testaccount getMessages '{}' --accountId=test.near -v)
# TODO: Refactor asserts
TEXT=$RESULT
echo $RESULT
EXPECTED="[ { premium: false, sender: 'test.near', text: 'TEST' }, { premium: false, sender: 'test.near', text: 'TEST' } ]"
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi
