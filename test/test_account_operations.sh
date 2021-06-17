#!/bin/bash
set -e

timestamp=$(date +%s)
testaccount=testaccount$timestamp$RANDOM.test.near

echo Create account
./bin/near create-account $testaccount

echo Get account state
RESULT=$(./bin/near state $testaccount -v | ./node_modules/.bin/strip-ansi)
EXPECTED=".+Account $testaccount.+amount:.+'100000000000000000000000000'.+ "
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view
    exit 1
fi

echo Get account storage --finality final
RESULT=$(./bin/near view-state $testaccount --finality final)
EXPECTED="[]"
if [[ ! "$RESULT" == $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view-state
    exit 1
fi

echo Get account storage --finality optimistic
RESULT=$(./bin/near view-state $testaccount --finality optimistic)
EXPECTED="[]"
if [[ ! "$RESULT" == $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view-state
    exit 1
fi

./bin/near delete $testaccount test.near
