let { ContractWrappers, ERC20TokenContract, OrderStatus } = require('@0x/contract-wrappers');
let { providerEngine } = require('./provider_engine');
let { generatePseudoRandomSalt, signatureUtils } = require('@0x/order-utils');
let { BigNumber } = require('@0x/utils');
let { NETWORK_CONFIGS, TX_DEFAULTS } = require('./configs');
let { DECIMALS, UNLIMITED_ALLOWANCE_IN_BASE_UNITS, NULL_ADDRESS, NULL_BYTES, ZERO } = require('./constants');
let { Web3Wrapper } = require('@0x/web3-wrapper');
let utils = require('./utils');

//TESTB 0xAAeFF7414dD979d4338799113Ca515cC5af76185
//TESTC 0xbA3808635a43D36153D6E4739e9901B130E83bD5
(async () => {
    const contractWrappers = new ContractWrappers(providerEngine(), { chainId: NETWORK_CONFIGS.chainId });
    const web3Wrapper = new Web3Wrapper(providerEngine());
    const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();

    const TestBTokenAddress = "0x33024A622305ca41fDD24C74B84Be23cd4D9F7bB".toLowerCase()
    const TestCTokenAddress = "0xB74F204A81702FB85d66B4C1Cf0873c61d665f25".toLowerCase();
    const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(500), DECIMALS);
    const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.5), DECIMALS);
    const makerAssetData = await contractWrappers.devUtils.encodeERC20AssetData(TestBTokenAddress).callAsync();
    const takerAssetData = await contractWrappers.devUtils.encodeERC20AssetData(TestCTokenAddress).callAsync();
    let txHash;

    // const erc20Token = new ERC20TokenContract(TestBTokenAddress, providerEngine());
    // const makerTestBApprovalTxHash = await erc20Token
    //     .approve(contractWrappers.contractAddresses.erc20Proxy, UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
    //     .sendTransactionAsync({ from: maker, gasPrice: 0 });
    // console.log(makerTestBApprovalTxHash)

    // const etherToken = new ERC20TokenContract(TestCTokenAddress, providerEngine());
    // const takerTestCApprovalTxHash = await etherToken
    //     .approve(contractWrappers.contractAddresses.erc20Proxy, UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
    //     .sendTransactionAsync({ from: taker, gasPrice: 0 });
    // console.log(takerTestCApprovalTxHash)

    // const wethToken = new ERC20TokenContract("0x99c2f0c10a64fdbf466a5f4f24794f7c112c23a4".toLowerCase(), providerEngine());
    // const takerWETHApprovalTxHash = await wethToken
    //     .approve(contractWrappers.contractAddresses.staking, UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
    //     .sendTransactionAsync({ from: taker, gasPrice: 0 });
    // console.log(takerWETHApprovalTxHash);

    // Convert ETH into WETH for taker by depositing ETH into the WETH contract
    // const takerWETHDepositTxHash = await contractWrappers.weth9.deposit().sendTransactionAsync({
    //     value: takerAssetAmount,
    //     from: taker,
    // });
    // console.log(takerWETHDepositTxHash)

    // Set up the Order and fill it
    const randomExpiration = utils.getRandomFutureDateInSeconds();
    const exchangeAddress = contractWrappers.contractAddresses.exchange;

    // Create the order
    const order = {
        chainId: NETWORK_CONFIGS.chainId,
        exchangeAddress,
        makerAddress: maker,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount,
        takerAssetAmount,
        makerAssetData,
        takerAssetData,
        makerFeeAssetData: NULL_BYTES,
        takerFeeAssetData: NULL_BYTES,
        makerFee: ZERO,
        takerFee: ZERO,
    };


    const signedOrder = await signatureUtils.ecSignOrderAsync(providerEngine(), order, maker);

    const [
        { orderStatus, orderHash },
        remainingFillableAmount,
        isValidSignature,
    ] = await contractWrappers.devUtils.getOrderRelevantState(signedOrder, signedOrder.signature).callAsync();
    if (orderStatus === OrderStatus.Fillable && remainingFillableAmount.isGreaterThan(0) && isValidSignature) {
        console.log("Fillable")
    }

    // let res = await contractWrappers.exchange.setProtocolFeeCollectorAddress(NULL_ADDRESS).awaitTransactionSuccessAsync({ from: maker });
    // console.log(res)
    // txHash = await contractWrappers.exchange
    //     .fillOrder(signedOrder, takerAssetAmount, signedOrder.signature)
    //     .awaitTransactionSuccessAsync({
    //         from: taker,
    //         gas: 8000000,
    //         gasPrice: 0,
    //         value: 0
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
