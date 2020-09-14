let {
  ContractWrappers,
  ERC20TokenContract,
  OrderStatus,
} = require("@0x/contract-wrappers");
let { providerEngine } = require("./provider_engine");
let { generatePseudoRandomSalt, signatureUtils } = require("@0x/order-utils");
let { BigNumber, abiUtils } = require("@0x/utils");
let { NETWORK_CONFIGS, TX_DEFAULTS } = require("./configs");
let { exchangeDataEncoder } = require("@0x/contracts-exchange");
let {
  DECIMALS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  NULL_ADDRESS,
  NULL_BYTES,
  ZERO,
} = require("./constants");
let { Web3Wrapper } = require("@0x/web3-wrapper");
let utils = require("./utils");

(async () => {
  const contractWrappers = new ContractWrappers(providerEngine(), {
    chainId: NETWORK_CONFIGS.chainId,
  });
  const web3Wrapper = new Web3Wrapper(providerEngine());
  const [
    maker,
    taker2,
    taker,
    taker4,
    taker5,
  ] = await web3Wrapper.getAvailableAddressesAsync();

  const TestBTokenAddress = "0xA1811A48e04e788cE00dc26609a3Ec8766bD07D1".toLowerCase();
  const TestCTokenAddress = "0x6F5b486C2d714c11C66b0a7C794316279B3D41e9".toLowerCase();
  const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(10),
    DECIMALS
  );
  const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(10),
    DECIMALS
  );
  const makerAssetData = await contractWrappers.devUtils
    .encodeERC20AssetData(TestBTokenAddress)
    .callAsync();
  const takerAssetData = await contractWrappers.devUtils
    .encodeERC20AssetData(TestCTokenAddress)
    .callAsync();
  let txHash;

  // const erc20Token = new ERC20TokenContract(
  //   TestBTokenAddress,
  //   providerEngine()
  // );
  // const makerTestBApprovalTxHash = await erc20Token
  //   .approve(
  //     contractWrappers.contractAddresses.erc20Proxy,
  //     UNLIMITED_ALLOWANCE_IN_BASE_UNITS
  //   )
  //   .sendTransactionAsync({ from: maker, gas: 8000000, gasPrice: 10000000000 });
  // console.log(makerTestBApprovalTxHash);

  // const etherToken = new ERC20TokenContract(
  //   TestCTokenAddress,
  //   providerEngine()
  // );
  // const takerTestCApprovalTxHash = await etherToken
  //   .approve(
  //     contractWrappers.contractAddresses.erc20Proxy,
  //     UNLIMITED_ALLOWANCE_IN_BASE_UNITS
  //   )
  //   .sendTransactionAsync({ from: taker, gas: 8000000, gasPrice: 10000000000 });
  // console.log(takerTestCApprovalTxHash);

  // Set up the Order and fill it
  const randomExpiration = utils.getRandomFutureDateInSeconds();
  const exchangeAddress = contractWrappers.contractAddresses.exchange;

  // Create the order
  const order = {
    chainId: NETWORK_CONFIGS.chainId,
    exchangeAddress,
    makerAddress: maker,
    takerAddress: NULL_ADDRESS,
    senderAddress: taker4,
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

  const signedOrder = await signatureUtils.ecSignOrderAsync(
    providerEngine(),
    order,
    maker
  );

  // const txHashCancel = await contractWrappers.exchange.cancelOrder(order).awaitTransactionSuccessAsync({ from: maker, gas: 8000000 });
  // console.log(txHashCancel)

  const [
    { orderStatus, orderHash },
    remainingFillableAmount,
    isValidSignature,
  ] = await contractWrappers.devUtils
    .getOrderRelevantState(signedOrder, signedOrder.signature)
    .callAsync();

  if (
    orderStatus === OrderStatus.Fillable &&
    remainingFillableAmount.isGreaterThan(0) &&
    isValidSignature
  ) {
    console.log("Fillable");
  }

  let zrx = {
    salt: generatePseudoRandomSalt(),
    expirationTimeSeconds: randomExpiration,
    gasPrice: 10000000000,
    signerAddress: taker,
    data: exchangeDataEncoder.encodeOrdersToExchangeData("fillOrder", [
      signedOrder,
    ]),
    domain: {
      name: "0x Protocol",
      version: "3.0.0",
      chainId: 80001,
      verifyingContract: contractWrappers.contractAddresses.exchange,
    },
  };

  const takerSign = await signatureUtils.ecSignTransactionAsync(
    providerEngine(),
    zrx,
    taker
  );

  txHash = await contractWrappers.exchange
    .executeTransaction(takerSign, takerSign.signature)
    .awaitTransactionSuccessAsync({
      from: taker4,
      gas: 8000000,
      gasPrice: 10000000000,
      value: utils.calculateProtocolFee([signedOrder]),
    });
  console.log(txHash);
  providerEngine().stop();
})().catch((err) => {
  console.log("!!!!!!!!!!!!!!!!!!!", err);
});
