#!/bin/bash
set -ex

timestamp=$(date +%s)
testaccount=testaccount$timestamp.test.near

RESULT=$(./bin/near create_account $testaccount --masterAccount test.far -v)
echo $RESULT
EXPECTED=".+New account doesn't share the same top-level account.+ "
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view
    exit 1
fi

RESULT=$(./bin/near create_account tooshortfortla -v)
echo $RESULT
EXPECTED=".+Top-level accounts must be at least.+ "
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view
    exit 1
fi
