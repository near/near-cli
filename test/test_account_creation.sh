#!/bin/bash
set -x

timestamp=$(date +%s)
testaccount=testaccount$timestamp.test.near

RESULT=$(./bin/near create-account $testaccount --masterAccount test.far)
echo $RESULT
EXPECTED=".+New account doesn't share the same top-level account.+ "
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output creating account with different master account
    exit 1
fi

RESULT=$(./bin/near create-account tooshortfortla --masterAccount test.far)
echo $RESULT
EXPECTED=".+Top-level accounts must be at least.+ "
if [[ ! "$RESULT" =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output when creating a short top-level account
    exit 1
fi
