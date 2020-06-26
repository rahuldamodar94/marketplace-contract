let { ContractWrappers, ERC20TokenContract, ERC721TokenContract, OrderStatus } = require('@0x/contract-wrappers');
let { providerEngine } = require('./provider_engine');
let { assetDataUtils, generatePseudoRandomSalt, signatureUtils } = require('@0x/order-utils');
let { BigNumber } = require('@0x/utils');
let { NETWORK_CONFIGS } = require('./configs');
let { DECIMALS, UNLIMITED_ALLOWANCE_IN_BASE_UNITS, NULL_ADDRESS, NULL_BYTES, ZERO } = require('./constants');
let { Web3Wrapper } = require('@0x/web3-wrapper');
let utils = require('./utils');
let dummyERC721TokenContracts = require('./contracts');

//TESTB 0xAAeFF7414dD979d4338799113Ca515cC5af76185
//TESTC 0xbA3808635a43D36153D6E4739e9901B130E83bD5
(async () => {
    const contractWrappers = new ContractWrappers(providerEngine(), { chainId: NETWORK_CONFIGS.chainId });
    const web3Wrapper = new Web3Wrapper(providerEngine());
    const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();

    console.log(maker)
    console.log(taker)
    const TestBTokenAddress = "0x7947E71Ddbd927EF2e37aED94Fd83697775c5b29".toLowerCase()
    const dummyERC721TokenContract = dummyERC721TokenContracts[0];
    const makerAssetAmount = new BigNumber(1);
    const tokenId = generatePseudoRandomSalt();

    console.log(tokenId)
    const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(100000000000), DECIMALS);
    const makerAssetData = assetDataUtils.encodeERC721AssetData(dummyERC721TokenContract.address, tokenId);
    const takerAssetData = await contractWrappers.devUtils.encodeERC20AssetData(TestBTokenAddress).callAsync();
    let txHash;

    // // Mint a new ERC721 token for the maker
    // const mintTxHash = await dummyERC721TokenContract.mint(maker, tokenId).sendTransactionAsync({ from: maker });
    // console.log(mintTxHash);


    const erc721Token = new ERC721TokenContract("0x5A0C71266635A1B7B7c0ae017937B3c07cD88A78".toLowerCase(), providerEngine());

    console.log(erc721Token)
    // Mint a new ERC721 token for the maker
    const balance = await erc721Token.balanceOf(taker).callAsync();
    console.log('!!!!!!!!!!!!!!!', balance);


    // // Allow the 0x ERC721 Proxy to move ERC721 tokens on behalf of maker
    // const erc721Token = new ERC721TokenContract(dummyERC721TokenContract.address, providerEngine());
    // const makerERC721ApprovalTxHash = await erc721Token
    //     .setApprovalForAll(contractWrappers.contractAddresses.erc721Proxy, true)
    //     .sendTransactionAsync({ from: maker });
    // console.log(makerERC721ApprovalTxHash);


    // const erc20Token = new ERC20TokenContract(TestBTokenAddress, providerEngine());
    // const takerTestBApprovalTxHash = await erc20Token
    //     .approve(contractWrappers.contractAddresses.erc20Proxy, UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
    //     .sendTransactionAsync({ from: taker, gasPrice: 0 });
    // console.log(takerTestBApprovalTxHash)

    // // Set up the Order and fill it
    // const randomExpiration = utils.getRandomFutureDateInSeconds();
    // const exchangeAddress = contractWrappers.contractAddresses.exchange;

    // // Create the order
    // const order = {
    //     chainId: NETWORK_CONFIGS.chainId,
    //     exchangeAddress,
    //     makerAddress: maker,
    //     takerAddress: NULL_ADDRESS,
    //     senderAddress: NULL_ADDRESS,
    //     feeRecipientAddress: NULL_ADDRESS,
    //     expirationTimeSeconds: randomExpiration,
    //     salt: generatePseudoRandomSalt(),
    //     makerAssetAmount,
    //     takerAssetAmount,
    //     makerAssetData,
    //     takerAssetData,
    //     makerFeeAssetData: NULL_BYTES,
    //     takerFeeAssetData: NULL_BYTES,
    //     makerFee: ZERO,
    //     takerFee: ZERO,
    // };

    // console.log(order)


    // const signedOrder = await signatureUtils.ecSignOrderAsync(providerEngine(), order, maker);

    // // const txHashCancel = await contractWrappers.exchange.cancelOrder(order).awaitTransactionSuccessAsync({ from: maker, gasPrice: 0, gas: 8000000 });
    // // console.log(txHashCancel)

    // const [
    //     { orderStatus, orderHash },
    //     remainingFillableAmount,
    //     isValidSignature,
    // ] = await contractWrappers.devUtils.getOrderRelevantState(signedOrder, signedOrder.signature).callAsync();
    // if (orderStatus === OrderStatus.Fillable && remainingFillableAmount.isGreaterThan(0) && isValidSignature) {
    //     console.log("Fillable")
    // }
    // txHash = await contractWrappers.exchange
    //     .fillOrder(signedOrder, takerAssetAmount, signedOrder.signature)
    //     .awaitTransactionSuccessAsync({
    //         from: taker,
    //         gas: 8000000,
    //         gasPrice: 0,
    //         value: utils.calculateProtocolFee([signedOrder])
    //     });
    // console.log(txHash)
    providerEngine().stop();

})().catch(err => {
    console.log('!!!!!!!!!!!!!!!!!!!', err)
})








































































    // const stakingContract = contractWrappers.staking;
    // let res = await stakingContract.addExchangeAddress(contractWrappers.contractAddresses.exchange).awaitTransactionSuccessAsync({
    //     from: maker,
    // });
    // console.log(res)
    // const tx = await stakingContract.removeExchangeAddress(contractWrappers.contractAddresses.exchange).awaitTransactionSuccessAsync({
    //     from: maker,
    // })
    // console.log(tx)

    // const receipt = await stakingContract
    //     .payProtocolFee(maker, taker, new BigNumber(1))
    //     .awaitTransactionSuccessAsync({ from: maker, value: 0 });
    // console.log(receipt)



