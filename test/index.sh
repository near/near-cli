#!/bin/bash
OVERALL_RESULT=0
mkdir ~/.near-config
echo '{"trackingEnaled":false}' >  ~/.near-config/settings.json
for test in ./test/test_*; do
    echo ""
    echo "Running $test"
    "$test"
    if [ $? -ne 0 ]; then 
        echo "$test FAIL"
        OVERALL_RESULT=1
    else
        echo "$test SUCCESS"
    fi
done

exit $OVERALL_RESULT
