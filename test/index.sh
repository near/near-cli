#!/bin/bash
export NODE_ENV=${NODE_ENV:-test}
if [ "$NODE_ENV" == "betanet" -o "$NODE_ENV" == "development" -o "$NODE_ENV" == "testnet" ]; then
    echo NODE_ENV=$NODE_ENV
    echo -e "\e[31mFAIL\e[0m tests won't run if NODE_ENV=betanet|development|testnet"
    echo please export NODE_ENV=test before testing
    exit 1
fi
OVERALL_RESULT=0
mkdir ~/.near-config
echo '{"trackingEnabled":false}' >  ~/.near-config/settings.json
for test in ./test/test_*; do
    echo ""
    echo "Running $test"
    "$test"
    if [ $? -ne 0 ]; then
        echo -e "\e[31mFAIL\e[0m $test"
        OVERALL_RESULT=1
    else
        echo -e "\e[32mSUCCESS\e[0m $test"
    fi
done

exit $OVERALL_RESULT
