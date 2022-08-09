#!/bin/bash
set -e

timestamp=$(date +%s)
testaccount=testaccount$timestamp$RANDOM.test.near

echo Creating account
./bin/near create-account $testaccount > /dev/null

echo Deploying contract to temporary accountId
STDOUT=$(./bin/near dev-deploy ./test/res/guest_book.wasm > /dev/null)

TEXT=$STDOUT
EXPECTED='You may chose to opt in by running'
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi

echo Invalid tracking parameter
STDOUT=$(./bin/near track bleh > /dev/null)

TEXT=$STDOUT
EXPECTED='Invalid choice of'
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi

echo Activate tracking
STDOUT=$(./bin/near track yes > /dev/null)

TEXT=$STDOUT
EXPECTED='Data tracking enabled'
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi

echo Disable tracking
STDOUT=$(./bin/near track no > /dev/null)

TEXT=$STDOUT
EXPECTED='Data tracking disabled'
if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
    echo FAILURE Unexpected output from near call: $RESULT
    exit 1
fi