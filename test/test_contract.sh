# #!/bin/bash
# set -e

# timestamp=$(date +%s)
# contract=testaccount$timestamp-c.testnet
# testaccount=testaccount$timestamp-t.testnet

# echo Creating account
# ./bin/near create $contract --preFunded
# ./bin/near create $testaccount --preFunded

# echo Deploying contract
# ./bin/near deploy $contract ./test/res/guest_book.wasm

# echo Calling functions
# ./bin/near call $contract addMessage '{"text":"TEST"}' --accountId $testaccount > /dev/null

# RESULT=$(./bin/near view $contract getMessages '{}')
# TEXT=$RESULT
# EXPECTED='TEST'
# if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
#     echo FAILURE Unexpected output from near call: $RESULT
#     exit 1
# fi

# # base64-encoded '{"message":"BASE64ROCKS"}'
# ./bin/near call $contract addMessage --base64 'eyJ0ZXh0IjoiVEVTVCJ9' --accountId $testaccount > /dev/null

# RESULT=$(./bin/near view $contract getMessages '{}')
# # TODO: Refactor asserts
# TEXT=$RESULT
# echo $RESULT
# EXPECTED="[ { premium: false, sender: 'test.near', text: 'TEST' }, { premium: false, sender: 'test.near', text: 'TEST' } ]"
# if [[ ! $TEXT =~ .*$EXPECTED.* ]]; then
#     echo FAILURE Unexpected output from near call: $RESULT
#     exit 1
# fi
