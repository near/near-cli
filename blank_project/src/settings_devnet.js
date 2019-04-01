const settings = {
  nodeUrl: "https://studio.nearprotocol.com/devnet",
  baseUrl: "https://studio.nearprotocol.com/contract-api",
  contractName: "hellotest",
  deps: {
    createAccount: (accountId, publicKey) =>
      nearlib.dev.createAccountWithContractHelper(
        { baseUrl: "https://studio.nearprotocol.com/contract-api"}, accountId, publicKey)
  }
};
