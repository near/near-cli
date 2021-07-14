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

bin/near state $testaccount > ${testaccount}.json
BLOCK_HEIGHT=$(grep block_height ${testaccount}.json | grep -o '[[:digit:]]\+')
BLOCK_HASH=$(grep block_hash ${testaccount}.json | grep -o "[[:alnum:]]\{10,\}")

echo Get account storage --blockId $BLOCK_HEIGHT
RESULT=$(./bin/near view-state $testaccount --blockId $BLOCK_HEIGHT)
EXPECTED="[]"
if [[ ! "$RESULT" == $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view-state
    exit 1
fi

echo Get account storage --blockId $BLOCK_HASH
RESULT=$(./bin/near view-state $testaccount --blockId $BLOCK_HASH)
EXPECTED="[]"
if [[ ! "$RESULT" == $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view-state
    exit 1
fi

set +e

echo Get account storage --blockId $BLOCK_HASH --finality optimistic should fail
EXPECTED="Arguments block-id and finality are mutually exclusive"
./bin/near view-state $testaccount --blockId $BLOCK_HASH  --finality optimistic 2> ${testaccount}.stderr
if [[ ! $? == 1 ]]; then
    echo view-state should fail given both blockId and finality
    exit 1
fi
if [[ ! $(cat ${testaccount}.stderr) =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view-state
    exit 1
fi

echo Get account storage without one of blockId or finality should fail
EXPECTED="Must provide either --finality or --blockId"
./bin/near view-state $testaccount 2> ${testaccount}.stderr
if [[ ! $? == 1 ]]; then
    echo view-state should fail without one of blockId or finality should fail
    exit 1
fi
if [[ ! $(cat ${testaccount}.stderr) =~ $EXPECTED ]]; then
    echo FAILURE Unexpected output from near view-state
    exit 1
fi

set -e


./bin/near delete $testaccount test.near
