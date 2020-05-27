let { MnemonicWalletSubprovider, RPCSubprovider, Web3ProviderEngine } = require('@0x/subproviders');
let { providerUtils } = require('@0x/utils');

let { BASE_DERIVATION_PATH, MNEMONIC, NETWORK_CONFIGS } = require('./configs');

const mnemonicWallet = new MnemonicWalletSubprovider({
    mnemonic: MNEMONIC,
    baseDerivationPath: BASE_DERIVATION_PATH,
});

const determineProvider = () => {
    const pe = new Web3ProviderEngine();
    pe.addProvider(mnemonicWallet);
    pe.addProvider(new RPCSubprovider(NETWORK_CONFIGS.rpcUrl));
    providerUtils.startProviderEngine(pe);
    return pe;
};

module.exports = {
    providerEngine: determineProvider
}

