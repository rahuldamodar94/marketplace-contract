let { BigNumber } = require('@0x/utils');
let { TX_DEFAULTS } = require('./configs');
let { ONE_SECOND_MS, TEN_MINUTES_MS } = require('./constants');

const getRandomFutureDateInSeconds = () => {
    return new BigNumber(Date.now() + TEN_MINUTES_MS).div(ONE_SECOND_MS).integerValue(BigNumber.ROUND_CEIL);
};

const calculateProtocolFee = (
    orders,
    gasPrice = TX_DEFAULTS.gasPrice,
) => {
    return new BigNumber(150000).times(gasPrice).times(orders.length);
};

module.exports = {
    getRandomFutureDateInSeconds,
    calculateProtocolFee
}
