#!/bin/bash
export NODE_ENV=${NODE_ENV:-test}
OVERALL_RESULT=0

SUCCESS=""
FAIL=""

for test in ./test/test_*; do
    echo ""
    echo "Running $test"
    "$test"
    if [ $? -ne 0 ]; then
        echo -e "$test \033[0;31m FAIL \033[0m"
        FAIL="$FAIL$test \033[0;31m FAIL \033[0m\n"
        OVERALL_RESULT=1
    else
        echo -e "$test \033[0;32m SUCCESS \033[0m"
        SUCCESS="$SUCCESS$test \033[0;32m SUCCESS \033[0m\n"
    fi
done

echo ""
echo "Results:"
echo ""
echo -e $SUCCESS
echo -e $FAIL

exit $OVERALL_RESULT
