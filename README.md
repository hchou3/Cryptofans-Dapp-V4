# Cryptofans-Dapp-V4
Now Ropsten deployable 

Deployment Instructions:

1. cd into '/Cryptofans-Dapp/cryptofans-contract/contracts' 

2. npm install <= this allows access HDWalletProvider

3. in truffle-config.js   -> line 25: replace "(enter mnemonic here)" with the desired mnemonic to use your wallet.

4. If first deployment: truffle compile

5. To deploy: truffle migrate --reset --network ropsten (or any other network)


Now CD into :'/Cryptofans-Dapp/cryptofans-app'

In your terminal type     “npm install”    and  press enter.

Then in your terminal type  “npm start”, the Marketplace should be accessible on localhost