/**
 * // "15001": {
//     "erc20Proxy": "0xed13914560569d8f902fe1eaa945578a738f7a63",
//     "erc721Proxy": "0xdff51569f6dd4cb74054cd8e14c3aeca06734f47",
//     "erc1155Proxy": "0x7f482ef7427ad95d41a890347a808cf385e68f49",
//     "zrxToken": "0x728135bc0206c497998f31d63134ff5a2de8d7d0",
//     "etherToken": "0x99c2f0c10a64fdbf466a5f4f24794f7c112c23a4",
//     "exchange": "0x299c212a6c4e4d549cd08859c1034f1a90d3e426",
//     "assetProxyOwner": "0x0000000000000000000000000000000000000000",
//     "erc20BridgeProxy": "0xa2ba88cfe6aacd2de352150ab10ce39703f5924d",
//     "zeroExGovernor": "0x0000000000000000000000000000000000000000",
//     "forwarder": "0x77c9f4c2816f62c481d8bdc3bbac6c5e346fe08f",
//     "coordinatorRegistry": "0xcb76b850d50533421bf51d96cd85288a18493bc2",
//     "coordinator": "0x3f1f88c3b0c05329c0c002cb35a1c0b156f4ddc0",
//     "multiAssetProxy": "0x2ef0f62558c45da088c0eaebfe0cd81e7b7cbd76",
//     "staticCallProxy": "0x15fe9aaf1fef57c58fa33d4982e638b482930340",
//     "devUtils": "0x677c8f6304e529b0014b1c65d7fe8b94e9ff418c",
//     "exchangeV2": "0x0f0280f3fa1bacc7e4b60a3ed5735f8756d63b72",
//     "zrxVault": "0x46c99dee25f7ec45a0555a5b15d558a3c6a37c2a",
//     "staking": "0xdb0e9a74d1f957d714c958ac86fa42370731c70c",
//     "stakingProxy": "0x1bd9be970a35a9e0dd35ef7f835b57ccea42264a",
//     "uniswapBridge": "0x0000000000000000000000000000000000000000",
//     "eth2DaiBridge": "0x0000000000000000000000000000000000000000",
//     "erc20BridgeSampler": "0x0e71fd73bd25c76f94ce3771278a3dc9b6babd10",
//     "kyberBridge": "0x0000000000000000000000000000000000000000",
//     "chaiBridge": "0x0000000000000000000000000000000000000000",
//     "dydxBridge": "0x0000000000000000000000000000000000000000",
//     "godsUnchainedValidator": "0x0000000000000000000000000000000000000000",
//     "broker": "0x0000000000000000000000000000000000000000",
//     "chainlinkStopLimit": "0x0000000000000000000000000000000000000000",
//     "curveBridge": "0x0000000000000000000000000000000000000000",
//     "maximumGasPrice": "0x0000000000000000000000000000000000000000",
//     "dexForwarderBridge": "0x0000000000000000000000000000000000000000"
// }
 */