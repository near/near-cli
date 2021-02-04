const readline = require('readline');

const askYesNoQuestion = async (question, defaultResponse = false) =>  {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    try {
        for (let attempts = 0; attempts < 10; attempts++) {
            const answer = await new Promise((resolve) => {
                rl.question(
                    question,
                    async (response) => {
                        if (response.toLowerCase() == 'y') {
                            resolve(true);
                        } else if (
                            response.toLowerCase() == 'n'
                        ) {
                            resolve(false);
                        }
                        resolve(undefined);
                    }
                );
            });
            if (answer !== undefined) {
                return answer;
            }
        }

        // Use default response when no valid response is obtained
        return defaultResponse;
    } finally {
        rl.close();
    }
};

module.exports = { askYesNoQuestion };