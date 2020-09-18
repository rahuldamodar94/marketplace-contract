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
// let dummyERC721TokenContracts = require('./contracts');

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
  console.log(maker, taker);
  const TestBTokenAddress = "0x8CF293247CBFB38cB6474d5f9cE64Dda7db974bc".toLowerCase();
  const TestCTokenAddress = "0x927d909Cda7cD9Fee03f9481210907A3cB51781a".toLowerCase();
  const takerAssetAmount = new BigNumber(1);
  const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(50),
    DECIMALS
  );

  const takerAssetData = await contractWrappers.devUtils
    .encodeERC721AssetData(
      TestBTokenAddress,
      new BigNumber(
        "105045125714244168733981138770329276532473093455428486030848904550754377656049"
      )
    )
    .callAsync();
  const makerAssetData = await contractWrappers.devUtils
    .encodeERC20AssetData(TestCTokenAddress)
    .callAsync();

  // let txHash;

  // // ERC721
  // const erc721Token = new ERC721TokenContract(
  //   TestCTokenAddress,
  //   providerEngine()
  // );

  // const isApprovedForAll = await erc721Token
  //   .isApprovedForAll(maker, contractWrappers.contractAddresses.erc721Proxy)
  //   .callAsync();
  // console.log(isApprovedForAll);

  // const makerERC721ApprovalTxHash = await erc721Token
  //   .setApprovalForAll(contractWrappers.contractAddresses.erc721Proxy, true)
  //   .sendTransactionAsync({ from: maker, gas: 8000000, gasPrice: 1000000000 });
  // console.log(makerERC721ApprovalTxHash);

  // // ERC20
  // const erc20Token = new ERC20TokenContract(
  //   TestBTokenAddress,
  //   providerEngine()
  // );

  // let balance = await erc20Token.balanceOf(taker).callAsync();
  // console.log(balance);

  // let allowance = await erc20Token
  //   .allowance(taker, contractWrappers.contractAddresses.erc20Proxy)
  //   .callAsync();
  // console.log(allowance);

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
    makerAddress: taker,
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
    taker
  );

  let zrx = {
    salt: generatePseudoRandomSalt(),
    expirationTimeSeconds: parseInt(randomExpiration) + 1000000000,
    gasPrice: 10000000000,
    signerAddress: maker,
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
    maker
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

  //   console.log(JSON.stringify(signedOrder));
  //   console.log("##################################");
  //   console.log(JSON.stringify(takerSign));

  txHash = await contractWrappers.exchange
    .executeTransaction(takerSign, takerSign.signature)
    .awaitTransactionSuccessAsync({
      from: taker4,
      gas: 8000000,
      gasPrice: 10000000000,
      value: utils.calculateProtocolFee([signedOrder]),
    });

  console.log(txHash);

  // providerEngine().stop();
})().catch((err) => {
  console.log("!!!!!!!!!!!!!!!!!!!", err);
});
