let {
  ContractWrappers,
  ERC20TokenContract,
  ERC721TokenContract,
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
let {
  DECIMALS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  NULL_ADDRESS,
  NULL_BYTES,
  ZERO,
} = require("./constants");
let { Web3Wrapper } = require("@0x/web3-wrapper");
let utils = require("./utils");
// let dummyERC721TokenContracts = require('./contracts');

(async () => {
  const contractWrappers = new ContractWrappers(providerEngine(), {
    chainId: NETWORK_CONFIGS.chainId,
  });
  const web3Wrapper = new Web3Wrapper(providerEngine());
  const [maker, taker2, taker] = await web3Wrapper.getAvailableAddressesAsync();
  console.log(maker, taker);
  const TestBTokenAddress = "0x6F5b486C2d714c11C66b0a7C794316279B3D41e9".toLowerCase();
  const TestCTokenAddress = "0x50969c18c51A9A89DC5911997e23fAF3042A4D33".toLowerCase();
  const makerAssetAmount = new BigNumber(1);
  const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(50),
    DECIMALS
  );

  const takerAssetAmount2 = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(60),
    DECIMALS
  );
  const makerAssetData = await contractWrappers.devUtils
    .encodeERC721AssetData(TestCTokenAddress, new BigNumber(102))
    .callAsync();
  const takerAssetData = await contractWrappers.devUtils
    .encodeERC20AssetData(TestBTokenAddress)
    .callAsync();

  let txHash;

  // ERC721
  // const erc721Token = new ERC721TokenContract(
  //   TestCTokenAddress,
  //   providerEngine()
  // );

  // const owner = await erc721Token.ownerOf(new BigNumber(102)).callAsync();
  // console.log(owner);

  // const isApprovedForAll = await erc721Token
  //   .isApprovedForAll(maker, contractWrappers.contractAddresses.erc721Proxy)
  //   .callAsync();
  // console.log(isApprovedForAll);

  // const makerERC721ApprovalTxHash = await erc721Token
  //   .setApprovalForAll(contractWrappers.contractAddresses.erc721Proxy, true)
  //   .sendTransactionAsync({ from: maker, gas: 8000000, gasPrice: 1000000000 });
  // console.log(makerERC721ApprovalTxHash);

  // ERC20
  const erc20Token = new ERC20TokenContract(
    TestBTokenAddress,
    providerEngine()
  );

  // let balance = await erc20Token.balanceOf(taker).callAsync();
  // console.log(balance);

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

  const signedOrder = await signatureUtils.ecSignOrderAsync(
    providerEngine(),
    order,
    maker
  );

  // cancel order
  // const txHashCancel = await contractWrappers.exchange
  //   .cancelOrder(order)
  //   .awaitTransactionSuccessAsync({ from: maker, gasPrice: 0, gas: 8000000 });
  // console.log(txHashCancel);

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

  txHash = await contractWrappers.exchange
    .fillOrder(signedOrder, takerAssetAmount2, signedOrder.signature)
    .awaitTransactionSuccessAsync({
      from: taker,
      gas: 8000000,
      gasPrice: 10000000000,
      value: utils.calculateProtocolFee([signedOrder]),
    });
  console.log(txHash);
  providerEngine().stop();
})().catch((err) => {
  console.log("!!!!!!!!!!!!!!!!!!!", err);
});
