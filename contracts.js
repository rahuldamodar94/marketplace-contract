let { DummyERC721TokenContract } = require('@0x/contracts-erc721');

let { NETWORK_CONFIGS } = require('./configs');
let { providerEngine } = require('./provider_engine');

const ERC721_TOKENS_BY_CHAIN_ID = {
    [15001]: ['0x5A0C71266635A1B7B7c0ae017937B3c07cD88A78'],
};

const dummyERC721TokenContracts = [];

module.exports = dummyERC721TokenContracts;

for (const tokenAddress of ERC721_TOKENS_BY_CHAIN_ID[NETWORK_CONFIGS.chainId]) {
    dummyERC721TokenContracts.push(new DummyERC721TokenContract(tokenAddress, providerEngine()));
}
