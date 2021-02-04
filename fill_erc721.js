let {
  ContractWrappers,
  ERC20TokenContract,
  OrderStatus,
} = require("@0x/contract-wrappers");
let { providerEngine } = require("./provider_engine");
let {
  assetDataUtils,
  generatePseudoRandomSalt,
  signatureUtils,
} = require("@0x/order-utils");
let { BigNumber } = require("@0x/utils");
let { NETWORK_CONFIGS } = require("./configs");
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
  const TestBTokenAddress = "0xd393b1E02dA9831Ff419e22eA105aAe4c47E1253".toLowerCase();
  const TestCTokenAddress = "0xb5eEF11c0b188E9C020254E83E3399b82C62BDdb".toLowerCase();
  const makerAssetAmount = new BigNumber(1);
  const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(0.0000000001),
    DECIMALS
  );

  const makerAssetData = await contractWrappers.devUtils
    .encodeERC1155AssetData(
      TestCTokenAddress,
      [new BigNumber("10")],
      [new BigNumber("10")],
      "0x"
    )
    .callAsync();

    
  const takerAssetData = await contractWrappers.devUtils
    .encodeERC20AssetData(TestBTokenAddress)
    .callAsync();

  let txHash;

  // ERC20
  const erc20Token = new ERC20TokenContract(
    TestBTokenAddress,
    providerEngine()
  );

  let balance = await erc20Token.balanceOf(taker).callAsync();
  console.log(balance);

  let allowance = await erc20Token
    .allowance(taker, contractWrappers.contractAddresses.erc20Proxy)
    .callAsync();
  console.log(allowance);

  // const takerTestBApprovalTxHash = await erc20Token
  //   .approve(
  //     contractWrappers.contractAddresses.erc20Proxy,
  //     UNLIMITED_ALLOWANCE_IN_BASE_UNITS
  //   )
  //   .sendTransactionAsync({ from: taker, gas: 8000000 });
  // console.log(takerTestBApprovalTxHash);

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
    expirationTimeSeconds: parseInt(randomExpiration) + 1000000000,
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

  let zrx = {
    salt: generatePseudoRandomSalt(),
    expirationTimeSeconds: parseInt(randomExpiration) + 1000000000,
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

  const [
    { orderStatus },
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
  } else {
    console.log("Not fillable");
  }

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
